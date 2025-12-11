"use client";

import React, { useState, useEffect } from 'react';
import { Spin, Button, message, Upload, Tooltip } from 'antd';
import { Icon, Icons } from './compressor/Icons';
import { UploadCard } from './compressor/UploadCard';
import { ProgressHint } from './compressor/ProgressHint';
import { FormatTag } from './compressor/FormatTag';
import Setting from './compressor/Setting';
import Compare from './compressor/Compare';
import { useTranslations } from 'next-intl';
import { formatSize, toDownloadFile, getOutputFileName, getUniqNameOnNames, getFilesHandleFromHandle, createImageBatch } from '@/lib/compressor-utils';
import { cn } from '@/lib/utils';
import { useCompressorStore } from '@/stores/compressorStore';
import { createImage, compressImage, createPreview } from '@/lib/compressor-transform';

export default function Compressor() {
  const t = useTranslations("ImageCompressor");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  
  const store = useCompressorStore();
  const disabled = store.hasTaskRunning();

  const handleImageCreated = async (info: any) => {
    store.addImage(info);
    
    // Create preview and compress in parallel
    try {
      const [preview, compress] = await Promise.all([
        createPreview(info, store.option).catch(err => {
          console.error('Failed to create preview:', err);
          return null;
        }),
        compressImage(info, store.option).catch(err => {
          console.error('Failed to compress image:', err);
          messageApi.error('Failed to compress image');
          return null;
        })
      ]);
      
      if (preview) {
        store.updateImage(info.key, { preview });
      }
      if (compress) {
        store.updateImage(info.key, { compress });
      }
    } catch (error) {
      console.error('Failed to process image:', error);
    }
  };

  const beforeUpload = async (file: File) => {
    try {
      const info = await createImage(file);
      await handleImageCreated(info);
    } catch (error) {
      console.error('Failed to process image:', error);
      messageApi.error('Failed to process image');
    }
    return Promise.reject();
  };

  const toDownload = (url: string, name: string) => {
    toDownloadFile(url, name);
    messageApi.success('Download Success!');
  };

  const toZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const names = new Set<string>();
    
    for (const info of store.list.values()) {
      const fileName = getOutputFileName(info, store.option);
      const uniqName = getUniqNameOnNames(names, fileName);
      names.add(uniqName);
      if (info.compress?.blob) {
        zip.file(uniqName, info.compress.blob);
      }
    }
    
    const result = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });
    return result;
  }

  const toDownloadZip = async () => {
    setLoading(true);
    try {
      const result = await toZip();
      toDownloadFile(URL.createObjectURL(result), "compressed.zip");
      messageApi.success('Download Success!');
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      messageApi.error('Failed to create ZIP file');
    } finally {
      setLoading(false);
    }
  }

  const addFolder = async () => {
    try {
      if (!window.showDirectoryPicker) {
        messageApi.error('Directory picker is not supported in this browser');
        return;
      }
      const handle = await window.showDirectoryPicker();
      await getFilesHandleFromHandle(handle);
      
      // Process files from directory
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const info = await createImage(file, handle.name);
          await handleImageCreated(info);
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to add folder:', error);
        messageApi.error('Failed to add folder');
      }
    }
  }

  const handleRecompress = async () => {
    // Clear existing compressed results
    for (const info of store.list.values()) {
      if (info.compress?.src) {
        URL.revokeObjectURL(info.compress.src);
      }
      store.updateImage(info.key, { compress: undefined });
    }
    
    // Recompress all images with new options
    for (const info of store.list.values()) {
      try {
        const compress = await compressImage(info, store.option);
        store.updateImage(info.key, { compress });
      } catch (error) {
        console.error('Failed to recompress:', error);
        messageApi.error('Failed to recompress image');
      }
    }
  };

  let listComponent = <UploadCard onImageCreated={handleImageCreated} />;
  if (store.list.size > 0) {
    listComponent = (
      <div className="w-full bg-white dark:bg-gray-800 shadow-md rounded-md overflow-hidden">
        <ProgressHint store={store} />
        <div className="p-4 grid gap-6">
          {Array.from(store.list.values()).reverse().map((info) => {
            const reduction = info.compress 
              ? Math.abs(((info.compress.blob.size - info.blob.size) / info.blob.size) * 100).toFixed(2)
              : '0';
            const isReduced = info.compress && info.blob.size > info.compress.blob.size;
            
            return (
              <div key={info.key} className="flex items-center justify-between pb-5 relative after:block after:absolute after:bottom-0 after:left-16 after:right-0 after:h-[1px] after:bg-slate-200 dark:after:bg-slate-700">
                <div className="flex items-center max-w-[50%]">
                  <div className="overflow-hidden w-[48px] h-[48px] mr-4 rounded-md relative cursor-pointer [&_div]:hover:flex select-none">
                    <img src={info.preview?.src || info.src} className="w-full h-full flex-shrink-0 object-cover aspect-[1/1] relative z-0" alt={info.name} />
                    {info.compress?.src && 
                      <div
                        className="absolute hidden top-0 left-0 right-0 bottom-0 bg-[#00000050] items-center justify-center text-white"
                        onClick={() => store.setCompareId(info.key)}
                      >
                        <Icons.comparer />
                      </div>
                    }
                  </div>
                  <div className="flex-1 w-full">
                    <div className="font-semibold mb-1.5 truncate text-gray-900 dark:text-white">{info.name}</div>
                    <div className="text-xs flex gap-1 text-gray-600 dark:text-gray-400">
                      {info.blob?.type && <span><FormatTag type={info.blob.type.replace('image/', '').toUpperCase()} /></span>}
                      <span className="text-xs">{!info.width && !info.height ? "-" : `${info.width}*${info.height}`}</span>
                      <span className="text-xs">{formatSize(info.blob.size)}</span>
                    </div>
                  </div>
                </div>
                {info.compress &&
                  <div className="flex items-center">
                    <div className="px-1 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <span className="font-bold text-sm">{reduction}%</span>
                        <Icon name="ArrowDown" size="0.8em" className={cn(isReduced ? "text-green-600" : "text-red-600")} />
                      </div>
                      <div className="text-xs">
                        <span className={cn(isReduced ? "text-green-600" : "text-red-600")}>
                          {formatSize(info.compress.blob.size)}
                        </span>
                      </div>
                    </div>
                    <div className="p-1">
                      <Button
                        type="primary"
                        className="bg-black"
                        icon={<Icon name="Download" />}
                        onClick={() => {
                          const fileName = getOutputFileName(info, store.option);
                          toDownload(info.compress!.src, fileName);
                        }}
                      />
                    </div>
                  </div>
                }
                {!info.compress && <div className="px-3"><Spin /></div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-md overflow-hidden">
        <div id="compressor" className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4 p-2 justify-center flex-col-reverse md:flex-row md:justify-between">
            <div className="flex gap-3 items-center justify-center">
              <Upload name="file" multiple={true} beforeUpload={beforeUpload} showUploadList={false}>
                <Button disabled={disabled} icon={<Icon name="ImagePlus" />} className="border border-gray-300 dark:border-gray-600">Add Images</Button>
              </Upload>
              {typeof window !== 'undefined' && !!window.showDirectoryPicker && (
                <Button disabled={disabled} icon={<Icon name="FolderPlus" />} onClick={addFolder} className="border border-gray-300 dark:border-gray-600">Add Folder</Button>
              )}
              <Button
                type={showSetting ? "primary" : "text"}
                icon={<Icon name="Settings2" />}
                onClick={() => setShowSetting(!showSetting)}
              ></Button>
              {(showSetting && store.list.size > 0) && <span className="text-xs text-slate-500 dark:text-slate-400">Use Recompress to apply the new settings</span>}
            </div>
            {store.list.size > 0 &&
              <div className="flex gap-3 items-center justify-center">
                <Tooltip placement="top" title="Recompress">
                  <Button
                    type="text"
                    icon={<Icon name="RotateCw" />}
                    onClick={handleRecompress}
                  ></Button>
                </Tooltip>
                <Tooltip placement="top" title="Download all using zip">
                  <Button
                    type="primary"
                    className="bg-black"
                    disabled={disabled}
                    loading={loading}
                    icon={<Icon name="Download" />}
                    onClick={toDownloadZip}
                  >Download All</Button>
                </Tooltip>
                <Tooltip placement="top" title="Clear all">
                  <Button
                    type="text"
                    loading={loading}
                    icon={<Icon name="Eraser" />}
                    onClick={() => {
                      store.clearAll();
                    }}
                  ></Button>
                </Tooltip>
              </div>
            }
          </div>
          {(showSetting || store.list.size > 0) && <Setting store={store} onRecompress={handleRecompress} />}
        </div>
        <div className="relative min-h-[400px] p-5 polka">
          <div className="flex w-full justify-center z-10">
            {listComponent}
          </div>
        </div>
      </div>
      {store.compareId !== null && <Compare store={store} />}
    </>
  );
}

