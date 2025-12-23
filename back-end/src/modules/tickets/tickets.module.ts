import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfService } from '../pdf/pdf.service';

@Module({
  imports: [PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService, PdfService],
})
export class TicketsModule {}
