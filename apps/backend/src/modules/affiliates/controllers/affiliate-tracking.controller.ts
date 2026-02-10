import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { AffiliateService } from '../services/affiliate.service';

@ApiTags('Affiliate Tracking')
@Controller('ref')
export class AffiliateTrackingController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Public()
  @Get(':shortCode')
  @ApiOperation({ summary: 'Track affiliate click and redirect' })
  async trackAndRedirect(
    @Param('shortCode') shortCode: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers['referer'] || req.headers['referrer'];

    try {
      const { redirectUrl, sessionId } = await this.affiliateService.trackClick(
        shortCode,
        ip,
        userAgent,
        referrer as string,
      );

      // Set attribution cookie (30 days)
      res.cookie('_aff_session', sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: false, // Needs to be readable by frontend JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return res.redirect(HttpStatus.FOUND, redirectUrl);
    } catch {
      // If link not found, redirect to homepage
      return res.redirect(HttpStatus.FOUND, process.env.FRONTEND_URL || 'http://localhost:3000');
    }
  }
}
