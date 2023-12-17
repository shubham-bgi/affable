import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ClsModule } from "nestjs-cls";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies/snake-naming.strategy";
import { BullModule } from "@nestjs/bull";
import { FollowerModule } from "./modules/follower/follower.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.get("DB_TYPE"),
          entities: [__dirname + "/modules/**/**.entity{.ts,.js}"],
          migrations: [__dirname + "./migrations/**/*.ts"],
          host: configService.get("DB_HOST"),
          port: +configService.get("DB_PORT"),
          username: configService.get("DB_USERNAME"),
          password: configService.get("DB_PASSWORD"),
          database: configService.get("DB_DATABASE"),
          namingStrategy: new SnakeNamingStrategy(),
          charset: "utf8mb4",
          logging: false,
          synchronize: false,
        } as TypeOrmModuleAsyncOptions;
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get("REDIS_HOST"),
          port: +configService.get("REDIS_PORT"),
        },
      }),
    }),
    ClsModule,
    FollowerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
