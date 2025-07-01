import { Injectable } from '@nestjs/common';
import { 
  LeadEnvironmentData, 
  LeadEnvironmentResult, 
  FolderInfo, 
  DocumentInfo 
} from '../interfaces/google-drive.interfaces';

// Mock Google Drive Service para desenvolvimento sem Google Drive API
@Injectable()
export class MockGoogleDriveService {
  
  /**
   * Mock: Cria ambiente completo do lead no Google Drive
   * Equivale ao workflow "Amb__Lead_no_Driver.json"
   */
  async createLeadEnvironment(data: LeadEnvironmentData): Promise<LeadEnvironmentResult> {
    console.log(`🏗️  CREATING LEAD ENVIRONMENT FOR: ${data.customerName} (MOCK)`);
    
    // Simular processo completo
    const { year, month } = this.getCurrentYearMonth();
    
    console.log(`📅 Current Year/Month: ${year}/${month}`);
    console.log(`📁 Creating folder structure: VENDAS -> ${year} -> ${month} -> ANDAMENTO`);
    
    const clientFolderName = `${data.ticketId} - ${data.customerName}`;
    const documentName = `Preferências - ${data.customerName}`;
    
    // Simular criação de estrutura
    await this.delay(500);
    console.log(`📁 Cliente folder created: ${clientFolderName}`);
    
    await this.delay(300);
    console.log(`📄 Document created: ${documentName}`);
    
    const mockResult: LeadEnvironmentResult = {
      folderId: `mock_folder_${data.ticketId}`,
      documentId: `mock_doc_${data.ticketId}`,
      documentUrl: `https://docs.google.com/document/d/mock_doc_${data.ticketId}/edit`
    };
    
    console.log(`✅ Lead environment created successfully (MOCK):`, mockResult);
    
    return mockResult;
  }

  /**
   * Mock: Encontra uma pasta ou cria se não existir
   */
  async findOrCreateFolder(folderName: string, parentId: string): Promise<FolderInfo> {
    console.log(`📁 MOCK: Encontrar/criar pasta "${folderName}" em ${parentId}`);
    await this.delay(200);
    
    return {
      id: `mock_folder_${folderName}_${Date.now()}`,
      name: folderName,
      url: `https://drive.google.com/drive/folders/mock_folder_${folderName}_${Date.now()}`
    };
  }

  /**
   * Mock: Encontra uma pasta específica
   */
  async findFolder(folderName: string, parentId: string): Promise<FolderInfo | null> {
    console.log(`🔍 MOCK: Buscando pasta "${folderName}" em ${parentId}`);
    await this.delay(150);
    
    // Simular que sempre encontra a pasta (para testes)
    return {
      id: `mock_found_${folderName}_${Date.now()}`,
      name: folderName,
      url: `https://drive.google.com/drive/folders/mock_found_${folderName}_${Date.now()}`
    };
  }

  /**
   * Mock: Faz upload de arquivo
   */
  async uploadFile(params: {
    name: string;
    filePath: string;
    parentFolderId: string;
  }): Promise<{ id: string; name: string; url: string }> {
    console.log(`📤 MOCK: Upload "${params.name}" para pasta ${params.parentFolderId}`);
    await this.delay(300);
    
    const fileId = `mock_uploaded_${Date.now()}`;
    
    return {
      id: fileId,
      name: params.name,
      url: `https://drive.google.com/file/d/${fileId}/view`
    };
  }

  /**
   * Obtém ano e mês atual formatados
   */
  private getCurrentYearMonth(): { year: string; month: string } {
    const now = new Date();
    
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const year = now.getFullYear().toString();
    const mesNumero = String(now.getMonth() + 1).padStart(2, '0');
    const monthName = this.capitalizarPrimeiraLetra(meses[now.getMonth()]);
    const month = `${mesNumero}. ${monthName}`;
    
    return { year, month };
  }

  /**
   * Capitaliza primeira letra
   */
  private capitalizarPrimeiraLetra(str: string): string {
    if (str.length === 0) {
      return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Simula delay de API
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
