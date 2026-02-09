import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateFAQDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    answer: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateFAQDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    question?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    answer?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
