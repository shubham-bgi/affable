import { CacheModule, HttpModule, Module } from "@nestjs/common";
import { FollowerController } from "./follower.controller";
import { FollowerService } from "./follower.service";
import * as http from "http";
import * as https from "https";
import { BullModule } from "@nestjs/bull";
import { FOLLOWER_QUEUE, Follower } from "./follower.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as redisStore from "cache-manager-redis-store";
import { ClickHouseModule } from "../clickHouse/clickHouse.module";

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          ttl: 0,
          max: 10_000_000,
          isGlobal: true,
          store: redisStore,
          socket: {
            host: configService.get("REDIS_HOST"),
            port: +configService.get("REDIS_PORT"),
          },
        };
      },
    }),
    TypeOrmModule.forFeature([Follower]),
    BullModule.registerQueue({
      name: FOLLOWER_QUEUE,
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 30000,
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
      }),
    }),
    ClickHouseModule,
  ],
  controllers: [FollowerController],
  providers: [FollowerService],
})
export class FollowerModule {}
