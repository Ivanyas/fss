const API_BASE = '/api/files';

export async function fetchFiles() {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error('Failed to fetch files');
  }
  return response.json();
}

export async function uploadFiles(files, onProgress) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', `${API_BASE}/upload`);
    xhr.send(formData);
  });
}

export function getDownloadUrl(id) {
  return `${API_BASE}/download/${id}`;
}

export async function deleteFiles(ids) {
  const response = await fetch(API_BASE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ids),
  });

  if (!response.ok) {
    throw new Error('Failed to delete files');
  }
  return response.json();
}
