import React from 'react';

interface SystemBlockedMessageProps {
  message: string;
}

export default function SystemBlockedMessage({ message }: SystemBlockedMessageProps) {
  return (
    <div className="bg-red-500/20 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-white mb-1">System Unavailable</h3>
      <p className="text-white/80">{message}</p>
    </div>
  );
}