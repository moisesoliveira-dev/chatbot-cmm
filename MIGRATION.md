# Migração do n8n para NestJS - Guia Detalhado

## Mapeamento de Nós n8n para NestJS

### 1. Webhook n8n → Controller NestJS

**n8n:**
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "gosac"
  },
  "type": "n8n-nodes-base.webhook"
}
```

**NestJS:**
```typescript
@Controller('webhook')
export class WebhookController {
  @Post('gosac')
  async handleWebhook(@Body() webhookData: WebhookDto) {
    // ...
  }
}
```

### 2. PostgreSQL Nodes → TypeORM Service

**n8n SELECT:**
```json
{
  "operation": "select",
  "table": "tb_mensagem_cliente",
  "where": {
    "values": [
      {
        "column": "contactid",
        "value": "={{ $('Webhook1').first().json.body.data.contactId }}"
      }
    ]
  }
}
```

**NestJS:**
```typescript
async findByContactId(contactId: number): Promise<MensagemCliente | null> {
  return await this.mensagemRepository.findOne({
    where: { contactid: contactId }
  });
}
```

**n8n UPDATE:**
```json
{
  "operation": "update",
  "table": "tb_mensagem_cliente",
  "columns": {
    "value": {
      "contactid": "={{ $json.contactId }}",
      "lastmessage": "="{{ $json.updatedAt }}"
    }
  }
}
```

**NestJS:**
```typescript
async updateLastMessage(contactId: number, lastMessage: string): Promise<void> {
  await this.mensagemRepository.update(
    { contactid: contactId },
    { lastmessage: lastMessage }
  );
}
```

### 3. Redis Nodes → Redis Service

**n8n SET:**
```json
{
  "operation": "set",
  "key": "=chatbot:last:user:{{ $('Webhook1').item.json.body.data.contactId }}",
  "value": "={{ $('Webhook1').item.json.body.data.body }}"
}
```

**NestJS:**
```typescript
async storeLastMessage(contactId: number, message: string): Promise<void> {
  const key = `chatbot:last:user:${contactId}`;
  await this.redisService.set(key, message);
}
```

**n8n GET:**
```json
{
  "operation": "get",
  "key": "=chatbot:last:user:{{ $('Webhook1').item.json.body.data.contactId }}"
}
```

**NestJS:**
```typescript
async getLastMessage(contactId: number): Promise<string | null> {
  const key = `chatbot:last:user:${contactId}`;
  return await this.redisService.get(key);
}
```

### 4. HTTP Request Nodes → API Service

**n8n:**
```json
{
  "method": "POST",
  "url": "=https://cmmodulados.gosac.com.br/api/messages/{{ $('Coleta de dados').first().json.ticketId }}",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Authorization",
        "value": "INTEGRATION token"
      }
    ]
  },
  "sendBody": true,
  "jsonBody": "={ \"body\": \"Mensagem\" }"
}
```

**NestJS:**
```typescript
async sendMessage(ticketId: number, message: MessageTemplate): Promise<void> {
  await axios.post(
    `${this.baseUrl}/messages/${ticketId}`,
    message,
    {
      headers: {
        'Authorization': this.integrationToken,
        'Content-Type': 'application/json',
      },
    }
  );
}
```

### 5. Code Nodes → Business Logic

**n8n JavaScript:**
```javascript
const inputDate = new Date($('Analisar ticket').first().json.lastmessage);
const now = new Date();
const diffMs = Math.abs(now - inputDate);
const diffMinutes = diffMs / (1000 * 60);

return [{
  json: {
    differenceInMinutes: diffMinutes,
    passedOneHour: diffMinutes > 60
  }
}];
```

**NestJS:**
```typescript
compareTime(lastMessageDate: string): TimeComparison {
  const inputDate = new Date(lastMessageDate);
  const now = new Date();
  const diffMs = Math.abs(now.getTime() - inputDate.getTime());
  const diffMinutes = diffMs / (1000 * 60);
  
  return {
    differenceInMinutes: diffMinutes,
    passedOneHour: diffMinutes > 60
  };
}
```

### 6. If/Switch Nodes → Conditional Logic

**n8n IF:**
```json
{
  "conditions": [
    {
      "leftValue": "={{ $('Analisar ticket').first().json.ematendimento }}",
      "operator": {
        "type": "boolean",
        "operation": "true"
      }
    }
  ]
}
```

**NestJS:**
```typescript
if (clientData.ematendimento) {
  await this.handlePersonalService(data);
  return;
}
```

**n8n SWITCH:**
```json
{
  "rules": {
    "values": [
      {
        "conditions": [
          {
            "leftValue": "={{ $('Analisar ticket').first().json.state }}",
            "rightValue": 1,
            "operator": {
              "type": "number",
              "operation": "equals"
            }
          }
        ]
      }
    ]
  }
}
```

**NestJS:**
```typescript
switch (clientData.state) {
  case 1:
    await this.handleState1(data);
    break;
  case 2:
    await this.handleState2(data);
    break;
  // ...
}
```

### 7. Wait Node → Delay Function

**n8n:**
```json
{
  "amount": 3,
  "type": "n8n-nodes-base.wait"
}
```

**NestJS:**
```typescript
private async delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Uso:
await this.delay(3000); // 3 segundos
```

## Vantagens da Migração

### 1. **Performance**
- **n8n**: Overhead da interface visual e interpretação de nós
- **NestJS**: Execução direta do código compilado

### 2. **Debugging**
- **n8n**: Debug através da interface visual, limitado
- **NestJS**: Debugging completo com breakpoints, logs estruturados

### 3. **Testes**
- **n8n**: Testes limitados através da interface
- **NestJS**: Testes unitários e de integração completos

### 4. **Versionamento**
- **n8n**: JSON export/import, diff complexo
- **NestJS**: Git nativo com diffs claros

### 5. **Escalabilidade**
- **n8n**: Limitado pela arquitetura da plataforma
- **NestJS**: Microserviços, load balancing, clustering

### 6. **Manutenção**
- **n8n**: Dependente da interface visual
- **NestJS**: Código estruturado, refatoração segura

## Estrutura de Estados Migrada

```typescript
enum ChatbotState {
  INITIAL = 1,           // Pergunta inicial sobre projeto
  INTERMEDIATE_2 = 2,    // A implementar
  INTERMEDIATE_3 = 3,    // A implementar
  FILE_UPLOAD = 4,       // Upload de arquivos
  FLOOR_PLAN_QUESTION = 5, // Pergunta sobre planta baixa
  ADVANCED_6 = 6,        // Estados avançados...
  ADVANCED_7 = 7,
  ADVANCED_8 = 8,
  ADVANCED_9 = 9,
  ADVANCED_10 = 10,
  ADVANCED_11 = 11,
}
```

## Próximos Passos para Completar a Migração

1. **Implementar estados restantes** (2, 3, 6-11)
2. **Adicionar validações específicas** do n8n
3. **Migrar templates de mensagem** restantes
4. **Implementar logging** equivalente ao n8n
5. **Configurar monitoramento** de execução
6. **Testes de regressão** com dados reais

## Configuração de Produção

Para reproduzir o ambiente de produção do n8n:

1. **Database**: PostgreSQL com mesma estrutura
2. **Cache**: Redis para debounce
3. **API**: Mesmo endpoint e tokens
4. **Logs**: Estruturados para monitoramento
5. **Health checks**: Para garantir disponibilidade
