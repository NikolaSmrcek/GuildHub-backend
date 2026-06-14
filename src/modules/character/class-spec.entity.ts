import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('class_specs')
@Unique(['className', 'specName'])
export class ClassSpec {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'class_name', length: 50 })
  className!: string;

  @Column({ name: 'spec_name', length: 50 })
  specName!: string;
}
