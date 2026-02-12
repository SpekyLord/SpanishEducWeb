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
    <div className="glass-card-elevated" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '1rem', marginTop: 0 }}>Upload File</h3>

      {/* File picker */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={ALLOWED_EXTENSIONS.join(',')}
          style={{ display: 'none' }}
          id="file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '128px',
            border: '2px dashed rgba(255,255,255,0.15)',
            borderRadius: '8px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, border-color 0.2s',
            backgroundColor: isUploading ? 'rgba(31,41,55,0.5)' : '#0f3460',
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => { if (!isUploading) { e.currentTarget.style.backgroundColor = '#1a3a6e'; e.currentTarget.style.borderColor = '#e94560'; } }}
          onMouseLeave={e => { if (!isUploading) { e.currentTarget.style.backgroundColor = '#0f3460'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; } }}
        >
          <Upload size={32} style={{ color: '#9ca3af', marginBottom: '8px' }} />
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
            Click to select file
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', margin: '4px 0 0' }}>
            PDF, DOCX, PPTX, XLSX, MP3, WAV (max 10MB)
          </p>
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ marginBottom: '1rem', padding: '12px', backgroundColor: 'rgba(127,29,29,0.3)', border: '1px solid rgba(185,28,28,0.6)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.875rem', color: '#fecaca', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div style={{ marginBottom: '1rem', padding: '12px', backgroundColor: 'rgba(20,83,45,0.3)', border: '1px solid rgba(21,128,61,0.6)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} style={{ color: '#4ade80' }} />
          <p style={{ fontSize: '0.875rem', color: '#bbf7d0', margin: 0 }}>File uploaded successfully!</p>
        </div>
      )}

      {/* Selected file preview */}
      {selectedFile && (
        <div style={{ marginBottom: '1rem', padding: '16px', backgroundColor: '#0f3460', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
              <File size={20} style={{ color: '#60a5fa', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f3f4f6', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', margin: '4px 0 0' }}>{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={handleRemoveFile}
                style={{ padding: '4px', color: '#9ca3af', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ height: '8px', backgroundColor: '#374151', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{ height: '100%', background: 'linear-gradient(to right, #e94560, #c9a96e)', transition: 'width 0.3s', borderRadius: '9999px', width: `${uploadProgress}%` }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', margin: '4px 0 0' }}>{uploadProgress}%</p>
            </div>
          )}

          {/* Upload button */}
          {!isUploading && !success && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn-accent-gradient"
              style={{ width: '100%', padding: '8px 16px', border: 'none', cursor: 'pointer', borderRadius: '8px', color: 'white', fontWeight: 500, fontSize: '0.875rem' }}
            >
              Upload File
            </button>
          )}

          {isUploading && (
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', margin: 0 }}>Uploading...</p>
          )}
        </div>
      )}

      {/* Info text */}
      {!selectedFile && (
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          <p style={{ margin: '0 0 4px' }}>Supported file types:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px', margin: '0 0 4px' }}>
            <li style={{ marginBottom: '2px' }}>Documents: PDF, DOC, DOCX</li>
            <li style={{ marginBottom: '2px' }}>Presentations: PPT, PPTX</li>
            <li style={{ marginBottom: '2px' }}>Spreadsheets: XLS, XLSX</li>
            <li style={{ marginBottom: '2px' }}>Audio: MP3, WAV</li>
          </ul>
          <p style={{ margin: '8px 0 0' }}>Maximum file size: 10MB</p>
        </div>
      )}
    </div>
  );
};
