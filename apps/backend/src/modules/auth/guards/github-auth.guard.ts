import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class GitHubAuthGuard extends AuthGuard('github') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    // Handle OAuth errors gracefully
    if (err || !user) {
      const response = context.switchToHttp().getResponse();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      response.redirect(
        `${frontendUrl}/auth/error?message=${encodeURIComponent(
          err?.message || 'GitHub authentication failed',
        )}`,
      );
      return null as TUser;
    }

    return user;
  }
}
