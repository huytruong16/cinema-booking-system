import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { SupabaseModule } from 'nestjs-supabase-js';

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
import { StorageModule } from './modules/storage/storage.module';
import { GenreModule } from './modules/genre/genre.module';
import { FormatModule } from './modules/format/format.module';
import { LanguageModule } from './modules/language/language.module';
import { RatingModule } from './modules/rating/rating.module';
import { ShowtimeModule } from './modules/showtime/showtime.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { TicketsModule } from './modules/tickets/tickets.module';

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

    SupabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'adminClient',
          supabaseConfig: {
            supabaseKey: configService.get<string>(
              'supabase.serviceRoleKey',
              '',
            ),
            supabaseUrl: configService.get<string>('supabase.url', ''),
          },
        },
        {
          name: 'anonClient',
          supabaseConfig: {
            supabaseKey: configService.get<string>('supabase.anonKey', ''),
            supabaseUrl: configService.get<string>('supabase.url', ''),
          },
        },
      ],
    }),

    AuthModule,
    RedisModule,
    PrismaModule,
    FilmModule,
    VoucherModule,
    ComboModule,
    ScreeningRoomModule,
    StorageModule,
    GenreModule,
    FormatModule,
    LanguageModule,
    RatingModule,
    ShowtimeModule,
    StatisticsModule,
    TicketsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
