/**
 * Interfaces para o workflow de armazenamento de arquivos (Armazenar_arquivos.json)
 */

export interface FileStorageData {
  id: number;
  mediaPath: string;
  body: string;
  mediaType: string;
  ticketId: number;
  contactId: number;
  userId: number;
  nome: string;
  emAtendimento: boolean;
  finalizoutriagem: boolean;
  stopchatbot: boolean;
  templateId?: number;
  pararmensagem: boolean;
  lastmessage: string;
  state: number;
  fase_arquivos: string;
}

export interface FileDownloadResult {
  success: boolean;
  fileName?: string;
  fileId?: string;
  filePath?: string;
  error?: string;
}

export interface FileStorageResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  folderPath?: string;
  downloadResult?: FileDownloadResult;
  error?: string;
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
}

export interface StorageLocation {
  yearFolderId: string;
  monthFolderId: string;
  andamentoFolderId: string;
  clientFolderId: string;
}
