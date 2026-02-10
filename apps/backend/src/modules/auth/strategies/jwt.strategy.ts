import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { SessionService } from '../services/session.service';
import { JwtPayload } from '../services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: JwtPayload,
  ): Promise<{ userId: string; email: string; role?: string; correlationId: string }> {
    // Verify this is an access token
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Extract the token from the header for blacklist check
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    // Check if token is blacklisted
    const isBlacklisted = await this.sessionService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      correlationId: payload.correlationId,
    };
  }
}
