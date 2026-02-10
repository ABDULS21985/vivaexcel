import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsInt,
  Min,
  IsUUID,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  thumbnailUrl: string;

  @IsUrl()
  videoUrl: string;

  @IsInt()
  @Min(0)
  duration: number;

  @IsUUID()
  channelId: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isLive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  isShort?: boolean;
}
