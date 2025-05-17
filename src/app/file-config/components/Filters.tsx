import { useState, useEffect, useRef } from 'react';
import { Filter, RotateCw, ChevronDown, Check, CheckSquare, Square } from 'lucide-react';

interface FiltersProps {
  directories: string[];
  segments: string[];
  folderNames: string[];
  selectedDirectory: string;
  setSelectedDirectory: (dir: string) => void;
  selectedSegment: string;
  setSelectedSegment: (seg: string) => void;
  selectedFolder: string;
  setSelectedFolder: (folder: string) => void;
  resetFilters: () => void;
  selectedCount: number;
  showOnlySelected: boolean;
  setShowOnlySelected: (value: boolean) => void;
  selectAllFiles: () => void;
  hasSelectedAll: boolean;
}

export default function Filters({
  directories,
  segments,
  folderNames,
  selectedDirectory,
  setSelectedDirectory,
  selectedSegment,
  setSelectedSegment,
  selectedFolder,
  setSelectedFolder,
  resetFilters,
  selectedCount,
  showOnlySelected,
  setShowOnlySelected,
  selectAllFiles,
  hasSelectedAll
}: FiltersProps) {
  // Track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Refs for each dropdown to detect outside clicks
  const directoryDropdownRef = useRef<HTMLDivElement>(null);
  const segmentDropdownRef = useRef<HTMLDivElement>(null);
  const folderDropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        directoryDropdownRef.current && 
        !directoryDropdownRef.current.contains(event.target as Node) &&
        segmentDropdownRef.current && 
        !segmentDropdownRef.current.contains(event.target as Node) &&
        folderDropdownRef.current && 
        !folderDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle dropdown visibility
  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };
  
  // Select item from dropdown and close it
  const selectItem = (setter: (value: string) => void, value: string) => {
    setter(value);
    setOpenDropdown(null);
  };
  
  // Get display text for selected value or placeholder
  const getDisplayText = (selected: string, placeholder: string) => {
    return selected || placeholder;
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
        <div className="text-gray-700 flex items-center font-medium">
          <Filter className="h-4 w-4 mr-2" />
          <span>Filters</span>
        </div>
        
        {/* Directory Dropdown */}
        <div className="relative inline-block text-left" ref={directoryDropdownRef}>
          <div>
            <button
              type="button"
              className="inline-flex w-44 justify-between rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => toggleDropdown('directory')}
            >
              {getDisplayText(selectedDirectory, 'All Directories')}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
          </div>

          {openDropdown === 'directory' && (
            <div className="absolute right-0 z-10 mt-1 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto">
              <div className="py-1">
                <button
                  className={`flex w-full items-center px-4 py-2 text-sm ${!selectedDirectory ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                  onClick={() => selectItem(setSelectedDirectory, '')}
                >
                  <span className="flex-grow text-left">All Directories</span>
                  {!selectedDirectory && <Check className="h-4 w-4 ml-2" />}
                </button>
                {directories.map((dir) => (
                  <button
                    key={dir} 
                    className={`flex w-full items-center px-4 py-2 text-sm ${selectedDirectory === dir ? 'text-blue-600 font-medium' : 'text-gray-700'} hover:bg-gray-100`}
                    onClick={() => selectItem(setSelectedDirectory, dir)}
                  >
                    <span className="flex-grow text-left">{dir}</span>
                    {selectedDirectory === dir && <Check className="h-4 w-4 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Segment Dropdown */}
        <div className="relative inline-block text-left" ref={segmentDropdownRef}>
          <div>
            <button
              type="button"
              className="inline-flex w-44 justify-between rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => toggleDropdown('segment')}
            >
              {getDisplayText(selectedSegment, 'All Segments')}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
          </div>

          {openDropdown === 'segment' && (
            <div className="absolute right-0 z-10 mt-1 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto">
              <div className="py-1">
                <button
                  className={`flex w-full items-center px-4 py-2 text-sm ${!selectedSegment ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                  onClick={() => selectItem(setSelectedSegment, '')}
                >
                  <span className="flex-grow text-left">All Segments</span>
                  {!selectedSegment && <Check className="h-4 w-4 ml-2" />}
                </button>
                {segments.map((seg) => (
                  <button
                    key={seg}
                    className={`flex w-full items-center px-4 py-2 text-sm ${selectedSegment === seg ? 'text-blue-600 font-medium' : 'text-gray-700'} hover:bg-gray-100`}
                    onClick={() => selectItem(setSelectedSegment, seg)}
                  >
                    <span className="flex-grow text-left">{seg}</span>
                    {selectedSegment === seg && <Check className="h-4 w-4 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Folder Dropdown */}
        <div className="relative inline-block text-left" ref={folderDropdownRef}>
          <div>
            <button
              type="button"
              className="inline-flex w-44 justify-between rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => toggleDropdown('folder')}
            >
              {getDisplayText(selectedFolder, 'All Folders')}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
          </div>

          {openDropdown === 'folder' && (
            <div className="absolute right-0 z-10 mt-1 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto">
              <div className="py-1">
                <button
                  className={`flex w-full items-center px-4 py-2 text-sm ${!selectedFolder ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                  onClick={() => selectItem(setSelectedFolder, '')}
                >
                  <span className="flex-grow text-left">All Folders</span>
                  {!selectedFolder && <Check className="h-4 w-4 ml-2" />}
                </button>
                {folderNames.map((folder) => (
                  <button
                    key={folder}
                    className={`flex w-full items-center px-4 py-2 text-sm ${selectedFolder === folder ? 'text-blue-600 font-medium' : 'text-gray-700'} hover:bg-gray-100`}
                    onClick={() => selectItem(setSelectedFolder, folder)}
                  >
                    <span className="flex-grow text-left">{folder}</span>
                    {selectedFolder === folder && <Check className="h-4 w-4 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetFilters();
              setOpenDropdown(null);
            }}
            className="px-3 py-2 flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RotateCw className="h-4 w-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={selectAllFiles}
            className="px-3 py-2 flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title={hasSelectedAll ? "Deselect all files" : "Select all files"}
          >
            {hasSelectedAll ? 
              <CheckSquare className="h-4 w-4 text-blue-600" /> : 
              <Square className="h-4 w-4" />}
            <span>{hasSelectedAll ? "Deselect All" : "Select All"}</span>
          </button>
        </div>

        <div className="flex items-center ml-1">
          <input
            type="checkbox"
            id="showOnlySelected"
            checked={showOnlySelected}
            onChange={() => setShowOnlySelected(!showOnlySelected)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="showOnlySelected" className="ml-2 text-sm text-gray-700">
            Show selected only
          </label>
        </div>

        <div className="ml-auto text-sm bg-blue-50 text-blue-800 px-3 py-1 rounded-full font-medium">
          {selectedCount} files selected
        </div>
      </div>
    </div>
  );
}