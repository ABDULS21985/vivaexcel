import { IsUUID } from 'class-validator';

export class ReportViewDto {
  @IsUUID()
  videoId: string;
}
