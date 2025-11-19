import { Module } from '@nestjs/common';
import { FormatController } from './format.controller';
import { FormatService } from './format.service';

@Module({
    controllers: [FormatController],
    providers: [FormatService]
})
export class FormatModule { }
