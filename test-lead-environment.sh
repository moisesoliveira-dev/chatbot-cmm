#!/bin/bash

# Teste de integração do workflow "Amb__Lead_no_Driver.json"
# Este script simula o fluxo completo do ambiente do lead

echo "🧪 Testando integração do workflow Amb__Lead_no_Driver.json"
echo "============================================================"

# 1. Teste: Cliente novo escolhendo orçamento (opção 1)
echo ""
echo "📋 Teste 1: Cliente escolhendo orçamento (state 1 -> 3)"
echo "-------------------------------------------------------"

curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "data": {
        "id": 1001,
        "body": "1",
        "contactId": 91001,
        "ticketId": 91001,
        "ticket": {
          "contact": {
            "name": "João Silva"
          },
          "updatedAt": "2025-06-30T23:25:00.000Z"
        }
      }
    }
  }'

echo ""
echo "⏳ Aguardando processamento..."
sleep 3

# 2. Teste: Verificação do estado após criação do ambiente
echo ""
echo "📋 Teste 2: Resposta do cliente após ambiente criado (state 3)"
echo "-------------------------------------------------------------"

curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "data": {
        "id": 1002,
        "body": "1",
        "contactId": 91001,
        "ticketId": 91001,
        "ticket": {
          "contact": {
            "name": "João Silva"
          },
          "updatedAt": "2025-06-30T23:26:00.000Z"
        }
      }
    }
  }'

echo ""
echo "⏳ Aguardando processamento..."
sleep 2

# 3. Teste: Cliente optando por "ainda não tenho projeto" (opção 2)
echo ""
echo "📋 Teste 3: Cliente sem projeto (state 3 -> opção 2)"
echo "---------------------------------------------------"

curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "data": {
        "id": 1003,
        "body": "2",
        "contactId": 91002,
        "ticketId": 91002,
        "ticket": {
          "contact": {
            "name": "Maria Santos"
          },
          "updatedAt": "2025-06-30T23:27:00.000Z"
        }
      }
    }
  }'

echo ""
echo "✅ Testes de integração concluídos!"
echo ""
echo "🔍 Verificações esperadas:"
echo "- Ambiente do lead deve ser criado no Google Drive (pastas ano/mês/andamento)"
echo "- Pasta do cliente deve ser criada com formato: '{ticketId} - {nome}'"
echo "- Documento 'Preferências - {nome}' deve ser criado"
echo "- Estado deve ser atualizado para 3 com local_arquivo preenchido"
echo "- Templates apropriados devem ser enviados"
echo "- lastmessage deve ser atualizada"
