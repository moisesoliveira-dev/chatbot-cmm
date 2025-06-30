#!/bin/bash

# Script para testar o webhook do chatbot CMM
echo "🧪 Testing CMM Chatbot Webhook..."
echo "📡 Endpoint: http://localhost:3000/webhook/gosac"
echo ""

# Teste 1: Cliente novo
echo "1️⃣ Test 1: New client message"
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
echo -e "\n"

# Aguardar debounce
echo "⏳ Waiting 4 seconds for debounce..."
sleep 4

# Teste 2: Cliente escolhe "Tenho projeto"
echo "2️⃣ Test 2: Client chooses 'I have a project'"
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
echo -e "\n"

# Aguardar debounce
echo "⏳ Waiting 4 seconds for debounce..."
sleep 4

# Teste 3: Cliente envia arquivo
echo "3️⃣ Test 3: Client sends file"
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
        "mediaUrl": "https://example.com/plant.pdf",
        "updatedAt": "2025-06-30T12:00:00.000Z",
        "ticket": {
          "contact": {
            "isGroup": false
          }
        }
      }
    }
  }'
echo -e "\n"

# Aguardar debounce
echo "⏳ Waiting 4 seconds for debounce..."
sleep 4

# Teste 4: Cliente confirma com OK
echo "4️⃣ Test 4: Client confirms with OK"
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
echo -e "\n"

echo "✅ All tests completed!"
echo "Check the application logs to see the processing flow."
