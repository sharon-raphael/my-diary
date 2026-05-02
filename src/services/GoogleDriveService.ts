export class GoogleDriveService {
  /**
   * Uploads a backup zip file to Google Drive
   * @param accessToken - The Google OAuth access token
   * @param fileBlob - The backup zip file blob
   * @param filename - The backup filename
   */
  async uploadBackup(accessToken: string, fileBlob: Blob, filename: string): Promise<void> {
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const metadata = {
      name: filename,
      mimeType: 'application/zip',
      description: 'My Diary App Backup',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', fileBlob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Drive upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
  }

  /**
   * Lists backup files in Google Drive
   * @param accessToken - The Google OAuth access token
   */
  async listBackups(accessToken: string): Promise<{ id: string, name: string, createdTime: string }[]> {
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const q = encodeURIComponent("mimeType='application/zip' and name contains 'journal-export' and trashed=false");
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,createdTime)&orderBy=createdTime desc`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Drive list failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
  }

  /**
   * Downloads a file from Google Drive
   * @param accessToken - The Google OAuth access token
   * @param fileId - The Google Drive file ID
   */
  async downloadFile(accessToken: string, fileId: string): Promise<Blob> {
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Drive download failed: ${response.statusText}`);
    }

    return await response.blob();
  }
}

export const googleDriveService = new GoogleDriveService();
