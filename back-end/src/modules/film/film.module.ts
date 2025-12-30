import { Module } from '@nestjs/common';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { FilmCronService } from './film.cron.service';

@Module({
  controllers: [FilmController],
  providers: [FilmService, FilmCronService],
})
export class FilmModule {}
