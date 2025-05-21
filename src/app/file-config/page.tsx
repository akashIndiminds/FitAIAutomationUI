'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { getFileConfigurations, getSelectedConfigurations, createConfiguration } from '@/services/fileConfigService';
import Header from './components/Header';
import Filters from './components/Filters';
import Table from './components/Table';
import Pagination from './components/Pagination';
import Message from './components/Message';

interface FileConfig {
  id: number;
  childPath: string | null;
  file_name: string | null;
  file_type: string | null;
  format: string | null;
  spName: string | null;
  spParam: string | null;
  spParamValue: string | null;
  dirName: string;
  segment: string;
  folderName: string | null;
  created_at: string | null;
}

export default function FileConfigPage() {
  const [fileConfigs, setFileConfigs] = useState<FileConfig[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<FileConfig[]>([]);
  const [displayedConfigs, setDisplayedConfigs] = useState<FileConfig[]>([]);
  const [currentSelection, setCurrentSelection] = useState<number[]>([]);
  const [selectedConfigs, setSelectedConfigs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const directories = [...new Set(fileConfigs.map(item => item.dirName))];
  const segments = [...new Set(fileConfigs.map(item => item.segment))];
  const folderNames = [...new Set(fileConfigs.filter(item => item.folderName).map(item => item.folderName!))];

  const extractIds = (data: any): number[] => {
    let ids: number[] = [];
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (key === 'id') {
          if (typeof data[key] === 'number') {
            ids.push(data[key]);
          } else if (typeof data[key] === 'string') {
            const idStrings = data[key].split(',');
            for (const idStr of idStrings) {
              const id = parseInt(idStr.trim(), 10);
              if (!isNaN(id)) {
                ids.push(id);
              }
            }
          }
        } else {
          ids = ids.concat(extractIds(data[key]));
        }
      }
    }
    return ids;
  };

  const loadData = useCallback(async () => {
    setIsDataLoading(true);
    let configs: FileConfig[] = [];
    let selected: any = {};
    try {
      configs = await getFileConfigurations();
      console.log('File Configurations:', configs);
    } catch (error) {
      console.error('Error fetching file configurations:', error);
    }
    try {
      selected = await getSelectedConfigurations();
      console.log('Selected Configurations:', selected);
    } catch (error) {
      console.error('Error fetching selected configurations:', error);
      selected = {};
    }
    if (configs.length === 0) {
      setMessage({ type: 'error', text: 'Failed to load file configurations' });
    } else {
      setFileConfigs(configs);
      const selectedIds = extractIds(selected);
      setSelectedConfigs(selectedIds);
      setCurrentSelection(selectedIds);
    }
    setIsDataLoading(false);
  }, []);

  const applyFilters = useCallback(() => {
    const filtered = fileConfigs.filter(config => {
      const matchesDirectory = !selectedDirectory || config.dirName === selectedDirectory;
      const matchesSegment = !selectedSegment || config.segment === selectedSegment;
      const matchesFolder = !selectedFolder || config.folderName === selectedFolder;
      const matchesSearch = !searchTerm || 
        (config.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         config.dirName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         config.segment.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (config.folderName?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
      const matchesSelection = !showOnlySelected || currentSelection.includes(config.id);
      return matchesDirectory && matchesSegment && matchesFolder && matchesSearch && matchesSelection;
    });
    setFilteredConfigs(filtered);
    // DON'T reset to page 1 automatically when applying filters
    // This will be done explicitly when filters change
  }, [fileConfigs, selectedDirectory, selectedSegment, selectedFolder, searchTerm, showOnlySelected, currentSelection]);

  const updatePagination = useCallback(() => {
    const total = Math.ceil(filteredConfigs.length / pageSize) || 1;
    setTotalPages(total);
    
    // Check if current page is valid after filter changes
    const validPage = Math.min(currentPage, total);
    if (validPage !== currentPage) {
      setCurrentPage(validPage);
    }
    
    const startIndex = (validPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredConfigs.length);
    setDisplayedConfigs(filteredConfigs.slice(startIndex, endIndex));
  }, [filteredConfigs, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }, [totalPages]);

  const toggleSelection = useCallback((id: number) => {
    setCurrentSelection(prev => 
      prev.includes(id) ? prev.filter(configId => configId !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setCurrentSelection(prev => {
      const allDisplayedSelected = displayedConfigs.every(config => prev.includes(config.id));
      if (allDisplayedSelected) {
        return prev.filter(id => !displayedConfigs.some(config => config.id === id));
      } else {
        const newIds = displayedConfigs.map(config => config.id).filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      }
    });
  }, [displayedConfigs]);

  const selectAllFiles = useCallback(() => {
    const allFilesSelected = fileConfigs.every(config => currentSelection.includes(config.id));
    if (allFilesSelected) {
      setCurrentSelection([]);
    } else {
      setCurrentSelection(fileConfigs.map(config => config.id));
    }
  }, [fileConfigs, currentSelection]);

  const hasSelectedAll = fileConfigs.every(config => currentSelection.includes(config.id));

  const resetFilters = useCallback(() => {
    setSelectedDirectory('');
    setSelectedSegment('');
    setSelectedFolder('');
    setSearchTerm('');
    setShowOnlySelected(false);
    // When explicitly resetting filters, go back to page 1
    setCurrentPage(1);
  }, []);

  const createConfig = useCallback(async () => {
    if (currentSelection.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one file' });
      return;
    }
    setIsLoading(true);
    try {
      await createConfiguration(currentSelection);
      setMessage({ type: 'success', text: 'Configuration created successfully' });
      setCurrentSelection([]);
      await loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create configuration' });
    } finally {
      setIsLoading(false);
    }
  }, [currentSelection, loadData]);

  const dismissMessage = useCallback(() => setMessage(null), []);

  // Main effects
  useEffect(() => { loadData(); }, [loadData]);
  
  // When filter criteria change, apply filters and reset to page 1
  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [selectedDirectory, selectedSegment, selectedFolder, searchTerm, showOnlySelected]);
  
  // When selection changes, just apply filters without changing page
  useEffect(() => {
    applyFilters();
  }, [currentSelection]);
  
  // Update pagination when filtered data or pagination settings change
  useEffect(() => {
    updatePagination();
  }, [filteredConfigs, currentPage, pageSize, updatePagination]);
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(dismissMessage, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, dismissMessage]);

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Header
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            createConfig={createConfig}
            isLoading={isLoading}
            selectedCount={currentSelection.length}
          />
          <Filters 
            directories={directories}
            segments={segments}
            folderNames={folderNames}
            selectedDirectory={selectedDirectory}
            setSelectedDirectory={setSelectedDirectory}
            selectedSegment={selectedSegment}
            setSelectedSegment={setSelectedSegment}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            resetFilters={resetFilters}
            selectedCount={currentSelection.length}
            showOnlySelected={showOnlySelected}
            setShowOnlySelected={setShowOnlySelected}
            selectAllFiles={selectAllFiles}
            hasSelectedAll={hasSelectedAll}
          />
          {message && (
            <Message
              type={message.type}
              text={message.text}
              dismissMessage={dismissMessage}
            />
          )}
          {isDataLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-3">Loading...</span>
            </div>
          ) : (
            <>
              <Table
                displayedConfigs={displayedConfigs}
                currentSelection={currentSelection}
                toggleSelection={toggleSelection}
                toggleSelectAll={toggleSelectAll}
                previouslySelected={selectedConfigs}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                setPageSize={setPageSize}
                goToPage={goToPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}