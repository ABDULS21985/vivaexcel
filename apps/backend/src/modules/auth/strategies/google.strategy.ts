import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  picture: string;
  emailVerified: boolean;
}

interface GooglePassportProfile {
  id: string;
  displayName?: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID') || 'dummy-client-id';
    const clientSecret =
      configService.get<string>('GOOGLE_CLIENT_SECRET') || 'dummy-client-secret';
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:4001/api/v1/auth/google/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GooglePassportProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;

    const email = emails?.[0]?.value;
    if (!email) {
      return done(new Error('No email provided from Google'), undefined);
    }

    const googleProfile: GoogleProfile = {
      id,
      email,
      name:
        name?.givenName && name?.familyName
          ? `${name.givenName} ${name.familyName}`
          : profile.displayName || email.split('@')[0],
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos?.[0]?.value || '',
      emailVerified: emails?.[0]?.verified ?? true,
    };

    done(null, googleProfile);
  }
}
