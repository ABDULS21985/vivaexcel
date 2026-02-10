import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsOptional, ArrayMinSize } from 'class-validator';
import { TeamMemberRole } from '../entities/team-member.entity';

export class InviteMembersDto {
  @ApiProperty({
    type: [String],
    example: ['user1@company.com', 'user2@company.com'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  emails: string[];

  @ApiPropertyOptional({ enum: TeamMemberRole, default: TeamMemberRole.MEMBER })
  @IsOptional()
  @IsEnum(TeamMemberRole)
  role?: TeamMemberRole;
}
