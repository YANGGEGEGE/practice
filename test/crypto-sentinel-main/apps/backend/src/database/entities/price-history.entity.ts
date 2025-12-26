import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('price_history')
@Index(['symbol', 'timestamp'])
export class PriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  symbol: string;

  @Column('decimal', { precision: 20, scale: 8 })
  price: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  volume: number;

  @Column('bigint')
  timestamp: number;

  @CreateDateColumn()
  createdAt: Date;
}
