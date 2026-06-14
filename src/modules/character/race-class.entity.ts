import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Race } from './race.entity';

@Entity('race_classes')
@Unique(['raceId', 'className'])
export class RaceClass {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'race_id' })
  raceId!: string;

  @ManyToOne(() => Race)
  @JoinColumn({ name: 'race_id' })
  race!: Race;

  @Column({ name: 'class_name', length: 50 })
  className!: string;
}
