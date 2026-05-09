import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetaEntity } from './meta.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'user_cordillera',
      password: 'cordillera0101',
      database: 'metas_db',
      entities: [MetaEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([MetaEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}