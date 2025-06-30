# Chatbot CMM - NestJS Implementation

Este projeto é uma implementação em NestJS de um chatbot que foi originalmente criado no n8n. O sistema processa webhooks de mensagens do WhatsApp e gerencia o fluxo de atendimento automatizado para a empresa CMM Modulados.

## Funcionalidades

- **Webhook de entrada**: Recebe mensagens via POST `/webhook/gosac`
- **Debounce de mensagens**: Evita processamento duplicado de mensagens
- **Gerenciamento de estado**: Controla o fluxo de conversação baseado no estado do cliente
- **Integração com PostgreSQL**: Armazena dados dos clientes e conversas
- **Cache Redis**: Armazena mensagens temporárias para debounce
- **Templates de mensagem**: Respostas automáticas baseadas no contexto
- **Verificação de tempo**: Detecta pausas no atendimento

## Estrutura do Projeto

```
src/
├── controllers/          # Controllers REST
│   └── webhook.controller.ts
├── dto/                 # Data Transfer Objects
│   └── webhook.dto.ts
├── entities/            # Entidades TypeORM
│   └── mensagem-cliente.entity.ts
├── interfaces/          # Interfaces TypeScript
│   └── api.interfaces.ts
├── modules/             # Módulos NestJS
│   └── chatbot.module.ts
├── services/            # Serviços de negócio
│   ├── api.service.ts
│   ├── chatbot.service.ts
│   ├── mensagem-cliente.service.ts
│   ├── redis.service.ts
│   ├── template.service.ts
│   └── time.service.ts
├── app.module.ts
└── main.ts
```

## Fluxo de Estados

O chatbot gerencia diferentes estados da conversa:

1. **Estado 1**: Pergunta inicial se o cliente tem projeto
2. **Estado 2-3**: Estados intermediários (a implementar)
3. **Estado 4**: Envio de arquivos do projeto
4. **Estado 5**: Pergunta sobre planta baixa/medidas
5. **Estado 6+**: Estados avançados (a implementar)

## Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=cmm_database

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 3. Configurar banco de dados

Certifique-se de que o PostgreSQL está rodando e crie a tabela necessária:

```sql
CREATE TABLE tb_mensagem_cliente (
    id SERIAL PRIMARY KEY,
    mediapath VARCHAR,
    body TEXT,
    mediatype VARCHAR,
    ticketid INTEGER NOT NULL,
    contactid INTEGER NOT NULL,
    userid INTEGER,
    lastmessageat TIMESTAMP,
    nome VARCHAR,
    ematendimento BOOLEAN DEFAULT FALSE,
    finalizoutriagem BOOLEAN DEFAULT FALSE,
    stopchatbot BOOLEAN DEFAULT FALSE,
    templateid INTEGER,
    pararmensagem BOOLEAN DEFAULT FALSE,
    lastmessage VARCHAR,
    state INTEGER DEFAULT 1,
    fase_arquivos VARCHAR,
    local_arquivo VARCHAR,
    id_atendente VARCHAR,
    data_medicao VARCHAR
);
```

### 4. Configurar Redis

Certifique-se de que o Redis está rodando no sistema.

## Executar a aplicação

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

## Uso da API

### Webhook Endpoint

**POST** `/webhook/gosac`

Exemplo de payload:
```json
{
  "body": {
    "data": {
      "mediaType": "text",
      "fromMe": false,
      "contactId": 123456,
      "ticketId": 789012,
      "body": "1",
      "mediaUrl": null,
      "updatedAt": "2025-06-30T12:00:00.000Z",
      "ticket": {
        "contact": {
          "isGroup": false
        }
      }
    }
  }
}
```

## Diferenças do n8n Original

Esta implementação em NestJS oferece:

- **Melhor estrutura de código**: Organização modular e tipagem TypeScript
- **Melhor performance**: Sem overhead de interface visual
- **Maior flexibilidade**: Facilidade para adicionar novas funcionalidades
- **Melhor debugging**: Logs estruturados e error handling
- **Escalabilidade**: Arquitetura preparada para crescimento

## Próximos Passos

- [ ] Implementar estados 2, 3, 6-11 do fluxo original
- [ ] Adicionar logging estruturado
- [ ] Implementar testes unitários
- [ ] Adicionar monitoramento e métricas
- [ ] Implementar rate limiting
- [ ] Adicionar documentação OpenAPI/Swagger

## Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Migração do n8n

### Principais conversões realizadas:

1. **Webhook n8n → NestJS Controller**: Endpoint POST `/webhook/gosac`
2. **Nós PostgreSQL → TypeORM Service**: Operações de banco via `MensagemClienteService`
3. **Nós Redis → Redis Service**: Cache para debounce de mensagens
4. **Nós HTTP Request → API Service**: Chamadas para API externa
5. **Nós Code → Business Logic**: Lógica de negócio nos services
6. **Nós Switch/If → State Machine**: Gerenciamento de estados no `ChatbotService`

### Estrutura de Estados Original:
- Estado 1: Início - pergunta sobre projeto
- Estado 4: Envio de arquivos do projeto
- Estado 5: Pergunta sobre planta baixa
- Estados 6-11: Fluxos específicos (a implementar)

A implementação mantém a mesma lógica de negócio do n8n original, mas com melhor organização e estrutura de código.

## Licença

MIT License
