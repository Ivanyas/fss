import { useState, useRef } from 'react';
import { uploadFiles } from '../services/api';

function FileUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      setStatus({ type: 'error', message: 'Please select files to upload' });
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setStatus(null);

      await uploadFiles(files, setProgress);

      setStatus({
        type: 'success',
        message: `Successfully uploaded ${files.length} file(s)`,
      });

      fileInputRef.current.value = '';
      onUploadComplete?.();
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to upload files' });
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="upload-area">
      <div className="file-input-wrapper">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          disabled={uploading}
        />
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {uploading && (
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      )}

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
