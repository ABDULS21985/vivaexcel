import { ApiProperty } from '@nestjs/swagger';

export class TopPostDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  views: number;

  @ApiProperty()
  uniqueViews: number;
}

export class DailyViewDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  views: number;
}

export class TrafficSourceItemDto {
  @ApiProperty()
  source: string;

  @ApiProperty()
  visits: number;

  @ApiProperty()
  percentage: number;
}

export class DashboardOverviewDto {
  @ApiProperty()
  totalViews: number;

  @ApiProperty()
  uniqueVisitors: number;

  @ApiProperty()
  totalPosts: number;

  @ApiProperty()
  totalSubscribers: number;

  @ApiProperty()
  subscriberGrowth: number;

  @ApiProperty({ type: [TopPostDto] })
  popularPosts: TopPostDto[];
}

export class PostStatsDto {
  @ApiProperty()
  totalViews: number;

  @ApiProperty()
  uniqueVisitors: number;

  @ApiProperty()
  avgTimeLabel: string;

  @ApiProperty({ type: [TrafficSourceItemDto] })
  topReferrers: TrafficSourceItemDto[];

  @ApiProperty({ type: [DailyViewDto] })
  dailyViews: DailyViewDto[];
}
