import { PartialType } from '@nestjs/swagger';
import { CreateSolutionDocumentDto } from './create-solution-document.dto';

export class UpdateSolutionDocumentDto extends PartialType(CreateSolutionDocumentDto) {}
