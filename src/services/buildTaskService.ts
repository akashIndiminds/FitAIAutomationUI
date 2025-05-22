//services/buildTaskService.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const startBuildTask = async (startDate: string, endDate: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/automate/build-task`, {
    method: 'POST',
    body: JSON.stringify({ startDate, endDate }),
  });
  if (!response.ok) throw new Error('Build task failed');
};