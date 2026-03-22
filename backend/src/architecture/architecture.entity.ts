import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('architectures')
export class Architecture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb', { default: { nodes: [], edges: [] } })
  data: { nodes: any[]; edges: any[] };

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
