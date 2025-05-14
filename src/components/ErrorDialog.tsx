'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ErrorDialogProps {
  title: string;
  message: string;
  
  onClose: () => void;
}

export default function ErrorDialog({ title, message, onClose }: ErrorDialogProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}