import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';

/**
 * DTO for updating file metadata
 */
export class UpdateFileDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  file_category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  file_tags?: string[];

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}
