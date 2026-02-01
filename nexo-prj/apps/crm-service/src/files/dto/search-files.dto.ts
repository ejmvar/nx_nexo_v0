import { IsOptional, IsString, IsBoolean, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for searching/listing files
 */
export class SearchFilesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string; // Search in filename and description

  @IsOptional()
  @IsString()
  entity_type?: string;

  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @IsOptional()
  @IsString()
  file_category?: string;

  @IsOptional()
  @IsUUID()
  uploaded_by?: string;

  @IsOptional()
  @IsString()
  mime_type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_public?: boolean;
}
