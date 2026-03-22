import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Architecture } from './architecture.entity';
import { ArchitectureService } from './architecture.service';
import { ArchitectureController } from './architecture.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Architecture])],
  controllers: [ArchitectureController],
  providers: [ArchitectureService],
  exports: [ArchitectureService],
})
export class ArchitectureModule {}
