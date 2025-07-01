import { Injectable, Inject } from '@nestjs/common';
import axios from 'axios';
import { 
  FileStorageData, 
  FileStorageResult, 
  FileDownloadResult,
  FileMetadata,
  StorageLocation 
} from '../interfaces/file-storage.interfaces';
import { GoogleDriveService } from './google-drive.service';
import { TimeService } from './time.service';

@Injectable()
export class FileStorageService {
  constructor(
    @Inject('GoogleDriveService')
    private googleDriveService: GoogleDriveService | any,
    private timeService: TimeService,
  ) {}

  /**
   * Processa o armazenamento de arquivo completo
   * Equivale ao workflow "Armazenar_arquivos.json"
   */
  async processFileStorage(data: FileStorageData): Promise<FileStorageResult> {
    try {
      console.log(`📁 Iniciando armazenamento de arquivo para cliente: ${data.nome}`);

      // 1. Obter estrutura de pastas
      const storageLocation = await this.getStorageLocation(data);

      // 2. Baixar arquivo do WhatsApp
      const downloadResult = await this.downloadWhatsAppFile(data.mediaPath);
      
      if (!downloadResult.success) {
        throw new Error(`Erro ao baixar arquivo: ${downloadResult.error}`);
      }

      // 3. Fazer upload para o Google Drive
      const fileName = this.generateFileName(data, downloadResult);
      const fileId = await this.uploadToGoogleDrive(
        downloadResult.filePath!,
        fileName,
        storageLocation.clientFolderId
      );

      const result: FileStorageResult = {
        success: true,
        fileId,
        fileName,
        folderPath: `${data.ticketId} - ${data.nome}`,
        downloadResult
      };

      console.log(`✅ Arquivo armazenado com sucesso:`, result);
      return result;

    } catch (error) {
      console.error('❌ Erro ao processar armazenamento de arquivo:', error);
      return {
        success: false,
        error: error.message,
        downloadResult: { success: false, error: error.message }
      };
    }
  }

  /**
   * Obtém a estrutura de pastas necessária
   */
  private async getStorageLocation(data: FileStorageData): Promise<StorageLocation> {
    const { year, month } = this.timeService.getCurrentYearMonth();
    
    // Navegar pela estrutura: VENDAS -> Ano -> Mês -> ANDAMENTO -> Cliente
    const baseVendasFolderId = '1CXv4WdKVnyopaGBToq4PMXBbImz39wGu';
    
    const yearFolder = await this.googleDriveService.findOrCreateFolder(year, baseVendasFolderId);
    const monthFolder = await this.googleDriveService.findOrCreateFolder(month, yearFolder.id);
    const andamentoFolder = await this.googleDriveService.findOrCreateFolder('ANDAMENTO', monthFolder.id);
    
    const clientFolderName = `${data.ticketId} - ${data.nome}`;
    const clientFolder = await this.googleDriveService.findFolder(clientFolderName, andamentoFolder.id);
    
    if (!clientFolder) {
      // Se pasta do cliente não existe, criar usando o GoogleDriveService
      const newClientFolder = await this.googleDriveService.findOrCreateFolder(clientFolderName, andamentoFolder.id);
      return {
        yearFolderId: yearFolder.id,
        monthFolderId: monthFolder.id,
        andamentoFolderId: andamentoFolder.id,
        clientFolderId: newClientFolder.id
      };
    }

    return {
      yearFolderId: yearFolder.id,
      monthFolderId: monthFolder.id,
      andamentoFolderId: andamentoFolder.id,
      clientFolderId: clientFolder.id
    };
  }

  /**
   * Faz download do arquivo do WhatsApp
   */
  private async downloadWhatsAppFile(mediaPath: string): Promise<FileDownloadResult> {
    try {
      console.log(`📥 Baixando arquivo do WhatsApp: ${mediaPath}`);

      const response = await axios({
        method: 'GET',
        url: mediaPath,
        responseType: 'arraybuffer',
        timeout: 30000, // 30 segundos timeout
        headers: {
          'User-Agent': 'CMM-Chatbot/1.0'
        }
      });

      // Extrair nome do arquivo da URL
      const urlParts = mediaPath.split('/');
      const fileName = urlParts[urlParts.length - 1] || 'arquivo_whatsapp';
      
      // Simular salvamento local temporário (em produção, usar storage temporário)
      const tempFilePath = `/tmp/${Date.now()}_${fileName}`;

      return {
        success: true,
        fileName,
        filePath: tempFilePath,
      };

    } catch (error) {
      console.error('❌ Erro ao baixar arquivo do WhatsApp:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gera nome do arquivo baseado nos dados
   */
  private generateFileName(data: FileStorageData, downloadResult: FileDownloadResult): string {
    const baseFileName = downloadResult.fileName || 'arquivo';
    const clientName = data.nome.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().getTime();
    
    // Se há body (descrição), incluir no nome
    if (data.body && data.body.trim()) {
      const description = data.body.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_');
      return `${clientName}_${description}_${timestamp}_${baseFileName}`;
    }
    
    return `${clientName}_${timestamp}_${baseFileName}`;
  }

  /**
   * Faz upload para o Google Drive
   */
  private async uploadToGoogleDrive(
    filePath: string, 
    fileName: string, 
    folderId: string
  ): Promise<string> {
    try {
      console.log(`📤 Fazendo upload para Google Drive: ${fileName}`);
      
      // Em uma implementação real, seria feito o upload do arquivo
      // Por enquanto, simular o processo
      const result = await this.googleDriveService.uploadFile({
        name: fileName,
        filePath: filePath,
        parentFolderId: folderId
      });

      return result.id;

    } catch (error) {
      console.error('❌ Erro ao fazer upload para Google Drive:', error);
      throw error;
    }
  }

  /**
   * Extrai metadados do arquivo
   */
  private extractFileMetadata(fileName: string, contentType?: string): FileMetadata {
    const parts = fileName.split('.');
    const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : 'unknown';
    const nameWithoutExtension = parts.join('.');

    return {
      originalName: fileName,
      mimeType: contentType || this.getMimeTypeFromExtension(extension),
      size: 0, // Seria obtido do arquivo real
      extension
    };
  }

  /**
   * Obtém MIME type baseado na extensão
   */
  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'txt': 'text/plain'
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }
}
