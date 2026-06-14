import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('class_armor')
export class ClassArmor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'class_name', length: 50, unique: true })
  className!: string;

  @Column({ name: 'armor_subclass', length: 20 })
  armorSubclass!: string;
}
