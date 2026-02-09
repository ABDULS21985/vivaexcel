import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TokenService, JwtPayload } from '../services/token.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: JwtPayload,
  ): Promise<{
    userId: string;
    email: string;
    refreshToken: string;
    tokenFamily: string;
  }> {
    // Verify this is a refresh token
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const refreshToken = (request.body as { refreshToken?: string })
      ?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    // Verify the refresh token is still valid in the database
    const isValid = await this.tokenService.isRefreshTokenValid(refreshToken);
    if (!isValid) {
      throw new UnauthorizedException(
        'Refresh token has been revoked or expired',
      );
    }

    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
      tokenFamily: payload.tokenFamily || '',
    };
  }
}
