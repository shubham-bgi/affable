import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class EnQueueDto {
  @ApiPropertyOptional({ default: 1_000_000 })
  @IsNumber()
  @IsOptional()
  start: number;

  @ApiPropertyOptional({ default: 2_000_000 })
  @IsNumber()
  @IsOptional()
  end: number;

  @ApiPropertyOptional({ default: 100 })
  @IsNumber()
  @IsOptional()
  batch: number;
}
