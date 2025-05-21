//services/downloadService.ts
export const startDownload = async (): Promise<void> => {
  const response = await fetch('http://192.168.1.119:3000/api/download', { method: 'GET' });
  if (!response.ok) throw new Error('Download failed');
};