import { ActivityLog } from "@/components/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getActivityLogs = async (date: string): Promise<ActivityLog[]> => {
  const formattedDate = formatDate(date);
  const url = `${API_BASE_URL}/api/automate/getActivityLog/${formattedDate}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error('API returned success: false');
  }
  
  return data.data.map((log: any, index: number) => ({
    id: index + 1, // Generate temporary id since API doesn't provide one
    dir: log.dir,
    segment: log.segment,
    filename: log.filename,
    filetype: log.filetype,
    spName: log.spName,
    spStatus: log.spStatus,
    dlStatus: log.dlStatus,
    lastModified: log.lastModified,
  }));
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}${month}${year}`;
};