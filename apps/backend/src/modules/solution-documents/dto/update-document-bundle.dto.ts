import { PartialType } from '@nestjs/swagger';
import { CreateDocumentBundleDto } from './create-document-bundle.dto';

export class UpdateDocumentBundleDto extends PartialType(CreateDocumentBundleDto) {}
