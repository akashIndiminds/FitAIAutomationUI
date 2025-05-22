//services/fileStatusService.ts

import { FileStatus } from '@/components/types';
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const getAutomationStatus = async (): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/automate/status`);
  if (!response.ok) throw new Error('Failed to fetch automation status');
  return response.json();
};

// Placeholder for activity logs, will update to accept date later
export const getActivityLogs = async (): Promise<any[]> => {
  const response = await fetch('/api/activity-logs');
  if (!response.ok) throw new Error('Failed to fetch activity logs');
  return response.json();
};
