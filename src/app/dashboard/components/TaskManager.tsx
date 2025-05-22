'use client';

import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Play, Pause, X, RotateCcw } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  createdAt: string;
  estimatedTime?: string;
  fileCount?: number;
}

interface TaskManagerProps {
  tasks?: Task[];
  onTaskAction?: (taskId: string, action: 'start' | 'pause' | 'cancel' | 'retry') => void;
}

export default function TaskManager({ tasks = [], onTaskAction }: TaskManagerProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Default tasks if none provided
  const defaultTasks: Task[] = [
    {
      id: '1',
      title: 'File Download Process',
      description: 'Downloading files from remote server',
      status: 'running',
      priority: 'high',
      progress: 65,
      createdAt: new Date().toISOString(),
      estimatedTime: '5 min',
      fileCount: 12
    },
    {
      id: '2',
      title: 'Data Import Process',
      description: 'Importing downloaded files to database',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      createdAt: new Date(Date.now() - 300000).toISOString(),
      estimatedTime: '3 min',
      fileCount: 8
    },
    {
      id: '3',
      title: 'File Validation',
      description: 'Validating file integrity and format',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      createdAt: new Date(Date.now() - 600000).toISOString(),
      fileCount: 5
    }
  ];

  const displayTasks = tasks.length > 0 ? tasks : defaultTasks;

  const filteredTasks = displayTasks.filter(task => {
    if (filter === 'active') return ['pending', 'running', 'paused'].includes(task.status);
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'paused':
        return <Pause className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleTaskAction = (taskId: string, action: 'start' | 'pause' | 'cancel' | 'retry') => {
    if (onTaskAction) {
      onTaskAction(taskId, action);
    } else {
      console.log(`Action ${action} triggered for task ${taskId}`);
    }
  };

  const taskCounts = {
    all: displayTasks.length,
    active: displayTasks.filter(t => ['pending', 'running', 'paused'].includes(t.status)).length,
    completed: displayTasks.filter(t => t.status === 'completed').length
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Task Manager</h3>
          <span className="text-xs text-gray-500">
            {filteredTasks.length} of {displayTasks.length} tasks
          </span>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: taskCounts.all },
            { key: 'active', label: 'Active', count: taskCounts.active },
            { key: 'completed', label: 'Completed', count: taskCounts.completed }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
              <CheckCircle className="h-full w-full" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">No tasks found</h4>
            <p className="text-sm text-gray-500">
              {filter === 'active' ? 'No active tasks at the moment' : 
               filter === 'completed' ? 'No completed tasks yet' : 
               'No tasks available'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Priority Indicator */}
                    <div className={`w-1 h-12 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 mt-1`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(task.status)}
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      
                      {/* Progress Bar */}
                      {task.status !== 'pending' && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                task.status === 'completed' ? 'bg-green-500' :
                                task.status === 'failed' ? 'bg-red-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Task Meta */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatTime(task.createdAt)}</span>
                        {task.estimatedTime && (
                          <span>Est. {task.estimatedTime}</span>
                        )}
                        {task.fileCount && (
                          <span>{task.fileCount} files</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 ml-3">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleTaskAction(task.id, 'start')}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Start task"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    
                    {task.status === 'running' && (
                      <button
                        onClick={() => handleTaskAction(task.id, 'pause')}
                        className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                        title="Pause task"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    )}
                    
                    {task.status === 'failed' && (
                      <button
                        onClick={() => handleTaskAction(task.id, 'retry')}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                        title="Retry task"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                    
                    {['pending', 'running', 'paused'].includes(task.status) && (
                      <button
                        onClick={() => handleTaskAction(task.id, 'cancel')}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Cancel task"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}