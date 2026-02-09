import { PartialType } from '@nestjs/swagger';
import { CreateBlogCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateBlogCategoryDto) {}
