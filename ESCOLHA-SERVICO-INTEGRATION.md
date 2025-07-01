# Integração do Fluxo "Escolha de Serviço" ao Sistema NestJS

## Resumo da Implementação

O workflow "Escolha_de_servi_o.json" foi completamente integrado ao sistema NestJS, implementando toda a lógica de roteamento de serviços baseada na escolha do usuário.

## Análise do Fluxo Original

### Estrutura do Workflow "Escolha_de_servi_o.json"
1. **Trigger**: "Coleta de dados" - recebe dados do fluxo principal
2. **Switch**: "Serviço selecionado" - verifica opções 1, 2, 3, 4
3. **Opção 1 (Orçamento)**: Continua no chatbot, atualiza estado para 2
4. **Opção 2 (Projeto Executivo)**: Redireciona para usuário 6, marca como em atendimento
5. **Opção 3 (Assistência Técnica)**: Redireciona para usuário 58, marca como em atendimento
6. **Opção 4 (Financeiro)**: Redireciona para usuário 49, marca como em atendimento

### Onde é Chamado no CMM.json
- **Nó "Se não for um dos index"**: Verifica se a mensagem é uma das opções válidas (1, 2, 3, 4)
- **Condição**: Se a mensagem for uma opção válida, executa o workflow de escolha de serviço
- **Estado**: Executado quando o cliente está no estado 1 (após primeiro contato)

## Implementação no NestJS

### 1. Atualização do ChatbotService
Método principal atualizado:

```typescript
private async handleState1(data: any): Promise<void> {
  // Estado inicial - escolha de serviço
  const selectedOption = data.body.trim();
  
  switch (selectedOption) {
    case '1': await this.handleOrcamentoChoice(data); break;
    case '2': await this.handleProjetoExecutivoChoice(data); break;
    case '3': await this.handleAssistenciaTecnicaChoice(data); break;
    case '4': await this.handleFinanceiroChoice(data); break;
    default: // Reenviar template de boas-vindas
  }
}
```

### 2. Novos Métodos Implementados

#### handleOrcamentoChoice()
- Envia template de orçamento
- Atualiza estado para 2
- Continua no fluxo do chatbot

#### handleProjetoExecutivoChoice()
- Envia template de confirmação
- Redireciona para usuário 6
- Marca como em atendimento (state: 3)
- Atualiza status do ticket para "pending"

#### handleAssistenciaTecnicaChoice()
- Envia template de confirmação
- Redireciona para usuário 58
- Marca como em atendimento (state: 3)
- Atualiza status do ticket para "pending"

#### handleFinanceiroChoice()
- Envia template de confirmação
- Redireciona para usuário 49
- Marca como em atendimento (state: 3)
- Atualiza status do ticket para "pending"

### 3. Novos Templates no TemplateService

```typescript
getOrcamentoTemplate(): MessageTemplate
getProjetoExecutivoTemplate(): MessageTemplate
getAssistenciaTecnicaTemplate(): MessageTemplate
getFinanceiroTemplate(): MessageTemplate
```

### 4. Novos Métodos no ApiService

```typescript
async redirectTicket(ticketId: number, userId: number): Promise<void>
async updateTicketStatus(ticketId: number, status: string): Promise<void>
```

### 5. Interfaces Atualizadas

```typescript
interface TicketRedirectRequest {
  userId: number;
}

interface TicketStatusUpdateRequest {
  status: string;
}
```

## Equivalências n8n → NestJS

| Componente n8n | Equivalente NestJS |
|---|---|
| "Coleta de dados" | `handleState1()` |
| "Serviço selecionado" (Switch) | `switch (selectedOption)` |
| "Enviar template do Projeto Executivo" | `templateService.getProjetoExecutivoTemplate()` |
| "Redirecionar para Projeto Executivo" | `apiService.redirectTicket(ticketId, 6)` |
| "Enviar template da Assistencia Tecnica" | `templateService.getAssistenciaTecnicaTemplate()` |
| "Redirecionar para assistencia tecnica" | `apiService.redirectTicket(ticketId, 58)` |
| "Enviar template do Financeiro" | `templateService.getFinanceiroTemplate()` |
| "Redirecionar para financeiro" | `apiService.redirectTicket(ticketId, 49)` |
| "Atualizar estado para em atendimento" | `updateClient({ematendimento: true, state: 3})` |
| "Atualizar status para pendente" | `apiService.updateTicketStatus(ticketId, 'pending')` |
| "Atualizar estado Projeto" | `updateClient({state: 2, fase_arquivos: 'projeto'})` |

## Mapeamento de Usuários

| Serviço | User ID | Descrição |
|---|---|---|
| Projeto Executivo | 6 | Especialista em projetos executivos |
| Assistência Técnica | 58 | Equipe de suporte técnico |
| Financeiro | 49 | Setor financeiro |

## Fluxo Completo Integrado

1. **Cliente envia primeira mensagem** → Primeiro contato
2. **Sistema envia boas-vindas** → Template com opções 1, 2, 3, 4
3. **Cliente escolhe opção**:
   - **Opção 1**: Continua no chatbot para orçamento
   - **Opções 2,3,4**: Redireciona para atendente especializado
4. **Para redirecionamentos**:
   - Envia mensagem de confirmação
   - Redireciona ticket para usuário específico
   - Marca cliente como "em atendimento"
   - Atualiza status do ticket para "pending"

## Estado Atual

✅ **Implementado**:
- Switch de escolha de serviço no Estado 1
- Templates específicos para cada serviço
- Redirecionamento de tickets via API
- Atualização de estados no banco
- Lógica de continuidade no chatbot (opção 1)
- Mocks para desenvolvimento

✅ **Testado**:
- Estrutura de código
- Compilação sem erros
- Interfaces definidas

⚠️ **Pendente**:
- Testes funcionais completos
- Resolução do problema de módulo de desenvolvimento
- Validação com API real

## Benefícios da Integração

1. **Roteamento Inteligente**: Direcionamento automático baseado na escolha
2. **Templates Personalizados**: Mensagens específicas para cada serviço
3. **Gestão de Estados**: Controle preciso do estado do atendimento
4. **API Integrada**: Redirecionamento via API oficial
5. **Escalabilidade**: Fácil adição de novos serviços

## Próximos Passos

1. **Corrigir configuração do módulo de desenvolvimento**
2. **Testar cada fluxo de escolha individualmente**
3. **Validar redirecionamentos de tickets**
4. **Implementar logs detalhados para auditoria**
5. **Criar testes unitários para cada método**
