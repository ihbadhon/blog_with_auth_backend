import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class BlogSearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  keyword?: string;
}
