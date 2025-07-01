export interface TicketApiResponse {
  ticketId: number;
  contactId: number;
  updatedAt: string;
  status: string;
}

export interface MessageTemplate {
  body: string;
}

export interface TimeComparison {
  inputDate: string;
  currentDateManaus: string;
  differenceInMinutes: number;
  passedOneHour: boolean;
}

export interface TicketRedirectRequest {
  userId: number;
}

export interface TicketStatusUpdateRequest {
  status: string;
}
