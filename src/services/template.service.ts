import { Injectable } from '@nestjs/common';
import { MessageTemplate } from '../interfaces/api.interfaces';

@Injectable()
export class TemplateService {
  /**
   * Template de boas-vindas para primeiro contato
   * Baseado no workflow "Primeiro_contato.json"
   */
  getWelcomeTemplate(): MessageTemplate {
    return {
      body: `Olá! Eu sou a Vera D'or, sua assistente virtual 💬

Estou aqui para te ajudar a transformar seus ambientes com móveis planejados do jeitinho que você sempre sonhou! ✨

Como posso te ajudar hoje? Escolha uma das opções abaixo para começarmos:

1 - Orçamento 💰
2 - Projeto Executivo 📐
3 - Assistência Técnica 🛠️
4 - Financeiro 📊

Caso queira reiniciar o atendimento, é só enviar RESET (pode ser em qualquer momento da conversa)

👉 É só me enviar o número da opção desejada!`
    };
  }

  /**
   * Template para Projeto Executivo
   * Baseado no workflow "Escolha_de_servi_o.json"
   */
  getProjetoExecutivoTemplate(): MessageTemplate {
    return {
      body: `Ótima escolha!
Vou te redirecionar com um especialista do nosso time de Projeto Executivo, que vai te ajudar a dar vida às suas ideias com todo o cuidado e atenção que você merece.

Só um instantinho que já estamos te redirecionando...`
    };
  }

  /**
   * Template para Assistência Técnica
   * Baseado no workflow "Escolha_de_servi_o.json"
   */
  getAssistenciaTecnicaTemplate(): MessageTemplate {
    return {
      body: `Entendido!
Vou te encaminhar para o nosso time de Assistência Técnica. Eles vão te ajudar rapidinho com qualquer dúvida ou necessidade que você tenha.

Aguarde só um instante enquanto lhe redirecionamos!`
    };
  }

  /**
   * Template para Financeiro
   * Baseado no workflow "Escolha_de_servi_o.json"
   */
  getFinanceiroTemplate(): MessageTemplate {
    return {
      body: `Certo!
Vou te direcionar para o setor Financeiro, onde nossa equipe vai te auxiliar com informações sobre pagamentos, boletos ou qualquer outra questão financeira.

Só um momentinho... já estou te conectando!`
    };
  }

  /**
   * Template para continuar no fluxo de orçamento
   * Baseado na lógica do chatbot quando escolhe opção 1
   */
  getOrcamentoTemplate(): MessageTemplate {
    return {
      body: `Perfeito! Vamos fazer seu orçamento! 💰

Para criar um orçamento personalizado e detalhado, preciso saber se você já tem um projeto definido:

1 - Já tenho um projeto 📋
2 - Ainda não tenho projeto 📝

👉 É só me enviar o número da opção!`
    };
  }

  /**
   * Template para quando o ambiente do lead é criado
   * Baseado no workflow "Amb__Lead_no_Driver.json"
   */
  getLeadEnvironmentTemplate(): MessageTemplate {
    return {
      body: `🎯 Perfeito! Vamos iniciar seu orçamento.
Você já tem um projeto em mãos ou vamos começar do zero juntinhos? 

Por favor, escolha uma das opções abaixo:

1 - Já tenho um projeto 📄
2 - Ainda não tenho 🆕

👉 É só me informar a opção que seguimos daqui!`
    };
  }

  getReconnectionTemplate(): MessageTemplate {
    return {
      body: `⏳ Como houve uma pausa no atendimento, vamos reiniciar o processo para garantir que tudo ocorra da melhor forma possível. 😊

📋 Fique tranquilo(a), vamos retomar desde o início para garantir que nenhuma informação importante seja perdida!`
    };
  }

  getProjectTemplate(): MessageTemplate {
    return {
      body: `📂 Perfeito! Isso vai agilizar bastante o nosso processo.
Você pode me enviar os arquivos do seu projeto, como:

📄 Planta baixa
🖼️ Imagens
📑 Outros documentos que ajudem nossa equipe a entender melhor o espaço.

Assim, conseguimos preparar um orçamento ainda mais preciso pra você!

Quando finalizar o envio mande um "OK" 😊`
    };
  }

  getFloorPlanTemplate(): MessageTemplate {
    return {
      body: `📏 Sem problemas, a gente te ajuda desde o comecinho!
Você tem as medidas do ambiente ou uma planta baixa simples com as dimensões? Já é o suficiente pra começarmos a montar algo para você. 😄

1 - Tenho as medidas 📐
2 - Não tenho as medidas ❌`
    };
  }

  getHasFloorPlanTemplate(): MessageTemplate {
    return {
      body: `📄 Perfeito!
Com as medidas da planta baixa em mãos, vamos poder avançar para criar um orçamento bem detalhado e personalizado para você. Agora precisamos que envie o documento com as medidas.

📤 Você pode enviar por aqui mesmo.

Quando finalizar o envio mande um "OK"`
    };
  }

  /**
   * Template para confirmação de arquivo armazenado
   */
  getFileStorageConfirmationTemplate(fileName: string): MessageTemplate {
    return {
      body: `✅ Arquivo recebido e armazenado com sucesso!

📁 Nome: ${fileName}
📂 O arquivo foi salvo na sua pasta de projeto.

Obrigado por compartilhar! Caso tenha mais arquivos, pode enviar que organizaremos tudo para você. 😊`
    };
  }

  /**
   * Template para erro no armazenamento de arquivo
   */
  getFileStorageErrorTemplate(): MessageTemplate {
    return {
      body: `❌ Ops! Houve um problema ao processar seu arquivo.

Por favor, tente enviar novamente ou entre em contato conosco se o problema persistir.

Nossa equipe está aqui para ajudar! 😊`
    };
  }

  /**
   * Template para finalização de projeto
   */
  getProjectFinalizationTemplate(): MessageTemplate {
    return {
      body: `✅ Perfeito! Recebemos todos os seus arquivos.

🎯 Nossa equipe já está analisando seu projeto e em breve você receberá:
• Orçamento detalhado
• Cronograma de execução  
• Projeto personalizado

📞 Um de nossos consultores entrará em contato em até 24 horas.

Obrigado pela confiança! 😊`
    };
  }

  /**
   * Template para agendamento de medição
   */
  getScheduleMeasurementTemplate(): MessageTemplate {
    return {
      body: `📏 Sem problemas! Vamos agendar uma medição para você.

🏠 Nossa equipe técnica irá até seu local para:
• Fazer todas as medições necessárias
• Avaliar o espaço disponível
• Tirar suas dúvidas presencialmente

📅 Nosso consultor entrará em contato para agendar a visita em um horário conveniente para você.

⏰ Agendamentos disponíveis de segunda a sábado!`
    };
  }

  /**
   * Template para erros de sistema
   */
  getSystemErrorTemplate(): MessageTemplate {
    return {
      body: `⚠️ Ops! Ocorreu um erro temporário em nosso sistema.

🔄 Por favor, tente novamente em alguns instantes.

📞 Se o problema persistir, nossa equipe de suporte está disponível para ajudar!

Pedimos desculpas pelo inconveniente. 😊`
    };
  }
}
