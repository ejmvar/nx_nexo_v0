'use client';

import { useState, useEffect } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import {
  Layout,
  Header,
  Sidebar,
  Main,
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Badge,
  Alert
} from '@nexo-prj/ui';

// Temporary Contact type definition until import issue is resolved
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo: string;
}

export default function Contacts() {
  noStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        // For demo purposes, we'll use mock data
        const mockContacts: Contact[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            company: 'Acme Corp',
            position: 'CEO',
            tags: ['VIP', 'Enterprise'],
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T14:30:00Z',
            createdBy: 'user1',
            assignedTo: 'user2',
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1 (555) 987-6543',
            company: 'Tech Solutions Inc',
            position: 'CTO',
            tags: ['Tech', 'Startup'],
            isActive: true,
            createdAt: '2024-01-10T09:15:00Z',
            updatedAt: '2024-01-18T11:45:00Z',
            createdBy: 'user1',
            assignedTo: 'user3',
          },
        ];

        setContacts(mockContacts);
      } catch (err) {
        setError('Failed to load contacts');
        console.error('Error fetching contacts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="success">Online</Badge>
            <Button variant="primary">Add Contact</Button>
          </div>
        </div>
      </Header>

      <div className="flex">
        <Sidebar>
          <nav className="space-y-2">
            <a href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Dashboard
            </a>
            <a href="/contacts" className="block px-4 py-2 bg-blue-50 text-blue-700 rounded">
              Contacts
            </a>
            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Projects
            </a>
            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Tasks
            </a>
            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Reports
            </a>
          </nav>
        </Sidebar>

        <Main>
          <div className="space-y-6">
            {error && (
              <Alert variant="error" title="Error">
                {error}
              </Alert>
            )}

            {/* Search and Filters */}
            <Card>
              <CardContent>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="secondary">Filter</Button>
                  <Button variant="secondary">Export</Button>
                </div>
              </CardContent>
            </Card>

            {/* Contacts List */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">
                  Contacts ({filteredContacts.length})
                </h3>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading contacts...</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No contacts found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{contact.email}</p>
                            <p className="text-sm text-gray-600">
                              {contact.company} • {contact.position}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {contact.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Main>
      </div>
    </Layout>
  );
}