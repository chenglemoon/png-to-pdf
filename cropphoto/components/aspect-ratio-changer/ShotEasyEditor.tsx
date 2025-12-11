"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    TABS,
    TOOLS,
} from 'react-filerobot-image-editor';
import FilerobotImageEditorWrapper from './FilerobotImageEditorWrapper';
import { url2Blob, toDownloadFile } from './utils';
import usePaste from './usePaste';

interface ShotEasyEditorProps {
  imageSrc: string | null;
  onImageChange?: (newImageSrc: string) => void;
}

async function onSaveToClipboard(imageInfo: any) {
    const blob = await url2Blob(imageInfo.imageBase64);
    navigator.clipboard.write([
        new ClipboardItem({
            [imageInfo.mimeType]: blob,
        }),
    ]).catch((error) => {
        console.error(error);
    });
}

export default function ShotEasyEditor({ imageSrc, onImageChange }: ShotEasyEditorProps) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [isReader, setIsReader] = useState(true);
    const [photoUrl, setPhotoUrl] = useState<string | null>(imageSrc);
    const [photoName, setPhotoName] = useState('image');

    useEffect(() => {
        if (imageSrc) {
            setPhotoUrl(imageSrc);
            setIsReader(true);
        } else {
            setPhotoUrl(null);
        }
    }, [imageSrc]);

    usePaste((file: File) => {
        setPhotoUrl(window.URL.createObjectURL(file));
        setIsReader(true);
    }, [photoUrl]);

    const handleSelect = () => {
        fileInput.current?.click();
    };

    const onSelectChange = (files: React.ChangeEvent<HTMLInputElement>) => {
        if (files.target?.files?.length) {
            setIsReader(false);
            const file = files.target.files[0];
            setPhotoName(file.name);
            const url = window.URL.createObjectURL(file);
            setPhotoUrl(url);
            if (onImageChange) {
                onImageChange(url);
            }
            setTimeout(() => {
                setIsReader(true);
            }, 50);
        }
    };

    if (!photoUrl) {
        return null;
    }

    return (
        <>
            <div className="flex justify-center items-center gap-2 mb-6">
                <div className="relative">
                    <button 
                        className="py-1 flex gap-1 items-center px-4 rounded-full text-sm border-0 bg-[#6879eb] text-white" 
                        onClick={handleSelect}
                    >
                        Select photo to edit
                    </button>
                    <input
                        ref={fileInput}
                        type="file"
                        id="file"
                        hidden
                        accept="image/jpeg,image/webp,image/png,image/gif,image/bmp,image/heic,image/heif"
                        onChange={onSelectChange}
                    />
                    <span className="absolute text-xs opacity-60 top-8 left-[50%] translate-x-[-50%]">Or paste it</span>
                    <svg className="absolute -right-12 top-1 opacity-80" xmlns="http://www.w3.org/2000/svg" version="1.1" width="54" height="54" x="0" y="0" viewBox="0 0 100 100">
                        <g>
                            <path d="m74.3 66.8-5.8 5.8c-.6-20.7-8.9-27.8-13.6-30.1-.1-.4-.1-.8-.2-1.2-1-4.1-5.9-17.3-29.5-17.3h-.1v2h.1C47 26 51.7 37.9 52.6 41.7c-4.1-1.2-8-.2-9.7 2.4-1.5 2.3-1 5.2 1.4 8.1 3 3.6 5.7 2.8 6.7 2.3 2.6-1.3 4.2-5.2 4-9.5 5.7 3.4 10.9 12 11.4 27.6l-5.7-5.7-1.4 1.4 8.2 8.2 8.2-8.2zM50.1 52.7c-1.6.8-3.2-.5-4.3-1.8-1.8-2.1-2.2-4.2-1.2-5.7.9-1.3 2.6-2 4.6-2 .9 0 1.9.1 2.9.4l.9.3c.4 4.3-1 7.8-2.9 8.8z" fill="#000000" opacity="1"></path>
                        </g>
                    </svg>
                </div>
            </div>
            <div className="h-[calc(100vh-300px)] min-h-[700px] max-h-[900px] w-full rounded-md shadow-lg">
                {isReader && (
                    <FilerobotImageEditorWrapper
                        source={photoUrl}
                        defaultSavedImageName={photoName}
                        onSave={(editedImageObject: any, designState: any) => {
                            const url = editedImageObject.imageBase64;
                            const { fullName: fileName } = editedImageObject;
                            toDownloadFile(url, fileName);
                            if (onImageChange) {
                                onImageChange(url);
                            }
                        }}
                        theme={{}}
                        annotationsCommon={{
                            fill: '#ff0000',
                        }}
                        Text={{ text: 'CircleImage' }}
                        Rotate={{ angle: 90, componentType: 'slider' }}
                        Crop={{
                            presetsItems: [
                                {
                                    titleKey: 'classicTv',
                                    descriptionKey: '4:3',
                                    ratio: 4 / 3,
                                },
                                {
                                    titleKey: 'cinemascope',
                                    descriptionKey: '21:9',
                                    ratio: 21 / 9,
                                },
                            ],
                        }}
                        tabsIds={[TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK, TABS.FILTERS, TABS.FINETUNE, TABS.RESIZE]}
                        defaultTabId={TABS.ADJUST}
                        defaultToolId={TOOLS.CROP}
                        useBackendTranslations={false}
                        avoidChangesNotSavedAlertOnLeave={true}
                        savingPixelRatio={4}
                        previewPixelRatio={1}
                    />
                )}
            </div>
        </>
    );
}
