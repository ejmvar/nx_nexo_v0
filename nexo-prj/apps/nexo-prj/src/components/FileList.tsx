'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import FilePreview from './FilePreview';

interface FileItem {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url?: string;
  mime_type: string;
  size: number;
  file_category?: string;
  entity_type?: string;
  entity_id?: string;
  is_public: boolean;
  created_at: string;
  uploaded_by_name?: string;
}

interface FileListProps {
  entityType?: string;
  entityId?: string;
  category?: string;
  onDelete?: (fileId: string) => void;
  onDownload?: (file: FileItem) => void;
  refreshTrigger?: number;
}

export function FileList({
  entityType,
  entityId,
  category,
  onDelete,
  onDownload,
  refreshTrigger,
}: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (entityType) params.append('entity_type', entityType);
      if (entityId) params.append('entity_id', entityId);
      if (category) params.append('file_category', category);

      const response = await apiClient.get<{ data: FileItem[] }>(
        `/api/files?${params.toString()}`,
      );

      setFiles(response.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load files';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [entityType, entityId, category, refreshTrigger]);

  const handleDownload = async (file: FileItem) => {
    try {
      // Direct fetch for blob response
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/files/${file.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.original_filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onDownload?.(file);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await apiClient.delete(`/files/${fileId}`);
      setFiles(files.filter((f) => f.id !== fileId));
      onDelete?.(fileId);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
      return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
    return '📎';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600 flex items-center">
          <svg
            className="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
        <button
          onClick={loadFiles}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-16 w-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-sm font-medium text-gray-900">No files</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload a file to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="text-3xl flex-shrink-0">
              {getFileIcon(file.mime_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.original_filename}
              </p>
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>{formatDate(file.created_at)}</span>
                {file.uploaded_by_name && (
                  <>
                    <span>•</span>
                    <span>by {file.uploaded_by_name}</span>
                  </>
                )}
                {file.file_category && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                      {file.file_category}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {file.mime_type.startsWith('image/') && file.file_url && (
              <button
                onClick={() => setPreviewFile(file)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Preview"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={() => handleDownload(file)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Download"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>

            <button
              onClick={() => handleDelete(file.id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* File Preview Modal */}
      {previewFile && previewFile.file_url && (
        <FilePreview
          fileId={previewFile.id}
          fileName={previewFile.filename}
          mimeType={previewFile.mime_type}
          fileUrl={previewFile.file_url}
          onClose={() => setPreviewFile(null)}
          onDownload={() => handleDownload(previewFile)}
          onDelete={() => {
            handleDelete(previewFile.id);
            setPreviewFile(null);
          }}
        />
      )}
    </div>
  );
}
