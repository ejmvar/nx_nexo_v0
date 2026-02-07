'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { FileUpload } from '../../components/FileUpload';
import { FileList } from '../../components/FileList';

export default function FilesPage() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [filterEntityType, setFilterEntityType] = useState<string | undefined>();

  const categories = [
    { value: undefined, label: 'All Categories' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'avatar', label: 'Avatars' },
    { value: 'attachment', label: 'Attachments' },
    { value: 'contract', label: 'Contracts' },
    { value: 'invoice', label: 'Invoices' },
  ];

  const entityTypes = [
    { value: undefined, label: 'All Entities' },
    { value: 'client', label: 'Clients' },
    { value: 'project', label: 'Projects' },
    { value: 'task', label: 'Tasks' },
    { value: 'supplier', label: 'Suppliers' },
    { value: 'contact', label: 'Contacts' },
    { value: 'opportunity', label: 'Opportunities' },
  ];

  const handleUploadSuccess = () => {
    // Trigger file list refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Upload, manage, and organize your files
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upload New File
            </h2>
            <FileUpload
              category={selectedCategory}
              onSuccess={handleUploadSuccess}
              onError={(error) => {
                console.error('Upload error:', error);
              }}
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Filter Files
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label
                  htmlFor="category-filter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory || ''}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value || 'all'} value={cat.value || ''}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entity Type Filter */}
              <div>
                <label
                  htmlFor="entity-filter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Entity Type
                </label>
                <select
                  id="entity-filter"
                  value={filterEntityType || ''}
                  onChange={(e) =>
                    setFilterEntityType(e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {entityTypes.map((type) => (
                    <option key={type.value || 'all'} value={type.value || ''}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Files
              </h2>
              <button
                onClick={() => setRefreshTrigger((prev) => prev + 1)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <svg
                  className="w-4 h-4 inline-block mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>

            <FileList
              category={selectedCategory}
              entityType={filterEntityType}
              refreshTrigger={refreshTrigger}
              onDelete={(fileId) => {
                console.log('File deleted:', fileId);
              }}
              onDownload={(file) => {
                console.log('File downloaded:', file.original_filename);
              }}
            />
          </div>

          {/* Stats */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-blue-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-blue-800">
                <strong>Account:</strong> {user?.email} • Files are isolated to
                your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
