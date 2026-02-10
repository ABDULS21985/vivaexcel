import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateVideoCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
