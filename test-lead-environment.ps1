# Teste de integração do workflow "Amb__Lead_no_Driver.json"
# Este script simula o fluxo completo do ambiente do lead

Write-Output "🧪 Testando integração do workflow Amb__Lead_no_Driver.json"
Write-Output "============================================================"

# 1. Teste: Cliente novo escolhendo orçamento (opção 1)
Write-Output ""
Write-Output "📋 Teste 1: Cliente escolhendo orçamento (state 1 -> 3)"
Write-Output "-------------------------------------------------------"

$body1 = @{
    body = @{
        data = @{
            id = 1001
            body = "1"
            contactId = 91001
            ticketId = 91001
            ticket = @{
                contact = @{
                    name = "João Silva"
                }
                updatedAt = "2025-06-30T23:25:00.000Z"
            }
        }
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/webhook" -Method POST -Body $body1 -ContentType "application/json"

Write-Output ""
Write-Output "⏳ Aguardando processamento..."
Start-Sleep -Seconds 3

# 2. Teste: Verificação do estado após criação do ambiente
Write-Output ""
Write-Output "📋 Teste 2: Resposta do cliente após ambiente criado (state 3)"
Write-Output "-------------------------------------------------------------"

$body2 = @{
    body = @{
        data = @{
            id = 1002
            body = "1"
            contactId = 91001
            ticketId = 91001
            ticket = @{
                contact = @{
                    name = "João Silva"
                }
                updatedAt = "2025-06-30T23:26:00.000Z"
            }
        }
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/webhook" -Method POST -Body $body2 -ContentType "application/json"

Write-Output ""
Write-Output "⏳ Aguardando processamento..."
Start-Sleep -Seconds 2

# 3. Teste: Cliente optando por "ainda não tenho projeto" (opção 2)
Write-Output ""
Write-Output "📋 Teste 3: Cliente sem projeto (state 3 -> opção 2)"
Write-Output "---------------------------------------------------"

$body3 = @{
    body = @{
        data = @{
            id = 1003
            body = "2"
            contactId = 91002
            ticketId = 91002
            ticket = @{
                contact = @{
                    name = "Maria Santos"
                }
                updatedAt = "2025-06-30T23:27:00.000Z"
            }
        }
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/webhook" -Method POST -Body $body3 -ContentType "application/json"

Write-Output ""
Write-Output "✅ Testes de integração concluídos!"
Write-Output ""
Write-Output "🔍 Verificações esperadas:"
Write-Output "- Ambiente do lead deve ser criado no Google Drive (pastas ano/mês/andamento)"
Write-Output "- Pasta do cliente deve ser criada com formato: '{ticketId} - {nome}'"
Write-Output "- Documento 'Preferências - {nome}' deve ser criado"
Write-Output "- Estado deve ser atualizado para 3 com local_arquivo preenchido"
Write-Output "- Templates apropriados devem ser enviados"
Write-Output "- lastmessage deve ser atualizada"
