import { Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DateNavigatorProps {
  selectedDate: string;
  displayedDate: string | null;
  setSelectedDate: (date: string) => void;
  previousDay: () => void;
  nextDay: () => void;
  goToToday: () => void;
  getStatusCount: (status: string) => number;
  filteredLogsLength: number;
  fetchActivityLogs: () => void;
  isLoading: boolean;
}

export function DateNavigator({
  selectedDate,
  displayedDate,
  setSelectedDate,
  previousDay,
  nextDay,
  goToToday,
  getStatusCount,
  filteredLogsLength,
  fetchActivityLogs,
  isLoading
}: DateNavigatorProps) {
  const [dateChangeMessage, setDateChangeMessage] = useState<string | null>(null);
  const [showDateMessage, setShowDateMessage] = useState(false);

  // Format date for display (e.g., "May 17, 2025")
  const formatDisplayDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    // Clear message when date changes
    if (displayedDate !== selectedDate) {
      setShowDateMessage(false);
    }
  }, [selectedDate, displayedDate]);

  const handleGetActivity = () => {
    fetchActivityLogs();
    setShowDateMessage(true);
    setDateChangeMessage(`Viewing activity logs for ${formatDisplayDate(selectedDate)}`);
    
    // Auto-hide message after 10 seconds
    setTimeout(() => {
      setShowDateMessage(false);
    }, 10000);
  };

  // Check if selected date is today
  const isToday = new Date(selectedDate).toDateString() === new Date().toDateString();
  // Check if selected date is in the future
  const isFutureDate = new Date(selectedDate) > new Date(new Date().setHours(23, 59, 59, 999));

  return (
    <div className="bg-white shadow-sm rounded-none">
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={previousDay}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white hover:border-blue-500 transition-colors">
                <Calendar size={20} className="text-gray-500 mr-2" />
                <input
                  type="date"
                  className="focus:outline-none text-gray-700"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <button
              onClick={nextDay}
              className={`p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors 
                        ${new Date(selectedDate) >= new Date(new Date().setHours(0, 0, 0, 0)) 
                           ? 'text-gray-400 cursor-not-allowed' 
                           : 'text-gray-700'}`}
              disabled={new Date(selectedDate) >= new Date(new Date().setHours(0, 0, 0, 0))}
              aria-label="Next day"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={goToToday}
              className={`px-3 py-2 border rounded-md transition-colors
                        ${isToday 
                           ? 'bg-blue-100 border-blue-300 text-blue-700' 
                           : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
            >
              Today
            </button>
            <button
              onClick={handleGetActivity}
              disabled={isLoading || isFutureDate}
              className={`px-4 py-2 ml-2 rounded-md flex items-center gap-2 transition-colors
                        ${isLoading 
                           ? 'bg-blue-300 cursor-not-allowed text-white' 
                           : isFutureDate
                              ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <span>Get Activity</span>
              )}
            </button>
          </div>
          
          <div className="flex mt-3 sm:mt-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Completed: {getStatusCount('Completed')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Pending: {getStatusCount('Pending')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Downloaded: {getStatusCount(' Downloaded')}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium ml-4">Total: {filteredLogsLength}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Date selection message */}
        {showDateMessage && dateChangeMessage && (
          <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800 flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {dateChangeMessage}
          </div>
        )}
        
        {isFutureDate && (
          <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 flex items-center">
            <AlertCircle size={18} className="mr-2" />
            You cannot view logs for future dates. Please select today or a past date.
          </div>
        )}
      </div>
    </div>
  );
}