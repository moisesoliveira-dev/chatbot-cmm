export interface GoogleDriveConfig {
  // Configurações para Google Drive (futuro - OAuth2, Service Account, etc)
  enabled: boolean;
}

export interface FolderInfo {
  id: string;
  name: string;
  url?: string;
  parents?: string[];
}

export interface DocumentInfo {
  id: string;
  name: string;
  url: string;
}

export interface LeadEnvironmentData {
  customerName: string;
  ticketId: number;
  contactId: number;
}

export interface LeadEnvironmentResult {
  folderId: string;
  documentId: string;
  documentUrl: string;
}
