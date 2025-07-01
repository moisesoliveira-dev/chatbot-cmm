import { IsString, IsNumber, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ContactDto {
  @IsBoolean()
  isGroup: boolean;
}

export class TicketDto {
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @IsOptional()
  @IsString()
  createdAt?: string;
}

export class WebhookDataDto {
  @IsString()
  mediaType: string;

  @IsBoolean()
  fromMe: boolean;

  @IsNumber()
  contactId: number;

  @IsNumber()
  ticketId: number;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;

  @ValidateNested()
  @Type(() => TicketDto)
  ticket: TicketDto;
}

export class WebhookBodyDto {
  @ValidateNested()
  @Type(() => WebhookDataDto)
  data: WebhookDataDto;
}

export class WebhookDto {
  @ValidateNested()
  @Type(() => WebhookBodyDto)
  body: WebhookBodyDto;
}
