import { Search, X, Download, Loader2 } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  createConfig: () => void;
  isLoading: boolean;
  selectedCount: number;
}

export default function Header({ searchTerm, setSearchTerm, createConfig, isLoading, selectedCount }: HeaderProps) {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <h1 className="text-lg sm:text-xl font-bold text-white">
            File Configuration
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
            <input
              type="text"
              placeholder="search files by name..."
              className="pl-10 pr-10 py-2 w-full text-white border border-white/20 rounded-md 
                        bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500
                        placeholder-white/70"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={createConfig}
            disabled={isLoading || selectedCount === 0}
            className={`px-4 py-2 text-white rounded-md flex items-center gap-2 w-full sm:w-auto
                      ${selectedCount === 0
                        ? 'bg-gray-500/50 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Create Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}