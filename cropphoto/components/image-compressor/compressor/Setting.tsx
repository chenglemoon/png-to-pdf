"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Slider, Select, InputNumber, Button, ColorPicker, Tooltip } from 'antd';
import { useCompressorStore } from '@/stores/compressorStore';
import { compressImage } from '@/lib/compressor-transform';

type CompressorStore = ReturnType<typeof useCompressorStore>;

const showTip = (num: number) => {
    if (num < 30) return 'Low';
    if (num < 60) return 'Mid';
    if (num < 90) return 'Optimal';
    return 'High';
};

const defaultOption = {
    quality: 75,
    format: 'auto',
    color: '#FFFFFF',
    sizeType: 'auto',
    size: undefined as number | undefined
}

const convertOptions = [
    { value: 'auto', label: <span>Auto</span> },
    { value: 'jpg', label: <span>JPG</span> },
    { value: 'jpeg', label: <span>JPEG</span> },
    { value: 'png', label: <span>PNG</span> },
    { value: 'webp', label: <span>WEBP</span> },
    { value: 'avif', label: <span>AVIF</span> }
];

const sizeOption = [
    { value: 'auto', label: <span>Auto</span> },
    { value: 'fitWidth', label: <span>Width</span> },
    { value: 'fitHeight', label: <span>Height</span> },
];

export default function Setting({ store, onRecompress }: { store: CompressorStore; onRecompress?: () => Promise<void> }) {
    const [quality, setQuality] = useState(defaultOption.quality);
    const [format, setFormat] = useState(defaultOption.format);
    const [color, setColor] = useState(defaultOption.color);
    const [sizeType, setSizeType] = useState(defaultOption.sizeType);
    const [size, setSize] = useState(defaultOption.size);
    const isInitialMount = useRef(true);

    useEffect(() => {
        // Sync with store option
        const jpegQuality = Math.round(store.option.jpeg * 100);
        setQuality(jpegQuality);
        setFormat(store.option.format.target || 'auto');
        setColor(store.option.format.transparentFill);
        setSizeType(store.option.resize.method || 'auto');
        setSize(store.option.resize.width || store.option.resize.height);
    }, [store.option]);

    const reset = () => {
        store.resetOption();
        setQuality(defaultOption.quality);
        setFormat(defaultOption.format);
        setColor(defaultOption.color);
        setSizeType(defaultOption.sizeType);
        setSize(defaultOption.size);
    }

    const onQualityChange = async (value: number) => {
        setQuality(value);
        store.setQuality(value);
        // Auto recompress when quality changes
        if (store.list.size > 0 && onRecompress) {
            await onRecompress();
        }
    }

    const onFormatChange = async (value: string) => {
        setFormat(value);
        store.setFormat(value, color);
        // Auto recompress when format changes
        if (store.list.size > 0 && onRecompress) {
            await onRecompress();
        }
    }

    const onColorChange = (value: any) => {
        const col = "#" + value.toHex().toUpperCase();
        setColor(col);
        store.setFormat(format, col);
    }

    const onSizeTypeChange = async (value: string) => {
        setSizeType(value);
        setSize(undefined);
        store.setSizeType(value);
        // Auto recompress when size type changes
        if (store.list.size > 0 && onRecompress) {
            await onRecompress();
        }
    }

    const onSizeChange = async (value: number | null) => {
        if (value === null) return;
        setSize(value);
        store.setSizeType(sizeType, value);
        // Auto recompress when size changes
        if (store.list.size > 0 && onRecompress) {
            await onRecompress();
        }
    }

    return (
        <div className="py-1 px-2 flex items-center gap-4 border-t border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-xs select-none">
            <div className="flex gap-2 items-center">
                <label className="font-semibold">Quality:</label>
                <Slider className="flex-1 w-52" value={quality} min={0} max={100} step={1} onChange={onQualityChange} />
                <span className="w-12 text-blue-500">{showTip(quality)}</span>
            </div>
            <div className="flex gap-2 items-center">
                <label className="font-semibold">Convert:</label>
                <Select
                    className="flex-1 w-32"
                    value={format}
                    size="small"
                    onChange={onFormatChange}
                    options={convertOptions}
                />
            </div>
            {
                ['jpg', 'jpeg'].includes(format) &&
                <Tooltip placement="top" title="The transparent fill color">
                    <ColorPicker
                        showText
                        disabledAlpha
                        value={color}
                        size="small"
                        onChangeComplete={onColorChange}
                    />
                </Tooltip>
            }
            <div className="flex gap-2 items-center">
                <label className="font-semibold">Size:</label>
                <Select
                    className="w-24"
                    value={sizeType}
                    size="small"
                    onChange={onSizeTypeChange}
                    options={sizeOption}
                />
                {
                    sizeType !== 'auto' &&
                    <InputNumber className="w-48" size="small" value={size} addonAfter={`px, ${sizeType == 'fitWidth' ? 'H':'W'} auto`} min={1} max={100000} onChange={onSizeChange} />
                }
            </div>
            <div className="flex-1 text-right">
                <Button size="small" type="link" onClick={reset}>Reset</Button>
            </div>
        </div>
    );
}

