import { Injectable, Inject } from '@nestjs/common';
import { WebhookDto } from '../dto/webhook.dto';
import { MensagemClienteService } from './mensagem-cliente.service';
import { RedisService } from './redis.service';
import { ApiService } from './api.service';
import { TimeService } from './time.service';
import { TemplateService } from './template.service';
import { GoogleDriveService } from './google-drive.service';
import { FileStorageService } from './file-storage.service';
import { CHATBOT_CONSTANTS, CHATBOT_MESSAGES } from '../constants/chatbot.constants';

@Injectable()
export class ChatbotService {
  constructor(
    @Inject('MensagemClienteService')
    private mensagemService: MensagemClienteService | any,
    @Inject('RedisService')
    private redisService: RedisService | any,
    @Inject('ApiService')
    private apiService: ApiService | any,
    @Inject('GoogleDriveService')
    private googleDriveService: GoogleDriveService | any,
    @Inject('FileStorageService')
    private fileStorageService: FileStorageService | any,
    private timeService: TimeService,
    private templateService: TemplateService,
  ) {}

  async processWebhook(webhookData: WebhookDto): Promise<void> {
    try {
      const { data } = webhookData.body;
      
      // Validação inicial - Se a mensagem não for válida para processamento
      if (!this.isValidMessage(data)) {
        return;
      }

      // Debounce - aguarda 3 segundos apenas para mensagens de texto
      if (!this.isMediaFile(data)) {
        await this.delay(3000);

        // Armazenar mensagem no Redis
        await this.storeLastMessage(data.contactId, data.body);

        // Buscar última mensagem armazenada
        const lastStoredMessage = await this.getLastMessage(data.contactId);

        // Verificar se é a mesma mensagem (debounce)
        if (data.body && lastStoredMessage === data.body) {
          console.log(`⏭️ Mensagem duplicada ignorada para ${data.contactId}: ${data.body}`);
          return;
        }
      }

      // Analisar ticket do cliente
      const clientData = await this.mensagemService.findByContactId(data.contactId);
      
      if (!clientData) {
        // Cliente novo - executar processo de primeiro contato
        await this.handleFirstContact(data);
        return;
      }

      // Verificar se o chatbot deve parar de processar para este cliente
      if (this.shouldStopChatbot(clientData)) {
        console.log(`⏹️ Chatbot pausado para cliente ${data.contactId} - Em atendimento ou finalizado`);
        
        // Se está em atendimento pessoal, apenas atualizar última mensagem
        if (this.isInPersonalService(clientData)) {
          await this.handlePersonalService(data);
        }
        return;
      }

      // Verificar se é arquivo de mídia para armazenamento
      if (this.isMediaFile(data)) {
        await this.processMediaFile(data, clientData);
        // Continuar processamento normal após armazenar arquivo
      }

      // Verificar se o serviço está fechado (tempo de inatividade)
      if (await this.isServiceClosed(clientData)) {
        await this.handleClosedService(data, clientData);
        return;
      }

      // Processar estado do cliente
      await this.processClientState(data, clientData);
      
    } catch (error) {
      console.error('❌ Erro crítico no processamento do webhook:', error);
      
      // Em caso de erro crítico, tentar notificar o cliente
      try {
        if (webhookData.body?.data?.ticketId) {
          const errorTemplate = this.templateService.getSystemErrorTemplate();
          await this.apiService.sendMessage(webhookData.body.data.ticketId, errorTemplate.body);
        }
      } catch (notificationError) {
        console.error('❌ Falha ao notificar erro para o cliente:', notificationError);
      }
    }
  }

  private isValidMessage(data: any): boolean {
    // Validações básicas de dados obrigatórios
    if (!data) {
      console.warn(CHATBOT_MESSAGES.VALIDATION.WEBHOOK_DATA_MISSING);
      return false;
    }

    if (!data.contactId || !data.ticketId) {
      console.warn(CHATBOT_MESSAGES.VALIDATION.CONTACT_ID_MISSING, { 
        contactId: data.contactId, 
        ticketId: data.ticketId 
      });
      return false;
    }

    if (!data.ticket?.contact) {
      console.warn(CHATBOT_MESSAGES.VALIDATION.CONTACT_DATA_MISSING);
      return false;
    }

    // Validações de tipos inválidos
    if (CHATBOT_CONSTANTS.INVALID_MEDIA_TYPES.includes(data.mediaType)) {
      console.log(`${CHATBOT_MESSAGES.INFO.MEDIA_TYPE_IGNORED}: ${data.mediaType}`);
      return false;
    }

    if (data.fromMe) {
      console.log(CHATBOT_MESSAGES.INFO.BOT_MESSAGE_IGNORED);
      return false;
    }

    if (data.ticket.contact.isGroup) {
      console.log(CHATBOT_MESSAGES.INFO.GROUP_MESSAGE_IGNORED);
      return false;
    }

    return true;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async storeLastMessage(contactId: number, message: string): Promise<void> {
    const key = `chatbot:last:user:${contactId}`;
    await this.redisService.set(key, message);
  }

  private async getLastMessage(contactId: number): Promise<string | null> {
    const key = `chatbot:last:user:${contactId}`;
    return await this.redisService.get(key);
  }

  private async handleClosedService(data: any, clientData: any): Promise<void> {
    // Comparar tempo da última mensagem
    if (clientData.lastmessage) {
      const timeComparison = this.timeService.compareTime(clientData.lastmessage);
      
      if (timeComparison.passedOneHour) {
        // Enviar template de desencontro
        const template = this.templateService.getReconnectionTemplate();
        await this.apiService.sendMessage(data.ticketId, template);
        
        // Reiniciar chatbot
        await this.mensagemService.restartChatbot(data.contactId, data.ticketId);
      }
    }
  }

  private async handlePersonalService(data: any): Promise<void> {
    // Recuperar ticket e atualizar última mensagem
    const ticket = await this.apiService.getTicket(data.ticketId);
    await this.mensagemService.updateLastMessage(data.contactId, ticket.updatedAt);
  }

  private async processClientState(data: any, clientData: any): Promise<void> {
    // Validar se o cliente tem um estado válido
    if (!clientData.state || clientData.state < 1) {
      console.warn(`❌ Estado inválido para cliente ${data.contactId}: ${clientData.state}`);
      await this.mensagemService.updateClient(data.contactId, { state: 1 });
      await this.handleState1(data);
      return;
    }

    switch (clientData.state) {
      case 1:
        await this.handleState1(data);
        break;
      case 2:
        await this.handleState2(data);
        break;
      case 3:
        await this.handleState3(data);
        break;
      case 4:
        await this.handleState4(data);
        break;
      case 5:
        await this.handleState5(data);
        break;
      // Adicionar outros estados conforme necessário
      default:
        console.warn(`⚠️ Estado ${clientData.state} não implementado para cliente ${data.contactId}`);
        // Resetar para estado inicial em caso de estado não implementado
        await this.mensagemService.updateClient(data.contactId, { state: 1 });
        await this.handleState1(data);
        break;
    }
  }

  private async handleState1(data: any): Promise<void> {
    // Estado inicial - escolha de serviço (equivale ao workflow "Escolha_de_servi_o.json")
    if (!data.body || typeof data.body !== 'string') {
      console.warn(`❌ Entrada inválida no estado 1 para cliente ${data.contactId}: ${data.body}`);
      const welcomeTemplate = this.templateService.getWelcomeTemplate();
      await this.apiService.sendMessage(data.ticketId, welcomeTemplate);
      return;
    }

    const selectedOption = data.body.trim();
    
    switch (selectedOption) {
      case '1':
        // Orçamento - continua no chatbot
        await this.handleOrcamentoChoice(data);
        break;
      case '2':
        // Projeto Executivo - redireciona para atendente
        await this.handleProjetoExecutivoChoice(data);
        break;
      case '3':
        // Assistência Técnica - redireciona para atendente
        await this.handleAssistenciaTecnicaChoice(data);
        break;
      case '4':
        // Financeiro - redireciona para atendente
        await this.handleFinanceiroChoice(data);
        break;
      default:
        // Opção inválida - reenviar template de boas-vindas
        console.log(`⚠️ Opção inválida escolhida no estado 1: ${selectedOption}`);
        const welcomeTemplate = this.templateService.getWelcomeTemplate();
        await this.apiService.sendMessage(data.ticketId, welcomeTemplate);
        break;
    }
  }

  private async handleState2(data: any): Promise<void> {
    // Estado 2 - Cliente escolheu "Orçamento", agora pergunta sobre projeto
    if (!data.body || typeof data.body !== 'string') {
      console.warn(`❌ Entrada inválida no estado 2 para cliente ${data.contactId}: ${data.body}`);
      const orcamentoTemplate = this.templateService.getOrcamentoTemplate();
      await this.apiService.sendMessage(data.ticketId, orcamentoTemplate);
      return;
    }

    const selectedOption = data.body.trim();
    
    if (selectedOption === '1') {
      // Tem projeto
      const template = this.templateService.getProjectTemplate();
      await this.apiService.sendMessage(data.ticketId, template);
      
      await this.mensagemService.updateClient(data.contactId, {
        state: 4,
        fase_arquivos: 'projeto'
      });
    } else if (selectedOption === '2') {
      // Não tem projeto
      const template = this.templateService.getFloorPlanTemplate();
      await this.apiService.sendMessage(data.ticketId, template);
      
      await this.mensagemService.updateClient(data.contactId, {
        state: 5,
        fase_arquivos: 'plantabaixa'
      });
    } else {
      // Opção inválida - reenviar template de orçamento
      console.log(`⚠️ Opção inválida escolhida no estado 2: ${selectedOption}`);
      const orcamentoTemplate = this.templateService.getOrcamentoTemplate();
      await this.apiService.sendMessage(data.ticketId, orcamentoTemplate);
    }
  }

  private async handleState3(data: any): Promise<void> {
    // Estado 3 - Cliente está no ambiente do lead, pergunta sobre projeto
    if (!data.body || typeof data.body !== 'string') {
      console.warn(`❌ Entrada inválida no estado 3 para cliente ${data.contactId}: ${data.body}`);
      const leadTemplate = this.templateService.getLeadEnvironmentTemplate();
      await this.apiService.sendMessage(data.ticketId, leadTemplate);
      return;
    }

    const selectedOption = data.body.trim();
    
    if (selectedOption === '1') {
      // Tem projeto
      const template = this.templateService.getProjectTemplate();
      await this.apiService.sendMessage(data.ticketId, template);
      
      await this.mensagemService.updateClient(data.contactId, {
        state: 4,
        fase_arquivos: 'projeto'
      });
    } else if (selectedOption === '2') {
      // Não tem projeto
      const template = this.templateService.getFloorPlanTemplate();
      await this.apiService.sendMessage(data.ticketId, template);
      
      await this.mensagemService.updateClient(data.contactId, {
        state: 5,
        fase_arquivos: 'plantabaixa'
      });
    } else {
      // Opção inválida - reenviar template do ambiente do lead
      console.log(`⚠️ Opção inválida escolhida no estado 3: ${selectedOption}`);
      const leadTemplate = this.templateService.getLeadEnvironmentTemplate();
      await this.apiService.sendMessage(data.ticketId, leadTemplate);
    }
  }

  private async handleState4(data: any): Promise<void> {
    // Estado: enviando arquivos do projeto
    if (this.isMediaFile(data) || data.body === 'OK') {
      // Arquivo enviado ou confirmação OK
      if (data.body === 'OK') {
        // Finalizar processo de envio de arquivos
        const finalizationTemplate = this.templateService.getProjectFinalizationTemplate();
        await this.apiService.sendMessage(data.ticketId, finalizationTemplate);
        
        await this.mensagemService.updateClient(data.contactId, {
          state: 6, // Próximo estado
          ematendimento: true // Transferir para atendimento humano
        });
      }
      // Se for arquivo, já foi processado pelo processMediaFile
    } else {
      // Mensagem inválida - reenviar template de projeto
      const projectTemplate = this.templateService.getProjectTemplate();
      await this.apiService.sendMessage(data.ticketId, projectTemplate);
    }
  }

  private async handleState5(data: any): Promise<void> {
    // Estado: pergunta sobre planta baixa
    if (!data.body || typeof data.body !== 'string') {
      console.warn(`❌ Entrada inválida no estado 5 para cliente ${data.contactId}: ${data.body}`);
      const floorPlanTemplate = this.templateService.getFloorPlanTemplate();
      await this.apiService.sendMessage(data.ticketId, floorPlanTemplate);
      return;
    }

    const selectedOption = data.body.trim();
    
    if (selectedOption === '1') {
      // Tem medidas/planta baixa
      const template = this.templateService.getHasFloorPlanTemplate();
      await this.apiService.sendMessage(data.ticketId, template);
      
      await this.mensagemService.updateClient(data.contactId, {
        state: 4,
        fase_arquivos: 'plantabaixa'
      });
    } else if (selectedOption === '2') {
      // Não tem medidas - agendar medição
      const schedulingTemplate = this.templateService.getScheduleMeasurementTemplate();
      await this.apiService.sendMessage(data.ticketId, schedulingTemplate);
      
      await this.mensagemService.updateClient(data.contactId, {
        state: 7, // Estado para agendamento
        ematendimento: true // Transferir para atendimento
      });
    } else {
      // Opção inválida - reenviar template de planta baixa
      console.log(`⚠️ Opção inválida escolhida no estado 5: ${selectedOption}`);
      const floorPlanTemplate = this.templateService.getFloorPlanTemplate();
      await this.apiService.sendMessage(data.ticketId, floorPlanTemplate);
    }
  }

  /**
   * Processa o primeiro contato de um cliente novo
   * Equivale ao workflow "Primeiro_contato.json"
   */
  private async handleFirstContact(data: any): Promise<void> {
    try {
      // 1. Processar primeiro contato no banco (upsert)
      await this.mensagemService.processFirstContact(data.contactId, data.ticketId);

      // 2. Enviar template inicial da Vera D'or (equivale ao "Template Inicial")
      const welcomeTemplate = this.templateService.getWelcomeTemplate();
      await this.apiService.sendMessage(data.ticketId, welcomeTemplate);

      // 3. Recuperar ticket para atualizar última mensagem
      const ticket = await this.apiService.getTicket(data.ticketId);
      
      // 4. Atualizar data da última mensagem
      if (ticket && ticket.updatedAt) {
        await this.mensagemService.updateLastMessage(data.contactId, ticket.updatedAt);
      }

      console.log(`✅ Primeiro contato processado para cliente ${data.contactId}`);
      
    } catch (error) {
      console.error('❌ Erro ao processar primeiro contato:', error);
      
      // Em caso de erro, criar registro básico e tentar continuar o fluxo
      try {
        await this.mensagemService.createOrUpdate({
          contactid: data.contactId,
          ticketid: data.ticketId,
          lastmessage: data.updatedAt || new Date().toISOString(),
          state: 1,
          nome: data.ticket?.contact?.name || 'Cliente'
        });

        // Tentar enviar template mesmo com erro no banco
        const welcomeTemplate = this.templateService.getWelcomeTemplate();
        await this.apiService.sendMessage(data.ticketId, welcomeTemplate);
        
        console.log(`⚠️ Primeiro contato criado com fallback para cliente ${data.contactId}`);
      } catch (fallbackError) {
        console.error('❌ Erro crítico no fallback do primeiro contato:', fallbackError);
        throw fallbackError; // Propagar erro crítico para o processWebhook
      }
    }
  }

  /**
   * Processa escolha do serviço "Orçamento" (opção 1)
   * Equivale ao fluxo para opção 1 do workflow "Escolha_de_servi_o.json"
   * Inclui criação do ambiente do lead (workflow "Amb__Lead_no_Driver.json")
   */
  private async handleOrcamentoChoice(data: any): Promise<void> {
    try {
      // 1. Buscar dados do cliente para obter o nome
      const clientData = await this.mensagemService.findByContactId(data.contactId);
      const customerName = data.ticket?.contact?.name || clientData?.nome || 'Cliente';

      // 2. Criar ambiente do lead no Google Drive (equivale ao workflow "Amb__Lead_no_Driver.json")
      const leadEnvironment = await this.googleDriveService.createLeadEnvironment({
        customerName: customerName,
        ticketId: data.ticketId,
        contactId: data.contactId
      });

      // 3. Enviar template de orçamento (com opções de projeto)
      const leadTemplate = this.templateService.getLeadEnvironmentTemplate();
      await this.apiService.sendMessage(data.ticketId, leadTemplate);

      // 4. Atualizar estado para 3 e salvar local do arquivo
      await this.mensagemService.updateClient(data.contactId, {
        state: 3,
        local_arquivo: leadEnvironment.folderId
      });

      // 5. Recuperar ticket e atualizar última mensagem
      const ticket = await this.apiService.getTicket(data.ticketId);
      if (ticket && ticket.updatedAt) {
        await this.mensagemService.updateLastMessage(data.contactId, ticket.updatedAt);
      }

      console.log(`Ambiente do lead criado para cliente ${data.contactId}:`, leadEnvironment);
    } catch (error) {
      console.error('Erro ao processar escolha de orçamento com ambiente do lead:', error);
      
      // Fallback: enviar template simples se criação do ambiente falhar
      const orcamentoTemplate = this.templateService.getOrcamentoTemplate();
      await this.apiService.sendMessage(data.ticketId, orcamentoTemplate);

      await this.mensagemService.updateClient(data.contactId, {
        state: 2,
        fase_arquivos: 'projeto'
      });
    }
  }

  /**
   * Processa escolha do serviço "Projeto Executivo" (opção 2)
   * Equivale ao fluxo para opção 2 do workflow "Escolha_de_servi_o.json"
   */
  private async handleProjetoExecutivoChoice(data: any): Promise<void> {
    try {
      // Enviar template de projeto executivo
      const projetoTemplate = this.templateService.getProjetoExecutivoTemplate();
      await this.apiService.sendMessage(data.ticketId, projetoTemplate);

      // Redirecionar para usuário 6 (Projeto Executivo)
      await this.apiService.redirectTicket(data.ticketId, 6);

      // Atualizar estado para em atendimento
      await this.mensagemService.updateClient(data.contactId, {
        ematendimento: true,
        state: 3
      });

      // Atualizar status do ticket para pendente
      await this.apiService.updateTicketStatus(data.ticketId, 'pending');

      console.log(`Cliente ${data.contactId} redirecionado para Projeto Executivo`);
    } catch (error) {
      console.error('Erro ao processar escolha de projeto executivo:', error);
    }
  }

  /**
   * Processa escolha do serviço "Assistência Técnica" (opção 3)
   * Equivale ao fluxo para opção 3 do workflow "Escolha_de_servi_o.json"
   */
  private async handleAssistenciaTecnicaChoice(data: any): Promise<void> {
    try {
      // Enviar template de assistência técnica
      const assistenciaTemplate = this.templateService.getAssistenciaTecnicaTemplate();
      await this.apiService.sendMessage(data.ticketId, assistenciaTemplate);

      // Redirecionar para usuário 58 (Assistência Técnica)
      await this.apiService.redirectTicket(data.ticketId, 58);

      // Atualizar estado para em atendimento
      await this.mensagemService.updateClient(data.contactId, {
        ematendimento: true,
        state: 3
      });

      // Atualizar status do ticket para pendente
      await this.apiService.updateTicketStatus(data.ticketId, 'pending');

      console.log(`Cliente ${data.contactId} redirecionado para Assistência Técnica`);
    } catch (error) {
      console.error('Erro ao processar escolha de assistência técnica:', error);
    }
  }

  /**
   * Processa escolha do serviço "Financeiro" (opção 4)
   * Equivale ao fluxo para opção 4 do workflow "Escolha_de_servi_o.json"
   */
  private async handleFinanceiroChoice(data: any): Promise<void> {
    try {
      // Enviar template de financeiro
      const financeiroTemplate = this.templateService.getFinanceiroTemplate();
      await this.apiService.sendMessage(data.ticketId, financeiroTemplate);

      // Redirecionar para usuário 49 (Financeiro)
      await this.apiService.redirectTicket(data.ticketId, 49);

      // Atualizar estado para em atendimento
      await this.mensagemService.updateClient(data.contactId, {
        ematendimento: true,
        state: 3
      });

      // Atualizar status do ticket para pendente
      await this.apiService.updateTicketStatus(data.ticketId, 'pending');

      console.log(`Cliente ${data.contactId} redirecionado para Financeiro`);
    } catch (error) {
      console.error('Erro ao processar escolha de financeiro:', error);
    }
  }

  /**
   * Verifica se a mensagem contém arquivo de mídia
   */
  private isMediaFile(data: any): boolean {
    return CHATBOT_CONSTANTS.VALID_MEDIA_TYPES.includes(data.mediaType) && data.mediaPath;
  }

  /**
   * Processa arquivos de mídia (equivale ao workflow "Armazenar_arquivos.json")
   */
  private async processMediaFile(data: any, clientData: any): Promise<void> {
    try {
      console.log(`📁 Processando arquivo de mídia para cliente ${data.contactId}`);

      // Preparar dados para o FileStorageService
      const fileStorageData = {
        id: data.id,
        mediaPath: data.mediaPath,
        body: data.body || '',
        mediaType: data.mediaType,
        ticketId: data.ticketId,
        contactId: data.contactId,
        userId: data.userId || 0,
        nome: data.ticket?.contact?.name || clientData.nome || 'Cliente',
        emAtendimento: clientData.ematendimento || false,
        finalizoutriagem: clientData.finalizoutriagem || false,
        stopchatbot: clientData.stopchatbot || false,
        templateId: clientData.templateid || null,
        pararmensagem: clientData.pararmensagem || false,
        lastmessage: clientData.lastmessage || new Date().toISOString(),
        state: clientData.state || 0,
        fase_arquivos: clientData.fase_arquivos || 'projeto'
      };

      // Processar armazenamento do arquivo
      const result = await this.fileStorageService.processFileStorage(fileStorageData);

      if (result.success) {
        console.log(`✅ Arquivo armazenado com sucesso: ${result.fileName}`);
        
        // Enviar confirmação para o cliente
        const confirmationMessage = this.templateService.getFileStorageConfirmationTemplate(
          result.fileName || 'arquivo'
        );
        await this.apiService.sendMessage(data.ticketId, confirmationMessage.body);

        // Atualizar última mensagem
        const ticket = await this.apiService.getTicket(data.ticketId);
        if (ticket && ticket.updatedAt) {
          await this.mensagemService.updateLastMessage(data.contactId, ticket.updatedAt);
        }

      } else {
        console.error(`❌ Erro ao armazenar arquivo: ${result.error}`);
        
        // Enviar mensagem de erro para o cliente
        const errorMessage = this.templateService.getFileStorageErrorTemplate();
        await this.apiService.sendMessage(data.ticketId, errorMessage.body);
      }

    } catch (error) {
      console.error('❌ Erro ao processar arquivo de mídia:', error);
      
      // Fallback: enviar mensagem de erro genérica
      try {
        const errorMessage = this.templateService.getFileStorageErrorTemplate();
        await this.apiService.sendMessage(data.ticketId, errorMessage.body);
      } catch (sendError) {
        console.error('❌ Erro ao enviar mensagem de erro:', sendError);
      }
    }
  }

  /**
   * Verifica se o chatbot deve parar de processar mensagens para este cliente
   */
  private shouldStopChatbot(clientData: any): boolean {
    return clientData.stopchatbot || 
           clientData.ematendimento || 
           clientData.finalizoutriagem;
  }

  /**
   * Verifica se o cliente está em atendimento personalizado
   */
  private isInPersonalService(clientData: any): boolean {
    return clientData.ematendimento === true;
  }

  /**
   * Verifica se o serviço está fechado (baseado no tempo da última mensagem)
   */
  private async isServiceClosed(clientData: any): Promise<boolean> {
    if (!clientData.lastmessage) {
      return false;
    }

    const timeComparison = this.timeService.compareTime(clientData.lastmessage);
    return timeComparison.passedOneHour;
  }
}
