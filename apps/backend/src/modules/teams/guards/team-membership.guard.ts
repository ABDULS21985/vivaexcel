import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../entities/team-member.entity';
import { RequestWithUser } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class TeamMembershipGuard implements CanActivate {
  constructor(
    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.sub;
    const teamId = request.params?.teamId as string | undefined;

    if (!userId || !teamId) {
      throw new ForbiddenException('Missing user or team context');
    }

    const member = await this.memberRepository.findOne({
      where: { teamId, userId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Attach member info to request for downstream use
    (request as any).teamMember = member;

    return true;
  }
}
