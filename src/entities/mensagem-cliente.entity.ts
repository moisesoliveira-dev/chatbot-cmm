import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_mensagem_cliente')
export class MensagemCliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  mediapath?: string;

  @Column({ nullable: true })
  body?: string;

  @Column({ nullable: true })
  mediatype?: string;

  @Column()
  ticketid: number;

  @Column()
  contactid: number;

  @Column({ nullable: true })
  userid?: number;

  @Column({ type: 'timestamp', nullable: true })
  lastmessageat?: Date;

  @Column({ nullable: true })
  nome?: string;

  @Column({ default: false })
  ematendimento: boolean;

  @Column({ default: false })
  finalizoutriagem: boolean;

  @Column({ default: false })
  stopchatbot: boolean;

  @Column({ nullable: true })
  templateid?: number;

  @Column({ default: false })
  pararmensagem: boolean;

  @Column({ nullable: true })
  lastmessage?: string;

  @Column({ default: 1 })
  state: number;

  @Column({ nullable: true })
  fase_arquivos?: string;

  @Column({ nullable: true })
  local_arquivo?: string;

  @Column({ nullable: true })
  id_atendente?: string;

  @Column({ nullable: true })
  data_medicao?: string;
}
