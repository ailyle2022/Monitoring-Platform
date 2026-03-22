import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchitectureModule } from './architecture/architecture.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'microservice_monitor',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ArchitectureModule,
    WebhookModule,
  ],
})
export class AppModule {}
