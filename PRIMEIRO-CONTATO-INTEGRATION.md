# Integração do Fluxo "Primeiro Contato" ao Sistema NestJS

## Resumo da Implementação

O workflow "Primeiro_contato.json" foi completamente integrado ao sistema NestJS, seguindo a mesma lógica do n8n original.

## Análise do Fluxo Original

### Estrutura do Workflow "Primeiro_contato.json"
1. **Trigger**: "When Executed by Another Workflow" - recebe dados do fluxo principal
2. **Template Inicial**: Envia mensagem de boas-vindas da Vera D'or
3. **Cadastrar contato**: Faz upsert na tabela `tb_mensagem_cliente`
4. **Recuperar ticket**: Busca informações do ticket via API
5. **Atualizar data da ultima mensagem**: Atualiza o campo `lastmessage`

### Onde é Chamado no CMM.json
- **Nó "Se for um cliente novo?"**: Verifica se `clienteNovo` é `true`
- **Condição**: Baseada na análise de data do nó "Analisar datas de cadastro do contact"
- **Lógica**: Cliente é considerado novo se o ticket foi criado no mesmo dia (UTC-4 Manaus)

## Implementação no NestJS

### 1. Serviço MensagemClienteService
Novos métodos adicionados:

```typescript
/**
 * Verifica se é um cliente novo baseado na data de criação do ticket
 */
isNewClient(ticketCreatedAt: string): boolean

/**
 * Processa o primeiro contato de um cliente
 * Equivale ao workflow "Primeiro_contato.json"
 */
processFirstContact(contactId: number, ticketId: number): Promise<MensagemCliente>
```

### 2. Serviço ChatbotService
Novo método privado:

```typescript
/**
 * Processa o primeiro contato de um cliente novo
 * Equivale ao workflow "Primeiro_contato.json"
 */
private async handleFirstContact(data: any): Promise<void>
```

### 3. Fluxo Atualizado no processWebhook
```typescript
if (!clientData) {
  // Verificar se é um cliente novo (ticket criado no mesmo dia)
  const isNewClient = this.mensagemService.isNewClient(data.ticket.createdAt);
  
  if (isNewClient) {
    // Processar primeiro contato
    await this.handleFirstContact(data);
  } else {
    // Cliente existente sem registro - criar registro básico
    await this.mensagemService.createOrUpdate({...});
  }
  return;
}
```

### 4. Template de Boas-vindas
Novo template no TemplateService:

```typescript
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
```

### 5. Mocks Atualizados
O `MockMensagemClienteService` foi atualizado com os mesmos métodos para permitir desenvolvimento sem dependências externas.

## Equivalências n8n → NestJS

| Componente n8n | Equivalente NestJS |
|---|---|
| "When Executed by Another Workflow" | `handleFirstContact()` |
| "Template Inicial" | `templateService.getWelcomeTemplate()` |
| "Cadastrar contato" (upsert) | `mensagemService.processFirstContact()` |
| "Recuperar ticket" | `apiService.getTicket()` |
| "Atualizar data da ultima mensagem" | `mensagemService.updateLastMessage()` |
| Verificação "clienteNovo" | `mensagemService.isNewClient()` |

## Lógica de Decisão

1. **Webhook recebido**: Dados do WhatsApp chegam
2. **Busca cliente**: Verifica se existe registro no banco
3. **Se não existe**:
   - Verifica se ticket foi criado hoje (cliente novo)
   - **Se é cliente novo**: Executa fluxo de primeiro contato
   - **Se não é cliente novo**: Cria registro básico
4. **Fluxo de primeiro contato**:
   - Cria/atualiza registro no banco
   - Envia mensagem de boas-vindas
   - Busca ticket atualizado
   - Atualiza última mensagem

## Benefícios da Integração

1. **Fluxo unificado**: Não há mais necessidade de workflows separados
2. **Melhor performance**: Tudo em uma única aplicação
3. **Fácil manutenção**: Lógica centralizada nos serviços
4. **Testabilidade**: Mocks permitem desenvolvimento local
5. **Escalabilidade**: Estrutura NestJS permite melhor controle

## Estado Atual

✅ **Implementado**:
- Verificação de cliente novo
- Processamento de primeiro contato
- Template de boas-vindas
- Mocks para desenvolvimento
- Integração com fluxo principal

⚠️ **Pendente**:
- Resolução de problema de dependência no módulo de desenvolvimento
- Testes funcionais completos
- Deploy em ambiente de produção

## Próximos Passos

1. **Corrigir configuração do módulo de desenvolvimento**
2. **Testar fluxo completo com payload real**
3. **Validar template de boas-vindas**
4. **Implementar logs detalhados**
5. **Criar testes unitários**
