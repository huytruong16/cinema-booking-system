import { BadRequestException } from '@nestjs/common';

export class CursorUtils {
  static encode(obj: Record<string, any>): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64');
  }

  static decode(cursor: string): any {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return null;
    }
  }

  static getPrismaOptions(
    dto: { limit?: number; cursor?: string },
    idField: string,
  ): any {
    return {
      limit: dto.limit,
      after: dto.cursor,
      getCursor: (item: any) => this.encode({ [idField]: item[idField] }),
      parseCursor: (cursor: string) => {
        const decoded = this.decode(cursor);
        if (!decoded || !decoded[idField]) {
          throw new BadRequestException('Cursor không hợp lệ');
        }
        return { [idField]: decoded[idField] };
      },
    };
  }
}
