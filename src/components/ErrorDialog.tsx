'use client';

import React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  message: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  isOpen,
  onClose,
  title = 'Error',
  description = 'An error has occurred.',
  message
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <button onClick={onClose} className="text-white hover:text-red-500 transition-colors">
          ✕
        </button>
      </DialogHeader>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogDescription>{description}</DialogDescription>
        <p className="mt-4">{message}</p>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ErrorDialog;
