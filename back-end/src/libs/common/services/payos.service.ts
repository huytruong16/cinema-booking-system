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

    async getPaymentLinkUrl(orderCode: number, amount: number, description: string): Promise<{ paymentLinkId: string, checkoutUrl: string }> {
        const now = Math.floor(Date.now() / 1000);
        const expiredAt = now + 10 * 60;

        const body = {
            orderCode,
            amount,
            description,
            expiredAt,
            returnUrl: 'http://localhost:3000/success',
            cancelUrl: 'http://localhost:3000/cancel',
        };

        const data = await this.payos.createPaymentLink(body);
        return {
            paymentLinkId: data.paymentLinkId,
            checkoutUrl: data.checkoutUrl,
        };
    }

    verifyPaymentWebhookData(webhookBody: any): { data: any; verified: boolean } {
        try {
            const res = this.payos.verifyPaymentWebhookData(webhookBody);
            const data = (res && typeof res === 'object' && 'data' in res) ? (res as any).data : res;
            return { data, verified: true };
        } catch {
            return { data: null, verified: false };
        }
    }
}