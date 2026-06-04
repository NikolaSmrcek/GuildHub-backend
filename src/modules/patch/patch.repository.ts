import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patch } from './patch.entity';

@Injectable()
export class PatchRepository {
  constructor(
    @InjectRepository(Patch)
    private readonly repo: Repository<Patch>,
  ) {}

  async findAll(): Promise<Patch[]> {
    return this.repo.find({ relations: { expansion: true, season: true } });
  }

  async findById(id: string): Promise<Patch | null> {
    return this.repo.findOne({ where: { id }, relations: { expansion: true, season: true } });
  }

  async findByExpansionId(expansionId: string): Promise<Patch[]> {
    return this.repo.find({ where: { expansionId }, relations: { expansion: true, season: true } });
  }

  async create(data: Partial<Patch>): Promise<Patch> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }
}
