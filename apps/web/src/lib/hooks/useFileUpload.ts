'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  url?: string;
  error?: string;
}

export function useFileUpload(bucket: string = 'documents') {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    setUploads(prev => [...prev, { file, progress: 0, status: 'uploading' }]);

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setUploads(prev =>
        prev.map(u =>
          u.file === file ? { ...u, progress: 100, status: 'complete', url: urlData.publicUrl } : u
        )
      );

      return urlData.publicUrl;
    } catch (err) {
      setUploads(prev =>
        prev.map(u =>
          u.file === file ? { ...u, status: 'error', error: (err as Error).message } : u
        )
      );
      return null;
    }
  };

  const uploadMultiple = async (files: File[], basePath: string): Promise<(string | null)[]> => {
    return Promise.all(files.map(file => uploadFile(file, basePath)));
  };

  const reset = () => setUploads([]);

  return { uploads, uploadFile, uploadMultiple, reset };
}
