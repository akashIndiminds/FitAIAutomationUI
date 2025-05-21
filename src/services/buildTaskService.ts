//services/buildTaskService.ts
export const startBuildTask = async (startDate: string, endDate: string): Promise<void> => {
  const response = await fetch('http://192.168.1.119:3000/api/build-task', {
    method: 'POST',
    body: JSON.stringify({ startDate, endDate }),
  });
  if (!response.ok) throw new Error('Build task failed');
};