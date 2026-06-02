import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expansion } from './expansion.entity';

@Injectable()
export class ExpansionRepository {
  constructor(
    @InjectRepository(Expansion)
    private readonly repo: Repository<Expansion>,
  ) {}

  async findAll(): Promise<Expansion[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<Expansion | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<Expansion>): Promise<Expansion> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }
}
