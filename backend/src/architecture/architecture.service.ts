import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Architecture } from './architecture.entity';

@Injectable()
export class ArchitectureService {
  constructor(
    @InjectRepository(Architecture)
    private architectureRepository: Repository<Architecture>,
  ) {}

  async findAll(): Promise<Architecture[]> {
    return this.architectureRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Architecture> {
    return this.architectureRepository.findOne({ where: { id } });
  }

  async findLatest(): Promise<Architecture> {
    const results = await this.architectureRepository.find({
      order: { updatedAt: 'DESC' },
      take: 1,
    });
    return results[0];
  }

  async create(data: { nodes: any[]; edges: any[] }): Promise<Architecture> {
    const architecture = this.architectureRepository.create({
      data,
      name: 'Architecture',
    });
    return this.architectureRepository.save(architecture);
  }

  async update(id: string, data: { nodes: any[]; edges: any[] }): Promise<Architecture> {
    await this.architectureRepository.update(id, { data });
    return this.findOne(id);
  }

  async saveOrUpdate(data: { nodes: any[]; edges: any[] }): Promise<Architecture> {
    const latest = await this.findLatest();
    if (latest) {
      return this.update(latest.id, data);
    }
    return this.create(data);
  }
}
