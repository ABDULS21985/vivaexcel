import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
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
          err?.message || 'Google authentication failed',
        )}`,
      );
      return null as TUser;
    }

    return user;
  }
}
