import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTeamSettingsDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ssoEnabled?: boolean;

  @ApiPropertyOptional({ example: 'okta' })
  @IsOptional()
  @IsString()
  ssoProvider?: string;

  @ApiPropertyOptional({
    example: {
      entryPoint: 'https://idp.example.com/sso/saml',
      issuer: 'https://idp.example.com',
      cert: '-----BEGIN CERTIFICATE-----...',
    },
  })
  @IsOptional()
  ssoConfig?: Record<string, unknown>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  purchaseApprovalRequired?: boolean;

  @ApiPropertyOptional({ example: 10000.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyBudget?: number | null;

  @ApiPropertyOptional({ example: ['company.com', 'company.org'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  verifiedDomains?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  sharedLibraryEnabled?: boolean;

  @ApiPropertyOptional({
    example: {
      canPurchase: true,
      canDownload: true,
      canManageMembers: false,
      canViewAnalytics: false,
      canApproveRequests: false,
    },
  })
  @IsOptional()
  defaultMemberPermissions?: Record<string, boolean>;
}
