//services/downloadService.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const startDownload = async (): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/automate/download`, { method: 'GET' });
  if (!response.ok) throw new Error('Download failed');
};