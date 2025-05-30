"use client"
import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';  
import { DateNavigator } from './components/DateNavigator';
import { Filters } from './components/Filters';
import { ErrorMessage } from './components/ErrorMessage';
import { ActivityTable } from './components/ActivityTable';
import { Pagination } from './components/Pagination';
import { getActivityLogs } from '@/services/activityLogService';
import { ActivityLog } from '@/components/types';


interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
}

export default function ActivityLogPage() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [displayedDate, setDisplayedDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileStatusFilter, setFileStatusFilter] = useState('');
  const [dirFilter, setDirFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [sortColumn, setSortColumn] = useState('lastModified');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const uniqueDirs = useMemo(() => Array.from(new Set(activityLogs.map(log => log.dir))), [activityLogs]);
  const uniqueSegments = useMemo(() => Array.from(new Set(activityLogs.map(log => log.segment))), [activityLogs]);

 const applyFilters = useCallback(
  (logs = activityLogs) => {
    try {
      let results = [...logs];
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(
          (log) =>
            (log.dir && log.dir.toLowerCase().includes(term)) ||
            (log.segment && log.segment.toLowerCase().includes(term)) ||
            (log.filename && log.filename.toLowerCase().includes(term))
        );
        
        if (results.length === 0 && logs.length > 0) {
          setErrorState({
            message: `No results found for "${searchTerm}". Try adjusting your search criteria.`,
            type: 'info'
          });
        } else if (errorState?.message?.includes("No results found")) {
          setErrorState(null);
        }
      }

      // Apply the unified file status filter
      if (fileStatusFilter) {
        results = results.filter((log) => {
          if (fileStatusFilter === 'Completed') {
            // Both downloaded and imported successfully
            return log.dlStatus === 200 && log.spStatus !== 404;
          }
          if (fileStatusFilter === 'Downloaded') {
            // Only downloaded but not imported yet
            return log.dlStatus === 200 && log.spStatus !== 200;
          }
          if (fileStatusFilter === 'Pending') {
            // Neither downloaded nor imported completely
            return log.dlStatus !== 200 || log.spStatus !== 200;
          }
          return true;
        });
      }

      // Apply directory filter
      if (dirFilter) {
        results = results.filter(log => log.dir === dirFilter);
      }

      // Apply segment filter
      if (segmentFilter) {
        results = results.filter(log => log.segment === segmentFilter);
      }

      results = sortData(results);
      setFilteredLogs(results);
      setTotalPages(Math.ceil(results.length / itemsPerPage));
      setCurrentPage(1);
    } catch (error) {
      setErrorState({
        message: "Error applying filters. Please try again.",
        type: 'error'
      });
    }
  },
  [searchTerm, fileStatusFilter, dirFilter, segmentFilter, sortColumn, sortDirection, itemsPerPage, activityLogs, errorState]
);

  const fetchActivityLogs = useCallback(async () => {
    const selectedDateStr = selectedDate;
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (selectedDateStr > todayStr) {
      setErrorState({
        message: "Cannot fetch logs for future dates. Please select today or a past date.",
        type: 'warning'
      });
      return;
    }
    
    setIsLoading(true);
    setErrorState(null);
    
    try {
      const logs = await getActivityLogs(selectedDate);
      setActivityLogs(logs);
      setDisplayedDate(selectedDate);
      applyFilters(logs);
      setErrorState({
        message: `Successfully loaded activity logs for ${new Date(selectedDate).toLocaleDateString()}`,
        type: 'success'
      });
      setTimeout(() => setErrorState(null), 3000);
    } catch (error) {
      setErrorState({
        message: error instanceof Error ? error.message : "An unknown error occurred",
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, applyFilters]);

  const sortData = useCallback(
    (data: ActivityLog[]) => {
      return [...data].sort((a, b) => {
        let aValue, bValue;
        if (sortColumn === 'spTime') {
          aValue = new Date(a.spTime).getTime();
          bValue = new Date(b.spTime).getTime();
        } else if (sortColumn === 'dlTime') {
          aValue = new Date(a.dlTime).getTime();
          bValue = new Date(b.dlTime).getTime();
        } else if (sortColumn === 'lastModified') {
          aValue = new Date(a.lastModified).getTime();
          bValue = new Date(b.lastModified).getTime();
        } else {
          aValue = (a[sortColumn as keyof ActivityLog] || '').toString().toLowerCase();
          bValue = (b[sortColumn as keyof ActivityLog] || '').toString().toLowerCase();
        }
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    },
    [sortColumn, sortDirection]
  );

  const sortBy = useCallback(
    (column: string) => {
      setSortDirection((prev) => (sortColumn === column && prev === 'asc' ? 'desc' : 'asc'));
      setSortColumn(column);
    },
    [sortColumn]
  );

  const previousDay = useCallback(() => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  }, [selectedDate]);

  const nextDay = useCallback(() => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    const today = new Date();
    if (date <= today) {
      setSelectedDate(date.toISOString().split('T')[0]);
    } else {
      setErrorState({
        message: "Cannot navigate to future dates",
        type: 'warning'
      });
      setTimeout(() => setErrorState(null), 3000);
    }
  }, [selectedDate]);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

const getStatusDisplay = useCallback((status: number | string) => {
  if (typeof status === 'string') return 'Imported';
  if (status === 200) return 'Completed';
  if (status === 202) return 'Pending';
  if (status === 404) return 'Not Found';
  if (status === 500) return 'Error';
  return 'Unknown'; // Default case numbers ke liye
}, []);

const getStatusClass = useCallback((status: number | string) => {
  if (typeof status === 'string') return 'bg-blue-100 text-blue-800';
  if (status === 200) return 'bg-green-100 text-green-800';
  if (status === 202) return 'bg-yellow-100 text-yellow-800';
  if (status === 404 || status === 500) return 'bg-red-100 text-red-800';
  return '';
}, []);

  const getRowClass = useCallback((log: ActivityLog) => {
    if (log.spStatus === 200 && log.dlStatus === 200) return 'border-l-4 border-green-500';
    if (log.spStatus === 404 || log.spStatus === 500 || log.dlStatus === 404 || log.dlStatus === 500) return 'border-l-4 border-red-500';
    if (log.spStatus === 202 || log.dlStatus === 202) return 'border-l-4 border-yellow-500';
    return '';
  }, []);

const getStatusCount = useCallback(
  (status: string) => {
    return filteredLogs.filter((log) => {
      if (status === 'Completed') return log.spStatus === 200 && log.dlStatus === 200;
      if (status === 'Downloaded') return log.dlStatus === 200 && log.spStatus !== 200;
      if (status === 'Pending') return log.dlStatus !== 200 || log.spStatus !== 200;
      return false;
    }).length;
  },
  [filteredLogs]
);


  const paginatedLogs = useCallback(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, filteredLogs]);

  const dismissError = useCallback(() => {
    setErrorState(null);
  }, []);


  useEffect(() => {
  if (selectedDate !== displayedDate) {
    setFileStatusFilter('');
    setDirFilter('');
    setSegmentFilter('');
    setSearchTerm('');
    setSortColumn('lastModified');
    setSortDirection('desc');
  }
}, [selectedDate, displayedDate]);


  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-4">
      <div className={`w-full mx-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isFilterVisible={isFilterVisible}
          setIsFilterVisible={setIsFilterVisible}
          isLoading={isLoading}
        />
        
        <DateNavigator
          selectedDate={selectedDate}
          displayedDate={displayedDate}
          setSelectedDate={setSelectedDate}
          previousDay={previousDay}
          nextDay={nextDay}
          goToToday={goToToday}
          getStatusCount={getStatusCount}
          filteredLogsLength={filteredLogs.length}
          fetchActivityLogs={fetchActivityLogs}
          isLoading={isLoading}
        />
        
        {errorState && (
          <div className="mt-4">
            <ErrorMessage 
              message={errorState.message} 
              type={errorState.type} 
              onClose={dismissError} 
            />
          </div>
        )}
        
{isFilterVisible && (
  <div className="mt-4">
    <Filters
      fileStatusFilter={fileStatusFilter}
      setFileStatusFilter={setFileStatusFilter}
      dirFilter={dirFilter}
      setDirFilter={setDirFilter}
      segmentFilter={segmentFilter}
      setSegmentFilter={setSegmentFilter}
      uniqueDirs={uniqueDirs}
      uniqueSegments={uniqueSegments}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
      setSearchTerm={setSearchTerm}
      onClose={() => setIsFilterVisible(false)}
    />
  </div>
)}


        
        <main className="mt-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-lg font-medium text-gray-700">Loading activity logs...</span>
              </div>
            ) : displayedDate ? (
              <>
                <ActivityTable
                  logs={paginatedLogs()}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  sortBy={sortBy}
                  getRowClass={getRowClass}
                  getStatusClass={getStatusClass}
                  getStatusDisplay={getStatusDisplay}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  goToPage={goToPage}
                  filteredLogsLength={filteredLogs.length}
                  itemsPerPage={itemsPerPage}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-blue-50 text-blue-800 p-6 rounded-full mb-4">
                  <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No Activity Logs Loaded</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  Select a date and click "Get Activity" to view logs for that day.
                </p>
                <button
                  onClick={fetchActivityLogs}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Load Today's Logs
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}