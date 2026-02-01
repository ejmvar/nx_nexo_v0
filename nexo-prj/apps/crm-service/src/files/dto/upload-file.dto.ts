import { IsOptional, IsString, IsBoolean, IsArray, IsUUID } from 'class-validator';

/**
 * DTO for uploading a file
 */
export class UploadFileDto {
  @IsOptional()
  @IsString()
  entity_type?: string; // 'client', 'project', 'task', 'supplier', 'contact', 'opportunity'

  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @IsOptional()
  @IsString()
  file_category?: string; // 'document', 'image', 'avatar', 'attachment', 'contract', 'invoice'

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  file_tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}
