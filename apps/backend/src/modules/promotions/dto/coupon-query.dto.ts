import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';
import { DiscountType, CouponApplicableTo } from '../enums/promotion.enums';

export class CouponQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Search by code or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: DiscountType, description: 'Filter by discount type' })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ enum: CouponApplicableTo, description: 'Filter by applicable scope' })
  @IsOptional()
  @IsEnum(CouponApplicableTo)
  applicableTo?: CouponApplicableTo;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
