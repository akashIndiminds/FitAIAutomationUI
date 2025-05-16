// /app/file-details/[type]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import FileManagement from '@/components/FileManagement';

export default function FileDetailsPage() {
  const params = useParams();
  const type = params.type as 'pending' | 'downloaded' | 'imported';
  
  return (
    <div className="container mx-auto py-6 px-4">
      <FileManagement defaultType={type} />
    </div>
  );
}