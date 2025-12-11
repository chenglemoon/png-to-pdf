"use client";

import React from 'react';
import { Upload } from 'antd';
import { Icon } from './Icons';
import { modKey } from '@/lib/compressor-utils';
import { Mimes } from '@/lib/compressor-mimes';

const { Dragger } = Upload;

export const UploadDragger = ({ beforeUpload, accept, desc, onDrop, ...props }: {
  beforeUpload?: (file: File) => Promise<void>;
  accept?: string;
  desc?: string;
  onDrop?: (e: React.DragEvent) => void;
  [key: string]: any;
}) => {
  const key = modKey();
  return (
    <Dragger
      accept={accept || Object.keys(Mimes).map((item) => '.' + item).join(',')}
      name="file"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onDrop={onDrop}
      {...props}
      rootClassName="p-4 rounded-md bg-white dark:bg-gray-800 shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600"
    >
      <div className="p-4">
        <p className="text-2xl"><Icon name="ImagePlus" size={32} className="opacity-60" /></p>
        <p className="text-sm px-4">
          Click or Drag image to this area<br />
          or <span className="bg-slate-200 dark:bg-gray-700 inline-block rounded-md px-1">{key}</span> <span className="bg-slate-200 dark:bg-gray-700 inline-block rounded-md px-1">C</span> Paste here
        </p>
        {desc && <p className="text-sm p-4 pb-0 opacity-70">{desc}</p>}
      </div>
    </Dragger>
  );
};

