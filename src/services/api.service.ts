import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { MessageTemplate, TicketApiResponse, TicketRedirectRequest, TicketStatusUpdateRequest } from '../interfaces/api.interfaces';

@Injectable()
export class ApiService {
  private readonly baseUrl = 'https://cmmodulados.gosac.com.br/api';
  private readonly integrationToken = 'INTEGRATION 1f7e1c970adf60b4ac6dc56afbc4edcd3ed52de8656fb38f7e899bff6889';
  private readonly ticketToken = 'INTEGRATION 0ddfe6600ac270ae602f509c3bf247dd8b581fe6672dc48fcb2853d91328';

  async sendMessage(ticketId: number, message: MessageTemplate): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages/${ticketId}`,
        message,
        {
          headers: {
            'Authorization': this.integrationToken,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`Message sent to ticket ${ticketId}:`, response.status);
    } catch (error) {
      console.error(`Error sending message to ticket ${ticketId}:`, error);
      throw new HttpException(
        'Failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getTicket(ticketId: number): Promise<TicketApiResponse> {
    try {
      const response: AxiosResponse<TicketApiResponse> = await axios.get(
        `${this.baseUrl}/tickets/${ticketId}`,
        {
          headers: {
            'Authorization': this.ticketToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting ticket ${ticketId}:`, error);
      throw new HttpException(
        'Failed to get ticket',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Redireciona ticket para um usuário específico
   * Baseado no workflow "Escolha_de_servi_o.json"
   */
  async redirectTicket(ticketId: number, userId: number): Promise<void> {
    try {
      const request: TicketRedirectRequest = { userId };
      const response = await axios.put(
        `${this.baseUrl}/tickets/${ticketId}`,
        request,
        {
          headers: {
            'Authorization': this.ticketToken,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`Ticket ${ticketId} redirected to user ${userId}:`, response.status);
    } catch (error) {
      console.error(`Error redirecting ticket ${ticketId} to user ${userId}:`, error);
      throw new HttpException(
        'Failed to redirect ticket',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Atualiza status do ticket
   * Baseado no workflow "Escolha_de_servi_o.json"
   */
  async updateTicketStatus(ticketId: number, status: string): Promise<void> {
    try {
      const request: TicketStatusUpdateRequest = { status };
      const response = await axios.put(
        `${this.baseUrl}/tickets/${ticketId}`,
        request,
        {
          headers: {
            'Authorization': this.ticketToken,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`Ticket ${ticketId} status updated to ${status}:`, response.status);
    } catch (error) {
      console.error(`Error updating ticket ${ticketId} status to ${status}:`, error);
      throw new HttpException(
        'Failed to update ticket status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
