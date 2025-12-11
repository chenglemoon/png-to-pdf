"use client";

import React from 'react';
import { UploadDragger } from './UploadDragger';
import { Mimes } from '@/lib/compressor-mimes';
import { createImage } from '@/lib/compressor-transform';
import usePaste from '@/lib/compressor-usePaste';
import { getFilesFromEntry, getFilesFromHandle } from '@/lib/compressor-utils';
import type { ImageInfo } from '@/stores/compressorStore';

export const UploadCard = ({ onImageCreated }: { onImageCreated?: (info: ImageInfo) => Promise<void> }) => {
  usePaste(async (file: File) => {
    if (onImageCreated) {
      const info = await createImage(file);
      await onImageCreated(info);
    }
  });

  const beforeUpload = async (file: File) => {
    if (onImageCreated) {
      const info = await createImage(file);
      await onImageCreated(info);
    }
    return Promise.reject();
  };

  const onDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const files: File[] = [];
    
    if (event.dataTransfer?.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const item = event.dataTransfer.items[i];
        if (typeof (item as any).getAsFileSystemHandle === 'function') {
          try {
            const handle = await (item as any).getAsFileSystemHandle();
            if (handle.kind === 'file') continue;
            const result = await getFilesFromHandle(handle);
            files.push(...result);
            continue;
          } catch (e) {
            // Fall through to next handler
          }
        }
        if (typeof (item as any).webkitGetAsEntry === 'function') {
          const entry = await (item as any).webkitGetAsEntry();
          if (entry) {
            if (entry.isFile) continue;
            const result = await getFilesFromEntry(entry);
            files.push(...result);
            continue;
          }
        }
      }
    } else if (event.dataTransfer?.files) {
      const list = event.dataTransfer.files;
      for (let index = 0; index < list.length; index++) {
        const file = list.item(index);
        if (file) {
          files.push(file);
        }
      }
    }
    
    for (const file of files) {
      if (onImageCreated) {
        const info = await createImage(file);
        await onImageCreated(info);
      }
    }
  };

  return (
    <UploadDragger
      beforeUpload={beforeUpload}
      multiple={true}
      onDrop={onDrop}
      customRequest={(e: any) => console.log('upload', e)}
      accept={Object.keys(Mimes).map((item) => '.' + item).join(',')}
      desc={'JPG / JPEG / PNG / WEBP / GIF / SVG / AVIF'}
    />
  );
};


