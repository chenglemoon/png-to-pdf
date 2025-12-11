"use client";

import React, { useState, useRef, useEffect } from 'react';
import { InputNumber, Button, message } from 'antd';
import { RadiusUpleftOutlined, RadiusUprightOutlined, RadiusBottomleftOutlined, RadiusBottomrightOutlined } from '@ant-design/icons';
import { Icon } from '@/components/image-compressor/compressor/Icons';
import { DownBtn } from '@/components/profile-picture-maker/beautifier/DownBtn';
import { UploadDragger } from '@/components/image-compressor/compressor/UploadDragger';
import { cn } from '@/lib/utils';
import { fileToDataURL, url2Blob, copyAsBlob, toDownloadFile, getImage, computedSize } from '@/lib/beautifier-utils';
import useKeyboardShortcuts from '@/lib/beautifier-useKeyboardShortcuts';
import usePaste from '@/lib/beautifier-usePaste';

export default function Rounded() {
  const [messageApi, contextHolder] = message.useMessage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoData, setPhotoData] = useState<HTMLImageElement | null>(null);
  const [roundValue, setRoundValue] = useState(30);
  const [radius, setRadius] = useState<string[]>(['tl', 'tr', 'bl', 'br']);
  const [isGrid, setIsGrid] = useState(false);
  
  // 使用 ref 存储最新的值，以便在事件处理函数中使用
  const roundValueRef = useRef(roundValue);
  const radiusRef = useRef(radius);
  
  useEffect(() => {
    roundValueRef.current = roundValue;
  }, [roundValue]);
  
  useEffect(() => {
    radiusRef.current = radius;
  }, [radius]);

  // 加载默认图片
  useEffect(() => {
    const loadDefaultImage = async () => {
      try {
        const defaultImageSrc = '/photo-to-rounded-1.jpg';
        const img = await getImage(defaultImageSrc);
        toDraw(img, roundValue, radius);
        setPhotoData(img);
      } catch (error) {
        console.error('Failed to load default image:', error);
      }
    };
    
    if (!photoData) {
      loadDefaultImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听来自 HeroSection 的文件上传事件
  useEffect(() => {
    const handleFileUpload = async (event: Event) => {
      const customEvent = event as CustomEvent<{ file: File }>;
      const file = customEvent.detail?.file;
      if (!file) return;
      
      try {
        const { img } = await fileToDataURL(file);
        // 使用 ref 中的最新值
        toDraw(img, roundValueRef.current, radiusRef.current);
        setPhotoData(img);
      } catch (error) {
        console.error('Failed to process uploaded file:', error);
      }
    };

    document.addEventListener('rounded-upload-file', handleFileUpload);
    return () => {
      document.removeEventListener('rounded-upload-file', handleFileUpload);
    };
  }, []);

  usePaste(async (file: File) => {
    try {
      const { img } = await fileToDataURL(file);
      toDraw(img, roundValue, radius);
      setPhotoData(img);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useKeyboardShortcuts(() => toDownload(), () => toCopy(), [photoUrl]);

  const beforeUpload = async (file: File) => {
    try {
      const { img } = await fileToDataURL(file);
      toDraw(img, roundValue, radius);
      setPhotoData(img);
    } catch (error) {
      console.error(error);
    }
    return Promise.reject();
  };

  const toDraw = (image: HTMLImageElement, r = 0, type: string[] = []) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = image;
    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.moveTo(0, r);
    ctx.beginPath();

    // 绘制圆角矩形的路径
    if (type.includes('tr')) {
      ctx.lineTo(width - r, 0);
      ctx.arc(width - r, r, r, 1.5 * Math.PI, 2 * Math.PI);
    } else {
      ctx.lineTo(width, 0);
    }
    if (type.includes('br')) {
      ctx.lineTo(width, height - r);
      ctx.arc(width - r, height - r, r, 0, 0.5 * Math.PI);
    } else {
      ctx.lineTo(width, height);
    }
    if (type.includes('bl')) {
      ctx.lineTo(r, height);
      ctx.arc(r, height - r, r, 0.5 * Math.PI, 1 * Math.PI);
    } else {
      ctx.lineTo(0, height);
    }
    if (type.includes('tl')) {
      ctx.lineTo(0, r);
      ctx.arc(r, r, r, 1 * Math.PI, 1.5 * Math.PI);
    } else {
      ctx.lineTo(0, 0);
    }

    // 剪切和绘制图片
    ctx.clip();
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.restore();
    // 导出图片
    const imgbase64 = canvas.toDataURL("image/png");
    setPhotoUrl(imgbase64);
  };

  const handleRadiusChange = (key: string) => {
    const type = radius.includes(key) ? radius.filter(e => e !== key) : [key, ...radius];
    setRadius(type);
    if (photoData) toDraw(photoData, roundValue, type);
  };

  const handleInput = (value: number | null) => {
    if (value === null) return;
    setRoundValue(value);
    if (photoData) toDraw(photoData, value, radius);
  };

  const toDownload = () => {
    if (!photoUrl) return;
    toDownloadFile(photoUrl, 'shotEasy.png');
    messageApi.success('Download Success!');
  };

  const toCopy = () => {
    if (!photoUrl) return;
    setLoading(true);
    url2Blob(photoUrl)
      .then((value) => {
        copyAsBlob(value)
          .then(() => {
            messageApi.success('Copied Success!');
          })
          .catch(() => {
            messageApi.error('Copy Failed!');
          });
      })
      .catch(() => {
        messageApi.error('Copy Failed!');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toRefresh = () => {
    setPhotoUrl('');
    setPhotoData(null);
  };

  return (
    <>
      {contextHolder}
      <div className={cn("rounded-md shadow-lg border-t overflow-hidden border-t-gray-600 antialiased", isGrid ? 'tr' : 'polka')}>
        <div className="flex gap-4 justify-center flex-col-reverse bg-white dark:bg-gray-800 p-2 border-b shadow-md md:flex-row md:justify-between">
          <div className="flex items-center justify-center gap-3">
            <div className="w-32">
              <InputNumber
                min={0}
                keyboard
                defaultValue={roundValue}
                addonAfter="px"
                onChange={handleInput}
              />
            </div>
            <Button
              size="small"
              type={radius.includes('tl') ? 'primary' : 'dashed'}
              shape="circle"
              onClick={() => handleRadiusChange('tl')}
              icon={<RadiusUpleftOutlined />}
            />
            <Button
              size="small"
              type={radius.includes('tr') ? 'primary' : 'dashed'}
              shape="circle"
              onClick={() => handleRadiusChange('tr')}
              icon={<RadiusUprightOutlined />}
            />
            <Button
              size="small"
              type={radius.includes('bl') ? 'primary' : 'dashed'}
              shape="circle"
              onClick={() => handleRadiusChange('bl')}
              icon={<RadiusBottomleftOutlined />}
            />
            <Button
              size="small"
              type={radius.includes('br') ? 'primary' : 'dashed'}
              shape="circle"
              onClick={() => handleRadiusChange('br')}
              icon={<RadiusBottomrightOutlined />}
            />
            <Button
              type="text"
              shape="circle"
              className={isGrid ? 'text-[#1677ff]' : ''}
              icon={<Icon name="Grip" />}
              onClick={() => setIsGrid(!isGrid)}
            />
          </div>
          <div className="flex gap-3 items-center justify-center">
            {photoData && (
              <div className="text-xs opacity-60 dark:text-slate-400">
                {photoData.width} × {photoData.height} px
              </div>
            )}
            <DownBtn disabled={!photoUrl} loading={loading} toDownload={toDownload} toCopy={toCopy} />
            <Button
              type="text"
              disabled={!photoUrl}
              loading={loading}
              icon={<Icon name="Eraser" />}
              onClick={toRefresh}
            />
          </div>
        </div>
        <div className="relative min-h-[200px] p-10 bg-white dark:bg-gray-800">
          <div className="flex w-full items-center justify-center z-10">
            {!photoUrl && <UploadDragger beforeUpload={beforeUpload} />}
            {photoUrl && photoData && (
              <div
                className="overflow-hidden max-w-[80%]"
                style={{
                  width: computedSize(photoData.width, photoData.height).width + 'px',
                }}
              >
                <img src={photoUrl} className="w-full" alt="Rounded photo" />
              </div>
            )}
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </>
  );
}

