import React, { useState } from 'react';
import { Header } from '../../components';
import { FileExplorer } from '../../components/files/FileExplorer';
import { FileUpload } from '../../components/files/FileUpload';
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
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: '#f3f4f6' }}>
      <Header variant="feed" />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Page header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f3f4f6', margin: 0 }}>Files & Resources</h1>
          <p style={{ color: '#9ca3af', marginTop: '4px' }}>
            Access course materials, documents, and audio files
          </p>
        </div>

        {/* Main content */}
        <div className={`grid gap-6 grid-cols-1 ${isTeacher ? 'lg:grid-cols-[2fr_1fr]' : ''}`}>
          {/* File explorer - takes 2/3 width on desktop for teachers, full width for students */}
          <div>
            <FileExplorer
              currentFolderId={currentFolderId}
              onFolderChange={handleFolderChange}
              refreshKey={refreshKey}
            />
          </div>

          {/* Upload component - only for teachers */}
          {isTeacher && (
            <div>
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
