import { ApiClient, ApiResponse } from '../api-client.js';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  tags: string[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: Contact['address'];
  tags?: string[];
  notes?: string;
  assignedTo?: string;
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: Contact['address'];
  tags?: string[];
  notes?: string;
  assignedTo?: string;
  isActive?: boolean;
}

export interface ContactFilters {
  search?: string;
  company?: string;
  tags?: string[];
  assignedTo?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'company' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedContacts {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ContactsService {
  constructor(private apiClient: ApiClient) {}

  async getContacts(filters: ContactFilters = {}): Promise<ApiResponse<PaginatedContacts>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const query = params.toString();
    const endpoint = `/contacts${query ? `?${query}` : ''}`;

    return this.apiClient.get<PaginatedContacts>(endpoint);
  }

  async getContactById(id: string): Promise<ApiResponse<Contact>> {
    return this.apiClient.get<Contact>(`/contacts/${id}`);
  }

  async createContact(contact: CreateContactRequest): Promise<ApiResponse<Contact>> {
    return this.apiClient.post<Contact>('/contacts', contact);
  }

  async updateContact(id: string, contact: UpdateContactRequest): Promise<ApiResponse<Contact>> {
    return this.apiClient.put<Contact>(`/contacts/${id}`, contact);
  }

  async deleteContact(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/contacts/${id}`);
  }

  async bulkUpdateContacts(ids: string[], updates: UpdateContactRequest): Promise<ApiResponse<Contact[]>> {
    return this.apiClient.put<Contact[]>('/contacts/bulk', { ids, updates });
  }

  async exportContacts(filters: ContactFilters = {}): Promise<ApiResponse<Blob>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const query = params.toString();
    const endpoint = `/contacts/export${query ? `?${query}` : ''}`;

    return this.apiClient.get<Blob>(endpoint);
  }
}