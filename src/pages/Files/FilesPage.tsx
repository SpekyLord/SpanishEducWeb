import React, { useState } from 'react';
import { Header } from '../../components';
import { FileExplorer } from '../../components/Files/FileExplorer';
import { FileUpload } from '../../components/Files/FileUpload';
import { useAuth } from '../../contexts/AuthContext';

export const FilesPage: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleFolderChange = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  return (
    <div className="min-h-screen bg-fb-bg text-gray-100">
      <Header variant="feed" />

      <main className="mx-auto px-4 sm:px-6 py-6" style={{ maxWidth: '80rem' }}>
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Files & Resources</h1>
          <p className="text-gray-400 mt-1">
            Access course materials, documents, and audio files
          </p>
        </div>

        {/* Main content */}
        <div className={`grid gap-6 ${isTeacher ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* File explorer - takes 2/3 width on desktop for teachers, full width for students */}
          <div className={isTeacher ? 'lg:col-span-2' : 'col-span-1'}>
            <FileExplorer
              currentFolderId={currentFolderId}
              onFolderChange={handleFolderChange}
              refreshKey={refreshKey}
            />
          </div>

          {/* Upload component - only for teachers */}
          {isTeacher && (
            <div className="lg:col-span-1">
              <FileUpload
                currentFolderId={currentFolderId}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
