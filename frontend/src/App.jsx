import { useState, useEffect } from 'react';
import FileList from './components/FileList';
import FileUpload from './components/FileUpload';
import { fetchFiles, deleteFiles } from './services/api';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFiles();
      setFiles(data);
      setSelectedIds(new Set());
    } catch (err) {
      setError('Failed to load files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUploadComplete = () => {
    loadFiles();
  };

  const handleSelectionChange = (id, checked) => {
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedIds(newSelection);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(files.map(f => f.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    if (!window.confirm(`Delete ${selectedIds.size} file(s)?`)) {
      return;
    }

    try {
      await deleteFiles([...selectedIds]);
      loadFiles();
    } catch (err) {
      setError('Failed to delete files');
      console.error(err);
    }
  };

  return (
    <div className="app">
      <h1>File Storage Service</h1>

      <div className="section">
        <h2>Upload Files</h2>
        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>

      <div className="section">
        <h2>Files</h2>
        <div className="actions-bar">
          <button className="btn btn-primary" onClick={loadFiles}>
            Refresh
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0}
          >
            Delete Selected ({selectedIds.size})
          </button>
        </div>

        {error && <div className="status-message error">{error}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <FileList
            files={files}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
          />
        )}
      </div>
    </div>
  );
}

export default App;
