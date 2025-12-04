import { Injectable } from '@nestjs/common';
import PayOS from '@payos/node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayosService {
    private payos: PayOS;

    constructor(private configService: ConfigService) {
        this.payos = new PayOS(
            this.configService.get('payos.clientId')!,
            this.configService.get('payos.apiKey')!,
            this.configService.get('payos.checksumKey')!,
        );
    }

    async getPaymentLinkUrl(amount: number, description: string): Promise<string> {
        const orderCode = Date.now();

        const body = {
            orderCode,
            amount,
            description,
            returnUrl: 'http://localhost:3000/success',
            cancelUrl: 'http://localhost:3000/cancel',
        };

        return (await this.payos.createPaymentLink(body)).checkoutUrl;
    }
}
