import { Injectable } from '@nestjs/common';
import { 
  FileStorageData, 
  FileStorageResult, 
  FileDownloadResult,
  StorageLocation 
} from '../interfaces/file-storage.interfaces';

// Mock File Storage Service para desenvolvimento
@Injectable()
export class MockFileStorageService {
  
  /**
   * Mock: Processa o armazenamento de arquivo completo
   * Equivale ao workflow "Armazenar_arquivos.json"
   */
  async processFileStorage(data: FileStorageData): Promise<FileStorageResult> {
    console.log(`🗂️  MOCK FILE STORAGE FOR: ${data.nome}`);
    console.log(`📄 Media Type: ${data.mediaType}`);
    console.log(`🔗 Media Path: ${data.mediaPath}`);
    
    // Simular processo completo
    await this.delay(800);
    console.log(`📁 Localizando estrutura de pastas...`);
    
    await this.delay(500);
    console.log(`📥 Baixando arquivo do WhatsApp (MOCK)...`);
    
    await this.delay(700);
    console.log(`📤 Fazendo upload para Google Drive (MOCK)...`);
    
    // Gerar nome do arquivo
    const timestamp = Date.now();
    const clientName = data.nome.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = data.body && data.body.trim() 
      ? `${clientName}_${data.body.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`
      : `${clientName}_arquivo_${timestamp}`;
    
    // Simular resultado
    const mockResult: FileStorageResult = {
      success: true,
      fileId: `mock_file_${timestamp}`,
      fileName: fileName,
      folderPath: `${data.ticketId} - ${data.nome}`,
      downloadResult: {
        success: true,
        fileName: `arquivo_${timestamp}`,
        filePath: `/tmp/mock_${timestamp}`,
      }
    };
    
    console.log(`✅ Arquivo armazenado com sucesso (MOCK):`, mockResult);
    return mockResult;
  }

  /**
   * Mock: Simula baixar arquivo do WhatsApp
   */
  private async downloadWhatsAppFile(mediaPath: string): Promise<FileDownloadResult> {
    console.log(`📥 MOCK: Baixando arquivo de ${mediaPath}`);
    
    await this.delay(600);
    
    return {
      success: true,
      fileName: `mock_file_${Date.now()}`,
      filePath: `/tmp/mock_${Date.now()}`,
    };
  }

  /**
   * Mock: Simula obter estrutura de pastas
   */
  private async getStorageLocation(data: FileStorageData): Promise<StorageLocation> {
    console.log(`📁 MOCK: Obtendo estrutura de pastas para ${data.nome}`);
    
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = now.toLocaleString('pt-BR', { month: 'long' });
    
    return {
      yearFolderId: `mock_year_${year}`,
      monthFolderId: `mock_month_${month}`,
      andamentoFolderId: `mock_andamento_${Date.now()}`,
      clientFolderId: `mock_client_${data.ticketId}`
    };
  }

  /**
   * Mock: Simula upload para Google Drive
   */
  private async uploadToGoogleDrive(
    filePath: string, 
    fileName: string, 
    folderId: string
  ): Promise<string> {
    console.log(`📤 MOCK: Upload ${fileName} para pasta ${folderId}`);
    
    await this.delay(400);
    
    return `mock_uploaded_file_${Date.now()}`;
  }

  /**
   * Utilitário para simular delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
