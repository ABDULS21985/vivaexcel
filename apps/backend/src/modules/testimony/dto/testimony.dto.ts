import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateTestimonyDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    quote: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    author: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    position: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    company: string;

    @ApiPropertyOptional({ default: 5 })
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    isVerified?: boolean;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateTestimonyDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    quote?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    author?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    position?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    company?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isVerified?: boolean;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
