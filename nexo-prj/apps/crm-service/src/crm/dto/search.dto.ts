import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Base DTO for pagination and sorting
export class BasePaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc', 'ASC', 'DESC'])
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC' = 'desc';
}

// Search Clients DTO
export class SearchClientsDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;
}

// Search Employees DTO
export class SearchEmployeesDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'on_leave'])
  status?: 'active' | 'inactive' | 'on_leave';

  @IsOptional()
  @IsDateString()
  hiredAfter?: string;

  @IsOptional()
  @IsDateString()
  hiredBefore?: string;
}

// Search Suppliers DTO
export class SearchSuppliersDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;
}

// Search Professionals DTO
export class SearchProfessionalsDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minHourlyRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxHourlyRate?: number;

  @IsOptional()
  @IsEnum(['available', 'busy', 'unavailable'])
  status?: 'available' | 'busy' | 'unavailable';
}

// Search Projects DTO
export class SearchProjectsDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsEnum(['planning', 'active', 'completed', 'on_hold', 'cancelled'])
  status?: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';

  @IsOptional()
  @IsDateString()
  startDateAfter?: string;

  @IsOptional()
  @IsDateString()
  startDateBefore?: string;

  @IsOptional()
  @IsDateString()
  endDateAfter?: string;

  @IsOptional()
  @IsDateString()
  endDateBefore?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minBudget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxBudget?: number;
}

// Search Tasks DTO
export class SearchTasksDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'])
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @IsOptional()
  @IsDateString()
  dueDateAfter?: string;

  @IsOptional()
  @IsDateString()
  dueDateBefore?: string;
}
