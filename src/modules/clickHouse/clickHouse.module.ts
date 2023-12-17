import { Module } from "@nestjs/common";
import { ClickHouseService } from "./clickHouse.service";

@Module({
  exports: [ClickHouseService],
  providers: [ClickHouseService],
})
export class ClickHouseModule {}
