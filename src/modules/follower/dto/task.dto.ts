import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, Min, Max } from "class-validator";

export class EnQueueDto {
  @ApiPropertyOptional({ default: 1_000_000 })
  @IsNumber()
  @Min(1_000_000)
  @Max(2_000_000)
  @IsOptional()
  start: number;

  @ApiPropertyOptional({ default: 2_000_000 })
  @IsNumber()
  @Min(1_000_000)
  @Max(2_000_000)
  @IsOptional()
  end: number;

  @ApiPropertyOptional({ default: 100 })
  @Min(5)
  @Max(1000)
  @IsNumber()
  @IsOptional()
  batch: number;
}
