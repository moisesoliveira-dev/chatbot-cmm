# Script PowerShell para testar o webhook do chatbot CMM
Write-Host "🧪 Testing CMM Chatbot Webhook..." -ForegroundColor Green
Write-Host "📡 Endpoint: http://localhost:3000/webhook/gosac" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Cliente novo
Write-Host "1️⃣ Test 1: New client message" -ForegroundColor Yellow
$body1 = @{
    body = @{
        data = @{
            mediaType = "text"
            fromMe = $false
            contactId = 123456
            ticketId = 789012
            body = "Olá, preciso de um orçamento"
            mediaUrl = $null
            updatedAt = "2025-06-30T12:00:00.000Z"
            ticket = @{
                contact = @{
                    isGroup = $false
                }
            }
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:3000/webhook/gosac" -Method POST -Body $body1 -ContentType "application/json"
    Write-Host "✅ Response: $($response1 | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Aguardar debounce
Write-Host "⏳ Waiting 4 seconds for debounce..." -ForegroundColor Blue
Start-Sleep -Seconds 4

# Teste 2: Cliente escolhe "Tenho projeto"
Write-Host "2️⃣ Test 2: Client chooses 'I have a project'" -ForegroundColor Yellow
$body2 = @{
    body = @{
        data = @{
            mediaType = "text"
            fromMe = $false
            contactId = 123456
            ticketId = 789012
            body = "1"
            mediaUrl = $null
            updatedAt = "2025-06-30T12:00:00.000Z"
            ticket = @{
                contact = @{
                    isGroup = $false
                }
            }
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:3000/webhook/gosac" -Method POST -Body $body2 -ContentType "application/json"
    Write-Host "✅ Response: $($response2 | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Aguardar debounce
Write-Host "⏳ Waiting 4 seconds for debounce..." -ForegroundColor Blue
Start-Sleep -Seconds 4

# Teste 3: Cliente envia arquivo
Write-Host "3️⃣ Test 3: Client sends file" -ForegroundColor Yellow
$body3 = @{
    body = @{
        data = @{
            mediaType = "document"
            fromMe = $false
            contactId = 123456
            ticketId = 789012
            body = ""
            mediaUrl = "https://example.com/plant.pdf"
            updatedAt = "2025-06-30T12:00:00.000Z"
            ticket = @{
                contact = @{
                    isGroup = $false
                }
            }
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:3000/webhook/gosac" -Method POST -Body $body3 -ContentType "application/json"
    Write-Host "✅ Response: $($response3 | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Aguardar debounce
Write-Host "⏳ Waiting 4 seconds for debounce..." -ForegroundColor Blue
Start-Sleep -Seconds 4

# Teste 4: Cliente confirma com OK
Write-Host "4️⃣ Test 4: Client confirms with OK" -ForegroundColor Yellow
$body4 = @{
    body = @{
        data = @{
            mediaType = "text"
            fromMe = $false
            contactId = 123456
            ticketId = 789012
            body = "OK"
            mediaUrl = $null
            updatedAt = "2025-06-30T12:00:00.000Z"
            ticket = @{
                contact = @{
                    isGroup = $false
                }
            }
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $response4 = Invoke-RestMethod -Uri "http://localhost:3000/webhook/gosac" -Method POST -Body $body4 -ContentType "application/json"
    Write-Host "✅ Response: $($response4 | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ All tests completed!" -ForegroundColor Green
Write-Host "Check the application logs to see the processing flow." -ForegroundColor Cyan
