import { X } from 'lucide-react';

interface MessageProps {
  type: 'success' | 'error' | 'info';
  text: string;
  dismissMessage: () => void;
}

export default function Message({ type, text, dismissMessage }: MessageProps) {
  return (
    <div 
      className={`m-4 p-4 rounded-lg flex items-center justify-between
                ${type === 'success' ? 'bg-green-100 text-green-800' : 
                  type === 'error' ? 'bg-red-100 text-red-800' : 
                  'bg-blue-100 text-blue-800'}`}
    >
      <span>{text}</span>
      <button onClick={dismissMessage}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}