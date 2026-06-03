import { Type } from 'class-transformer';
import { LinkType, NodeStatus, NodeType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class NetworkNodeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsEnum(NodeType)
  type!: NodeType;

  @IsString()
  @MaxLength(120)
  label!: string;

  @IsNumber()
  posX!: number;

  @IsNumber()
  posY!: number;

  @IsOptional()
  @IsNumber()
  posZ?: number;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(NodeStatus)
  status?: NodeStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;
}

export class ConnectionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  sourceId!: string;

  @IsString()
  targetId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  bandwidth?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  latency?: number;

  @IsOptional()
  @IsEnum(LinkType)
  linkType?: LinkType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;
}

export class SaveTopologyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NetworkNodeDto)
  nodes!: NetworkNodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectionDto)
  connections!: ConnectionDto[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
