import { IsString, IsNotEmpty, IsOptional, IsInt, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  color: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
