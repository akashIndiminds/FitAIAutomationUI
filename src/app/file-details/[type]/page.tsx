// /app/file-details/[type]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import FileManagement from '@/app/file-details/FileManagement/FileManagement';

export default function FileDetailsPage() {
  const params = useParams();
  const type = params.type as 'pending' | 'downloaded' | 'imported';
  
  return (
    <div className="w-full mx-auto py-6 px-4">
      <FileManagement 
        defaultType={type} 
        skipInitialFetch={false} // This page should fetch its own data
      />
    </div>
  );
}