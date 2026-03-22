import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ArchitectureService } from './architecture.service';

@Controller('architecture')
export class ArchitectureController {
  constructor(private readonly architectureService: ArchitectureService) {}

  @Get()
  async findAll() {
    const result = await this.architectureService.findLatest();
    return result || { nodes: [], edges: [] };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.architectureService.findOne(id);
  }

  @Post()
  async create(@Body() data: { nodes: any[]; edges: any[] }) {
    return this.architectureService.saveOrUpdate(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: { nodes: any[]; edges: any[] }) {
    return this.architectureService.update(id, data);
  }
}
