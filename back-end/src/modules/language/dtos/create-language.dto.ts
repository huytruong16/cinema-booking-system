import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLanguageDto {
  @ApiProperty({
    description: 'Tên ngôn ngữ',
    example: 'Tiếng Việt',
  })
  @IsString()
  @IsNotEmpty()
  TenNgonNgu: string;
}
