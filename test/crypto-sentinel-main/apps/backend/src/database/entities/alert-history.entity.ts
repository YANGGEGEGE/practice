import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('alert_history')
export class AlertHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  symbol: string;

  @Column({ length: 50 })
  alertType: string;

  @Column('decimal', { precision: 20, scale: 8 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  volatility: number;

  @Column({ length: 10 })
  timeframe: string;

  @Column('text', { nullable: true })
  message: string;

  @Column({ default: true })
  sent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
