import { ActivityLog } from '@/components/types';
interface ActivityTableProps {
  logs: ActivityLog[];
  sortColumn: string;
  sortDirection: string;
  sortBy: (column: string) => void;
  getRowClass: (log: ActivityLog) => string;
  getStatusClass: (status: number | string) => string; // Type updated
  getStatusDisplay: (status: number | string) => string; // Type updated
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

export function ActivityTable({
  logs,
  sortColumn,
  sortDirection,
  sortBy,
  getRowClass,
  getStatusClass,
  getStatusDisplay,
}: ActivityTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => sortBy('filename')}
            >
              Filename
              <span className="ml-1 inline-block">
                {sortColumn === 'filename' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </span>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => sortBy('dir')}
            >
              Directory
              <span className="ml-1 inline-block">
                {sortColumn === 'dir' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </span>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => sortBy('segment')}
            >
              Segment
              <span className="ml-1 inline-block">
                {sortColumn === 'segment' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </span>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => sortBy('spTime')}
            >
              SP Time
              <span className="ml-1 inline-block">
                {sortColumn === 'spTime' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </span>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => sortBy('dlTime')}
            >
              DL Time
              <span className="ml-1 inline-block">
                {sortColumn === 'dlTime' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </span>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Import Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Download Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => sortBy('lastModified')}
            >
              Last Modified
              <span className="ml-1 inline-block">
                {sortColumn === 'lastModified' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.length > 0 ? (
            logs.map((log) => (
              <tr key={log.id} className={`hover:bg-gray-50 ${getRowClass(log)}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{log.filename}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.dir}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.segment}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(log.spTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(log.dlTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(log.spStatus)}`}>
                    {getStatusDisplay(log.spStatus)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(log.dlStatus)}`}>
                    {getStatusDisplay(log.dlStatus)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(log.lastModified)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                No activity logs found for the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}