# Teste de integração do workflow "Armazenar_arquivos.json"
# Este script simula o envio de diferentes tipos de arquivos

Write-Output "🗂️  Testando integração do workflow Armazenar_arquivos.json"
Write-Output "============================================================"

# 1. Teste: Envio de imagem (JPEG)
Write-Output ""
Write-Output "📸 Teste 1: Enviando imagem JPEG"
Write-Output "--------------------------------"

$body1 = @{
    body = @{
        data = @{
            id = 2001
            body = "Foto da cozinha atual"
            mediaType = "image"
            mediaPath = "https://cmmodulados.gosac.com.br/api/public/16311_1750986607800/cozinha.jpeg"
            contactId = 92001
            ticketId = 92001
            userId = 45
            ticket = @{
                contact = @{
                    name = "Ana Costa"
                }
                updatedAt = "2025-06-30T23:30:00.000Z"
            }
        }
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/webhook" -Method POST -Body $body1 -ContentType "application/json"

Write-Output ""
Write-Output "⏳ Aguardando processamento..."
Start-Sleep -Seconds 4

# 2. Teste: Envio de documento PDF
Write-Output ""
Write-Output "📄 Teste 2: Enviando documento PDF"
Write-Output "----------------------------------"

$body2 = @{
    body = @{
        data = @{
            id = 2002
            body = "Projeto da planta baixa"
            mediaType = "document"
            mediaPath = "https://cmmodulados.gosac.com.br/api/public/16312_1750986607801/planta.pdf"
            contactId = 92002
            ticketId = 92002
            userId = 45
            ticket = @{
                contact = @{
                    name = "Carlos Silva"
                }
                updatedAt = "2025-06-30T23:31:00.000Z"
            }
        }
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/webhook" -Method POST -Body $body2 -ContentType "application/json"

Write-Output ""
Write-Output "⏳ Aguardando processamento..."
Start-Sleep -Seconds 3

# 3. Teste: Envio de vídeo
Write-Output ""
Write-Output "🎥 Teste 3: Enviando vídeo MP4"
Write-Output "------------------------------"

$body3 = @{
    body = @{
        data = @{
            id = 2003
            body = "Vídeo mostrando o espaço disponível"
            mediaType = "video"
            mediaPath = "https://cmmodulados.gosac.com.br/api/public/16313_1750986607802/espaco.mp4"
            contactId = 92003
            ticketId = 92003
            userId = 45
            ticket = @{
                contact = @{
                    name = "Fernanda Lima"
                }
                updatedAt = "2025-06-30T23:32:00.000Z"
            }
        }
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/webhook" -Method POST -Body $body3 -ContentType "application/json"

Write-Output ""
Write-Output "⏳ Aguardando processamento..."
Start-Sleep -Seconds 3

# 4. Teste: Envio de arquivo sem descrição
Write-Output ""
Write-Output "📎 Teste 4: Enviando arquivo sem descrição"
Write-Output "------------------------------------------"

$body4 = @{
    body = @{
        data = @{
            id = 2004
            body = ""
            mediaType = "image"
            mediaPath = "https://cmmodulados.gosac.com.br/api/public/16314_1750986607803/referencia.png"
            contactId = 92004
            ticketId = 92004
            userId = 45
            ticket = @{
                contact = @{
                    name = "Roberto Santos"
                }
                updatedAt = "2025-06-30T23:33:00.000Z"
            }
        }
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/webhook" -Method POST -Body $body4 -ContentType "application/json"

Write-Output ""
Write-Output "✅ Testes de armazenamento de arquivos concluídos!"
Write-Output ""
Write-Output "🔍 Verificações esperadas:"
Write-Output "- Arquivos devem ser baixados do WhatsApp"
Write-Output "- Estrutura de pastas deve ser navegada (Ano/Mês/Andamento/Cliente)"
Write-Output "- Arquivos devem ser organizados na pasta do cliente correto"
Write-Output "- Nome do arquivo deve incluir cliente e descrição (se fornecida)"
Write-Output "- Confirmação deve ser enviada para cada arquivo processado"
Write-Output "- Em caso de erro, mensagem de erro deve ser enviada"
