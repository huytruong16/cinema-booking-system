import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PayosService } from 'src/libs/common/services/payos.service';

@Module({
  imports: [PrismaModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, PayosService],
  exports: [InvoiceService],
})
export class InvoiceModule { }
