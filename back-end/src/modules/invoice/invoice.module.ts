import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PayosService } from 'src/libs/common/services/payos.service';
import { TicketsService } from '../tickets/tickets.service';
import { PdfService } from '../pdf/pdf.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, PayosService, TicketsService, PdfService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
