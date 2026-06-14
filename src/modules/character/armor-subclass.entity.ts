import { Entity, PrimaryColumn } from 'typeorm';

@Entity('armor_subclasses')
export class ArmorSubclass {
  @PrimaryColumn({ name: 'name', length: 20 })
  name!: string;
}
