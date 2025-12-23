import { PartialType } from '@nestjs/swagger';
import { CreateFilmVersionDto } from './create-film-version.dto';
export class UpdateFilmVersionDto extends PartialType(CreateFilmVersionDto) {}
