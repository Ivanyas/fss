import { getDownloadUrl } from '../services/api';

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function FileList({ files, selectedIds, onSelectionChange, onSelectAll }) {
  if (files.length === 0) {
    return <div className="empty-state">No files uploaded yet</div>;
  }

  const allSelected = files.length > 0 && selectedIds.size === files.length;

  return (
    <table className="file-table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
          </th>
          <th>File Name</th>
          <th>Size</th>
          <th>Upload Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <tr key={file.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedIds.has(file.id)}
                onChange={(e) => onSelectionChange(file.id, e.target.checked)}
              />
            </td>
            <td>{file.originalFileName}</td>
            <td>{formatFileSize(file.fileSize)}</td>
            <td>{formatDate(file.uploadDate)}</td>
            <td>
              <a
                href={getDownloadUrl(file.id)}
                className="btn btn-link"
                download
              >
                Download
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default FileList;
