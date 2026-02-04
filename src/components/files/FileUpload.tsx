import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { uploadFile } from '../../services/api';

interface FileUploadProps {
  currentFolderId: string | null;
  onUploadComplete: () => void;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.mp3', '.wav'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUpload: React.FC<FileUploadProps> = ({ currentFolderId, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
      }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit. Current size: ${formatFileSize(file.size)}`;
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await uploadFile(selectedFile, currentFolderId);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      setSelectedFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call onUploadComplete after a brief delay to show success
      setTimeout(() => {
        onUploadComplete();
        setSuccess(false);
        setUploadProgress(0);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload file');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-fb-card border border-fb-border rounded-lg shadow-fb p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Upload File</h3>

      {/* File picker */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={ALLOWED_EXTENSIONS.join(',')}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isUploading
              ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
              : 'border-fb-border bg-fb-hover hover:bg-gray-700 hover:border-blue-500'
          }`}
        >
          <Upload className="text-gray-400 mb-2" size={32} />
          <p className="text-sm text-gray-400">
            Click to select file
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, DOCX, PPTX, XLSX, MP3, WAV (max 10MB)
          </p>
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/60 rounded-lg">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700/60 rounded-lg flex items-center gap-2">
          <CheckCircle className="text-green-400" size={18} />
          <p className="text-sm text-green-200">File uploaded successfully!</p>
        </div>
      )}

      {/* Selected file preview */}
      {selectedFile && (
        <div className="mb-4 p-4 bg-fb-hover border border-fb-border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <File className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={handleRemoveFile}
                className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="mb-3">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{uploadProgress}%</p>
            </div>
          )}

          {/* Upload button */}
          {!isUploading && !success && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload File
            </button>
          )}

          {isUploading && (
            <p className="text-sm text-gray-400 text-center">Uploading...</p>
          )}
        </div>
      )}

      {/* Info text */}
      {!selectedFile && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>Supported file types:</p>
          <ul className="list-disc list-inside pl-2 space-y-0.5">
            <li>Documents: PDF, DOC, DOCX</li>
            <li>Presentations: PPT, PPTX</li>
            <li>Spreadsheets: XLS, XLSX</li>
            <li>Audio: MP3, WAV</li>
          </ul>
          <p className="mt-2">Maximum file size: 10MB</p>
        </div>
      )}
    </div>
  );
};
