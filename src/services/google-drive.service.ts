import { Injectable } from '@nestjs/common';
import { 
  LeadEnvironmentData, 
  LeadEnvironmentResult, 
  FolderInfo, 
  DocumentInfo 
} from '../interfaces/google-drive.interfaces';

@Injectable()
export class GoogleDriveService {
  private readonly baseVendasFolderId = '1CXv4WdKVnyopaGBToq4PMXBbImz39wGu'; // 01 - VENDAS E PROJETOS
  
  /**
   * Cria ambiente completo do lead no Google Drive
   * Equivale ao workflow "Amb__Lead_no_Driver.json"
   */
  async createLeadEnvironment(data: LeadEnvironmentData): Promise<LeadEnvironmentResult> {
    try {
      // 1. Obter ano e mês atual
      const { year, month } = this.getCurrentYearMonth();
      
      // 2. Criar/verificar estrutura de pastas: Ano -> Mês -> ANDAMENTO
      const yearFolder = await this.ensureFolderExists(year, this.baseVendasFolderId);
      const monthFolder = await this.ensureFolderExists(month, yearFolder.id);
      const andamentoFolder = await this.ensureFolderExists('ANDAMENTO', monthFolder.id);
      
      // 3. Criar pasta do cliente
      const clientFolderName = `${data.ticketId} - ${data.customerName}`;
      const clientFolder = await this.ensureFolderExists(clientFolderName, andamentoFolder.id);
      
      // 4. Criar documento do cliente
      const documentName = `Preferências - ${data.customerName}`;
      const document = await this.createDocument(documentName, clientFolder.id);
      
      return {
        folderId: clientFolder.id,
        documentId: document.id,
        documentUrl: document.url
      };
      
    } catch (error) {
      console.error('Erro ao criar ambiente do lead:', error);
      throw error;
    }
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
   * Verifica se pasta existe, se não, cria
   */
  private async ensureFolderExists(folderName: string, parentId: string): Promise<FolderInfo> {
    // Simular verificação e criação de pasta
    // Em uma implementação real, aqui faria as chamadas para Google Drive API
    const folderId = this.generateMockId();
    
    console.log(`📁 Google Drive: Verificando/Criando pasta "${folderName}" em parent ${parentId}`);
    console.log(`✅ Pasta "${folderName}" disponível com ID: ${folderId}`);
    
    return {
      id: folderId,
      name: folderName,
      parents: [parentId]
    };
  }

  /**
   * Cria documento Google Docs
   */
  private async createDocument(documentName: string, folderId: string): Promise<DocumentInfo> {
    // Simular criação de documento
    // Em uma implementação real, aqui faria a chamada para Google Docs API
    const documentId = this.generateMockId();
    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    
    console.log(`📄 Google Docs: Criando documento "${documentName}" na pasta ${folderId}`);
    console.log(`✅ Documento criado com ID: ${documentId}`);
    console.log(`🔗 URL: ${documentUrl}`);
    
    return {
      id: documentId,
      name: documentName,
      url: documentUrl
    };
  }

  /**
   * Encontra uma pasta ou cria se não existir
   */
  async findOrCreateFolder(folderName: string, parentId: string): Promise<FolderInfo> {
    return this.ensureFolderExists(folderName, parentId);
  }

  /**
   * Encontra uma pasta específica
   */
  async findFolder(folderName: string, parentId: string): Promise<FolderInfo | null> {
    try {
      // Simular busca de pasta
      console.log(`🔍 Buscando pasta: ${folderName} em ${parentId}`);
      
      // Em uma implementação real, seria feita a busca via Google Drive API
      // Por enquanto, simular que encontrou a pasta
      return {
        id: `folder_${folderName}_${Date.now()}`,
        name: folderName,
        url: `https://drive.google.com/drive/folders/folder_${folderName}_${Date.now()}`
      };

    } catch (error) {
      console.error(`❌ Erro ao buscar pasta ${folderName}:`, error);
      return null;
    }
  }

  /**
   * Faz upload de arquivo
   */
  async uploadFile(params: {
    name: string;
    filePath: string;
    parentFolderId: string;
  }): Promise<{ id: string; name: string; url: string }> {
    try {
      console.log(`📤 Fazendo upload: ${params.name} para pasta ${params.parentFolderId}`);
      
      // Em uma implementação real, seria feito upload via Google Drive API
      // Por enquanto, simular o upload
      const fileId = `file_${Date.now()}`;
      
      return {
        id: fileId,
        name: params.name,
        url: `https://drive.google.com/file/d/${fileId}/view`
      };

    } catch (error) {
      console.error(`❌ Erro ao fazer upload de ${params.name}:`, error);
      throw error;
    }
  }

  /**
   * Gera ID mock para simulação
   */
  private generateMockId(): string {
    return 'mock_' + Math.random().toString(36).substring(2, 15);
  }
}
