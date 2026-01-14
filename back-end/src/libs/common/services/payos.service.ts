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

  async getPaymentLinkUrl(
    orderCode: number,
    amount: number,
    description: string,
  ): Promise<{
    paymentLinkId: string;
    checkoutUrl: string;
    description: string;
  }> {
    const now = Math.floor(Date.now() / 1000);
    const expiredAt = now + 10 * 60;

    const body = {
      orderCode,
      amount,
      description,
      expiredAt,
      returnUrl: 'https://cinema-booking-system-opal.vercel.app/success',
      cancelUrl: 'https://cinema-booking-system-opal.vercel.app/cancel',
    };

    const data = await this.payos.createPaymentLink(body);
    return {
      paymentLinkId: data.paymentLinkId,
      checkoutUrl: data.checkoutUrl,
      description: data.description,
    };
  }

  verifyPaymentWebhookData(webhookBody: any): { data: any; verified: boolean } {
    try {
      const res = this.payos.verifyPaymentWebhookData(webhookBody);
      const data =
        res && typeof res === 'object' && 'data' in res
          ? (res as any).data
          : res;
      return { data, verified: true };
    } catch {
      return { data: null, verified: false };
    }
  }
}
