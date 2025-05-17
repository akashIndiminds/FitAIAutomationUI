import { AlertCircle, XCircle, Info } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  onClose?: () => void;
}

export function ErrorMessage({ message, type, onClose }: ErrorMessageProps) {
  // Define styling based on message type
  const getStyleByType = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: <XCircle className="h-5 w-5 text-red-500" />
        };
      case 'warning':
        return {
          container: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-500" />
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: <Info className="h-5 w-5 text-green-500" />
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: <Info className="h-5 w-5 text-gray-500" />
        };
    }
  };

  const style = getStyleByType();

  return (
    <div className={`my-4 p-4 rounded-md border flex items-start ${style.container}`} role="alert">
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {style.icon}
      </div>
      <div className="w-full flex-1">
        <p className="font-medium">{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-auto -mr-1 -mt-1 bg-transparent text-gray-400 hover:text-gray-600 rounded-lg p-1.5 inline-flex"
          aria-label="Close"
        >
          <XCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}