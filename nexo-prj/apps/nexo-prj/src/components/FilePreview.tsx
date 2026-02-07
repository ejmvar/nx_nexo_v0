'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

interface FilePreviewProps {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export default function FilePreview({
  fileId,
  fileName,
  mimeType,
  fileUrl,
  onClose,
  onDownload,
  onDelete,
}: FilePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getFileCategory = () => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (
      mimeType.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/javascript' ||
      mimeType === 'application/typescript'
    )
      return 'text';
    return 'unsupported';
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Direct fetch for blob response
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/files/${fileId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      // Create blob URL and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      onDownload();
    } catch (err: any) {
      setError(err.message || 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(`/api/files/${fileId}`);
      onDelete();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    const category = getFileCategory();

    if (category === 'image') {
      return (
        <img
          src={fileUrl}
          alt={fileName}
          className="max-h-[70vh] max-w-full object-contain mx-auto"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Failed to load image');
            setLoading(false);
          }}
        />
      );
    }

    if (category === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[70vh] border-0"
          title={fileName}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Failed to load PDF');
            setLoading(false);
          }}
        />
      );
    }

    if (category === 'text') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[70vh] border-0 bg-white"
          title={fileName}
          sandbox="allow-same-origin"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Failed to load text file');
            setLoading(false);
          }}
        />
      );
    }

    // Unsupported file type
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Preview not available</h3>
        <p className="text-sm text-gray-500 mb-6">
          This file type cannot be previewed. Download it to view the contents.
        </p>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download File
        </button>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{fileName}</h2>
            <p className="text-sm text-gray-500 truncate">{mimeType}</p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Download"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close (ESC)"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-50 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-sm text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-red-500 mx-auto mb-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!error && renderPreview()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Press ESC to close</p>
            <div className="flex space-x-2">
              <button
                onClick={handleDownload}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Download
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
