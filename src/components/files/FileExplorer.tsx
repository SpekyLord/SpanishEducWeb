import React, { useState, useEffect } from 'react';
import { ChevronRight, Folder as FolderIcon, File as FileIcon, Download, Trash2, Plus, X, Check, FolderPlus } from 'lucide-react';
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
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);

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
      // Root
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
    if (['pdf'].includes(ext)) {
      return <FileIcon className="text-red-400" size={20} />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FileIcon className="text-blue-400" size={20} />;
    } else if (['ppt', 'pptx'].includes(ext)) {
      return <FileIcon className="text-orange-400" size={20} />;
    } else if (['xls', 'xlsx'].includes(ext)) {
      return <FileIcon className="text-green-400" size={20} />;
    } else if (['mp3', 'wav'].includes(ext)) {
      return <FileIcon className="text-purple-400" size={20} />;
    }
    return <FileIcon className="text-gray-400" size={20} />;
  };

  if (isLoading) {
    return (
      <div className="bg-fb-card border border-fb-border rounded-lg p-6">
        <div className="text-center text-gray-400">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="bg-fb-card border border-fb-border rounded-lg shadow-fb">
      {/* Header with breadcrumbs */}
      <div className="p-4 border-b border-fb-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-100">Files & Resources</h2>
          {isTeacher && !showNewFolderInput && (
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FolderPlus size={16} />
              New Folder
            </button>
          )}
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className={`hover:text-blue-400 transition-colors ${!currentFolderId ? 'text-blue-400 font-medium' : ''}`}
          >
            Root
          </button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb._id}>
              <ChevronRight size={16} />
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`hover:text-blue-400 transition-colors ${index === breadcrumbs.length - 1 ? 'text-blue-400 font-medium' : ''}`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/30 border border-red-700/60 rounded-lg">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* New folder input */}
      {showNewFolderInput && (
        <div className="p-4 border-b border-fb-border bg-[#1c1c1e]">
          <div className="flex items-center gap-2">
            <FolderIcon className="text-yellow-500" size={20} />
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
              className="flex-1 bg-transparent border-none focus:outline-none text-gray-100 placeholder-gray-500"
              maxLength={100}
            />
            <button
              onClick={handleCreateFolder}
              disabled={isCreatingFolder || !newFolderName.trim()}
              className="p-1 text-green-400 hover:bg-green-400/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => {
                setShowNewFolderInput(false);
                setNewFolderName('');
              }}
              disabled={isCreatingFolder}
              className="p-1 text-gray-400 hover:bg-gray-400/10 rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Contents */}
      <div className="p-4">
        {folders.length === 0 && files.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FolderIcon size={48} className="mx-auto mb-3 opacity-50" />
            <p>No files or folders here</p>
            {isTeacher && (
              <p className="text-sm mt-2">Upload files or create a folder to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Folders */}
            {folders.map((folder) => (
              <div
                key={folder._id}
                className="flex items-center justify-between p-3 hover:bg-fb-hover rounded-lg transition-colors group"
              >
                <button
                  onClick={() => handleFolderClick(folder._id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <FolderIcon className="text-yellow-500 flex-shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-100 font-medium truncate">{folder.name}</p>
                    <p className="text-xs text-gray-500">
                      {folder.filesCount} {folder.filesCount === 1 ? 'file' : 'files'}
                    </p>
                  </div>
                </button>
                {isTeacher && folder.createdBy._id === user?._id && (
                  <button
                    onClick={() => setDeleteConfirm({ id: folder._id, type: 'folder', name: folder.name })}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="flex items-center justify-between p-3 hover:bg-fb-hover rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.extension)}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-100 truncate">{file.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.downloadsCount} downloads
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                  >
                    <Download size={16} />
                  </button>
                  {isTeacher && file.uploadedBy._id === user?._id && (
                    <button
                      onClick={() => setDeleteConfirm({ id: file._id, type: 'file', name: file.originalName })}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-fb-card border border-fb-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              Delete {deleteConfirm.type === 'folder' ? 'Folder' : 'File'}?
            </h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete "{deleteConfirm.name}"?
              {deleteConfirm.type === 'folder' && (
                <span className="block mt-2 text-sm text-red-400">
                  This will also delete all files and subfolders inside it.
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-fb-hover hover:bg-gray-700 text-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.type)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
