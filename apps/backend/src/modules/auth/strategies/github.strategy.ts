import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

export interface GitHubProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl: string;
}

interface GitHubPassportProfile {
  id: string;
  username?: string;
  displayName?: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get<string>('GITHUB_CLIENT_ID') || 'dummy-client-id';
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET') || 'dummy-client-secret';
    const callbackURL = configService.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:4001/api/v1/auth/github/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GitHubPassportProfile,
    done: (error: Error | null, user?: GitHubProfile) => void,
  ): Promise<void> {
    const { id, username, displayName, emails, photos } = profile;

    // Get primary email from emails array
    const primaryEmail = emails?.find((e) => e.value)?.value;
    if (!primaryEmail) {
      return done(new Error('No email provided from GitHub'));
    }

    const githubProfile: GitHubProfile = {
      id: id.toString(),
      email: primaryEmail,
      name: displayName || username || primaryEmail.split('@')[0],
      username: username || '',
      avatarUrl: photos?.[0]?.value || '',
    };

    done(null, githubProfile);
  }
}
