import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Patch } from '../patch/patch.entity';
import { Boss } from '../boss/boss.entity';

@Entity('raids')
export class Raid {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'expansion_id' })
  expansionId!: string;

  @Column({ name: 'order', type: 'integer', nullable: true })
  order!: number;

  @Column({ name: 'available_from', type: 'date', nullable: true })
  availableFrom!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => Patch)
  @JoinTable({
    name: 'raid_patches',
    joinColumn: { name: 'raid_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'patch_id', referencedColumnName: 'id' },
  })
  patches!: Patch[];

  @OneToMany(() => Boss, (boss) => boss.raid)
  bosses!: Boss[];
}
