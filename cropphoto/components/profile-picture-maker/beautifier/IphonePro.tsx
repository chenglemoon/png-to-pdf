"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface IphoneProProps {
    height: number;
    img: string;
    style?: React.CSSProperties;
    fit?: 'cover' | 'contain' | 'fill';
    shadow?: number;
}

export const IphonePro = ({height, img, style, fit, shadow}: IphoneProProps) => {
    return (
        <div style={{width: `${height*608/1200}px`, fontSize: `${14*(height/1200)}px`}}>
            <div className="iphone" style={{ width: `${ height*608/1200 }px`, height: `${height }px` }}>
                <img src="/dark-blue.png" alt="Iphone 15 Pro frame" className="absolute z-[1] top-0 left-0 right-0 bottom-0" />
                <div className='frame h-full w-full overflow-hidden bg-black relative z-0'>
                    <div className="h-full w-full" style={style}>
                        <img src={img} className={cn("max-w-full max-h-full block min-h-full min-w-full object-center", fit === 'cover' && "object-cover", fit === 'contain' && "object-contain", fit === 'fill' && "object-fill")} />
                    </div>
                </div>
                <div className="sd absolute -z-10" style={{opacity: (shadow ?? 0) / 10}}>
                    <div className="layer layer-1"></div>
                    <div className="layer layer-2"></div>
                    <div className="layer layer-3"></div>
                    <div className="layer layer-4"></div>
                    <div className="layer layer-5"></div>
                </div>
            </div>
        </div>
    )
}