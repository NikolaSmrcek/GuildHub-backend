import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('races')
export class Race {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 20 })
  faction!: string;
}
