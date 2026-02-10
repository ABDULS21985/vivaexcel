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
  Matches,
} from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @Matches(/^https?:\/\//, { message: 'thumbnailUrl must use http or https protocol' })
  thumbnailUrl: string;

  @IsUrl()
  @Matches(/^https?:\/\//, { message: 'videoUrl must use http or https protocol' })
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
