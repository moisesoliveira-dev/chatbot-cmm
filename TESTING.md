# Testando o Webhook do Chatbot CMM

## 1. Iniciando a aplicação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar em modo desenvolvimento
npm run start:dev
```

## 2. Testando com curl

### Webhook básico - Cliente novo
```bash
curl -X POST http://localhost:3000/webhook/gosac \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "data": {
        "mediaType": "text",
        "fromMe": false,
        "contactId": 123456,
        "ticketId": 789012,
        "body": "Olá, preciso de um orçamento",
        "mediaUrl": null,
        "updatedAt": "2025-06-30T12:00:00.000Z",
        "ticket": {
          "contact": {
            "isGroup": false
          }
        }
      }
    }
  }'
```

### Cliente escolhendo "Tenho projeto" (Estado 1 → 4)
```bash
curl -X POST http://localhost:3000/webhook/gosac \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Cliente escolhendo "Não tenho projeto" (Estado 1 → 5)
```bash
curl -X POST http://localhost:3000/webhook/gosac \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "data": {
        "mediaType": "text",
        "fromMe": false,
        "contactId": 123456,
        "ticketId": 789012,
        "body": "2",
        "mediaUrl": null,
        "updatedAt": "2025-06-30T12:00:00.000Z",
        "ticket": {
          "contact": {
            "isGroup": false
          }
        }
      }
    }
  }'
```

### Cliente enviando arquivo (Estado 4)
```bash
curl -X POST http://localhost:3000/webhook/gosac \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "data": {
        "mediaType": "document",
        "fromMe": false,
        "contactId": 123456,
        "ticketId": 789012,
        "body": "",
        "mediaUrl": "https://example.com/arquivo.pdf",
        "updatedAt": "2025-06-30T12:00:00.000Z",
        "ticket": {
          "contact": {
            "isGroup": false
          }
        }
      }
    }
  }'
```

### Cliente confirmando envio com "OK" (Estado 4)
```bash
curl -X POST http://localhost:3000/webhook/gosac \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "data": {
        "mediaType": "text",
        "fromMe": false,
        "contactId": 123456,
        "ticketId": 789012,
        "body": "OK",
        "mediaUrl": null,
        "updatedAt": "2025-06-30T12:00:00.000Z",
        "ticket": {
          "contact": {
            "isGroup": false
          }
        }
      }
    }
  }'
```

## 3. Testando com Postman

1. Abra o Postman
2. Crie uma nova requisição POST
3. URL: `http://localhost:3000/webhook/gosac`
4. Headers: `Content-Type: application/json`
5. Body: Raw JSON com qualquer um dos payloads acima

## 4. Mensagens que são ignoradas

O sistema ignora mensagens com:
- `fromMe: true` (mensagens enviadas pelo bot)
- `mediaType` em: hsm, transfer, ptt, sticker, vcard, location, impostor
- `ticket.contact.isGroup: true` (mensagens de grupo)

Exemplo de mensagem ignorada:
```bash
curl -X POST http://localhost:3000/webhook/gosac \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "data": {
        "mediaType": "hsm",
        "fromMe": true,
        "contactId": 123456,
        "ticketId": 789012,
        "body": "Mensagem do bot",
        "ticket": {
          "contact": {
            "isGroup": false
          }
        }
      }
    }
  }'
```

## 5. Testando Debounce

Para testar o sistema de debounce, envie a mesma mensagem duas vezes rapidamente:

```bash
# Primeira mensagem
curl -X POST http://localhost:3000/webhook/gosac \
  -H "Content-Type: application/json" \
  -d '{"body":{"data":{"mediaType":"text","fromMe":false,"contactId":999,"ticketId":123,"body":"teste","ticket":{"contact":{"isGroup":false}}}}}'

# Segunda mensagem idêntica (deve ser ignorada)
curl -X POST http://localhost:3000/webhook/gosac \
  -H "Content-Type: application/json" \
  -d '{"body":{"data":{"mediaType":"text","fromMe":false,"contactId":999,"ticketId":123,"body":"teste","ticket":{"contact":{"isGroup":false}}}}}'
```

## 6. Monitorando logs

Para ver os logs da aplicação:
```bash
npm run start:dev
```

Os logs mostrarão:
- Mensagens recebidas
- Estados alterados
- Mensagens enviadas para a API
- Erros de processamento

## 7. Estrutura de resposta

Resposta de sucesso:
```json
{
  "success": true
}
```

Resposta de erro:
```json
{
  "statusCode": 400,
  "message": ["Validation error messages"],
  "error": "Bad Request"
}
```
