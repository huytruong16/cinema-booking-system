import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './config/redis.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { FilmModule } from './modules/film/film.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { ComboModule } from './modules/combo/combo.module';
import { ScreeningRoomModule } from './modules/screening-room/screening-room.module';
import { GenreModule } from './modules/genre/genre.module';
import { FormatModule } from './modules/format/format.module';
import { LanguageModule } from './modules/language/language.module';
import { RatingModule } from './modules/rating/rating.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: (configService.get<string>('jwt.accessTokenExpire') || '15m') as `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),

    AuthModule,
    RedisModule,
    PrismaModule,
    FilmModule,
    VoucherModule,
    ComboModule,
    ScreeningRoomModule,
    GenreModule,
    FormatModule,
    LanguageModule,
    RatingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
