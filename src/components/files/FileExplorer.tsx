import React, { useState, useEffect } from 'react';
import { ChevronRight, Folder as FolderIcon, File as FileIcon, Download, Trash2, X, Check, FolderPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFiles, getFilesInFolder, createFolder, deleteFileOrFolder, downloadFile, type Folder, type FileItem, type Breadcrumb } from '../../services/api';

interface FileExplorerProps {
  currentFolderId: string | null;
  onFolderChange: (folderId: string | null) => void;
  refreshKey?: number;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ currentFolderId, onFolderChange, refreshKey }) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [, setCurrentFolder] = useState<Folder | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'file' | 'folder'; name: string } | null>(null);

  // Load files and folders
  useEffect(() => {
    loadContents();
  }, [currentFolderId, refreshKey]);

  const loadContents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (currentFolderId) {
        const data = await getFilesInFolder(currentFolderId);
        setCurrentFolder(data.folder);
        setBreadcrumbs(data.breadcrumbs);
        setFolders(data.subfolders);
        setFiles(data.files);
      } else {
        const data = await getFiles();
        setCurrentFolder(null);
        setBreadcrumbs([]);
        setFolders(data.folders);
        setFiles(data.files);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = (folderId: string) => {
    onFolderChange(folderId);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      onFolderChange(null);
    } else {
      onFolderChange(breadcrumbs[index]._id);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    setError(null);

    try {
      await createFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setShowNewFolderInput(false);
      loadContents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const blob = await downloadFile(file._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to download file');
    }
  };

  const handleDelete = async (id: string, type: 'file' | 'folder') => {
    try {
      await deleteFileOrFolder(id, type);
      setDeleteConfirm(null);
      loadContents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (extension: string) => {
    const ext = extension.toLowerCase();
    const colorMap: Record<string, string> = {
      pdf: '#f87171',
      doc: '#c9a96e', docx: '#c9a96e',
      ppt: '#fb923c', pptx: '#fb923c',
      xls: '#4ade80', xlsx: '#4ade80',
      mp3: '#c084fc', wav: '#c084fc',
    };
    const color = colorMap[ext] || '#9ca3af';
    return <FileIcon size={20} style={{ color, flexShrink: 0 }} />;
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4ddd8', borderRadius: '8px', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', color: '#6b8a7a' }}>Loading files...</div>
      </div>
    );
  }

  return (
    <div className="glass-card-elevated">
      {/* Header with breadcrumbs */}
      <div style={{ padding: '16px', borderBottom: '1px solid #d4ddd8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a3a2a', margin: 0 }}>Files & Resources</h2>
          {isTeacher && !showNewFolderInput && (
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="btn-accent-gradient"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.875rem', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
            >
              <FolderPlus size={16} />
              New Folder
            </button>
          )}
        </div>

        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#6b8a7a', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: !currentFolderId ? '#b8860b' : '#6b8a7a', fontWeight: !currentFolderId ? 500 : 400, padding: 0, transition: 'color 0.2s', fontSize: '0.875rem' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#b8860b'; }}
            onMouseLeave={e => { if (currentFolderId) e.currentTarget.style.color = '#6b8a7a'; }}
          >
            Root
          </button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb._id}>
              <ChevronRight size={16} style={{ color: '#6b8a7a', flexShrink: 0 }} />
              <button
                onClick={() => handleBreadcrumbClick(index)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: index === breadcrumbs.length - 1 ? '#b8860b' : '#6b8a7a', fontWeight: index === breadcrumbs.length - 1 ? 500 : 400, padding: 0, transition: 'color 0.2s', fontSize: '0.875rem' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#b8860b'; }}
                onMouseLeave={e => { if (index !== breadcrumbs.length - 1) e.currentTarget.style.color = '#6b8a7a'; }}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ margin: '16px 16px 0', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* New folder input */}
      {showNewFolderInput && (
        <div style={{ padding: '16px', borderBottom: '1px solid #d4ddd8', backgroundColor: '#f0f4f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderIcon size={20} style={{ color: '#eab308', flexShrink: 0 }} />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }
              }}
              placeholder="Folder name..."
              autoFocus
              style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#1a3a2a', fontSize: '0.875rem' }}
              maxLength={100}
            />
            <button
              onClick={handleCreateFolder}
              disabled={isCreatingFolder || !newFolderName.trim()}
              style={{ padding: '4px', color: '#4ade80', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: (isCreatingFolder || !newFolderName.trim()) ? 0.5 : 1 }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(74,222,128,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => {
                setShowNewFolderInput(false);
                setNewFolderName('');
              }}
              disabled={isCreatingFolder}
              style={{ padding: '4px', color: '#9ca3af', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(156,163,175,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Contents */}
      <div style={{ padding: '16px' }}>
        {folders.length === 0 && files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b8a7a' }}>
            <FolderIcon size={48} style={{ margin: '0 auto 12px', opacity: 0.5, display: 'block' }} />
            <p style={{ margin: 0 }}>No files or folders here</p>
            {isTeacher && (
              <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>Upload files or create a folder to get started</p>
            )}
          </div>
        ) : (
          <div>
            {/* Folders */}
            {folders.map((folder) => (
              <div
                key={folder._id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', transition: 'background 0.2s', marginBottom: '4px' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e8ede8'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <button
                  onClick={() => handleFolderClick(folder._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <FolderIcon size={20} style={{ color: '#eab308', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#1a3a2a', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b8a7a', margin: 0 }}>
                      {folder.filesCount} {folder.filesCount === 1 ? 'file' : 'files'}
                    </p>
                  </div>
                </button>
                {isTeacher && folder.createdBy._id === user?._id && (
                  <button
                    onClick={() => setDeleteConfirm({ id: folder._id, type: 'folder', name: folder.name })}
                    style={{ padding: '8px', color: '#f87171', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}

            {/* Files */}
            {files.map((file) => (
              <div
                key={file._id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', transition: 'background 0.2s', marginBottom: '4px' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e8ede8'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  {getFileIcon(file.extension)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#1a3a2a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.originalName}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b8a7a', margin: 0 }}>
                      {formatFileSize(file.size)} · {file.downloadsCount} downloads
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleDownload(file)}
                    style={{ padding: '8px', color: '#b8860b', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s, transform 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(184,134,11,0.1)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <Download size={16} />
                  </button>
                  {isTeacher && file.uploadedBy._id === user?._id && (
                    <button
                      onClick={() => setDeleteConfirm({ id: file._id, type: 'file', name: file.originalName })}
                      style={{ padding: '8px', color: '#f87171', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div className="glass-card-elevated" style={{ padding: '1.5rem', maxWidth: '28rem', width: '100%' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a3a2a', marginBottom: '8px', marginTop: 0 }}>
              Delete {deleteConfirm.type === 'folder' ? 'Folder' : 'File'}?
            </h3>
            <p style={{ color: '#6b8a7a', marginBottom: '16px' }}>
              Are you sure you want to delete "{deleteConfirm.name}"?
              {deleteConfirm.type === 'folder' && (
                <span style={{ display: 'block', marginTop: '8px', fontSize: '0.875rem', color: '#dc2626' }}>
                  This will also delete all files and subfolders inside it.
                </span>
              )}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ padding: '8px 16px', backgroundColor: '#e8ede8', color: '#4a6a58', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#d4ddd8'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#e8ede8'; }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.type)}
                style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b91c1c'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
