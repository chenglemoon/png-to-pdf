"use client";

import React from 'react';
import { Radio } from 'antd';
import backgroundConfig from '@/lib/beautifier-backgroundConfig';
import { Icons } from './Icons';
import { cn } from '@/lib/utils';

const isImg = ['cosmic', 'desktop'];

interface BackgroundSelectProps {
    type: string;
    options?: Array<{ key: string; value?: string }>;
    onChange: (value: string) => void;
    value: string;
}

export const BackgroundSelect = ({ type, options, onChange, value }: BackgroundSelectProps) => {
    let lists: Array<{ key: string; value?: string }> = [];
    if (options && options.length) {
        lists = options;
    } else {
        const arr: Array<{ key: string; value?: string }> = [];
        Object.keys(backgroundConfig).map(key => {
            if (key.includes(type)) {
                arr.push({
                    key,
                    value: (backgroundConfig as Record<string, string>)[key]
                });
            }
        });
        lists = arr;
    }
    return (
        <Radio.Group onChange={(e) => onChange(e.target.value)} value={value} rootClassName={cn(
            "grid [&_span]:ps-0", isImg.includes(type) ? 'grid-cols-5 gap-y-1.5' : type.includes('style') ? 'flex [&_.ant-radio-wrapper-checked]:z-[1] [&_.ant-radio-wrapper_span]:ps-0 [&_.ant-radio-wrapper_span]:pe-0 hover:[&_.ant-radio-wrapper_span]:scale-[1.1]':'grid-cols-7 gap-y-3'
        )}>
            {lists.map((item, index) => (
                <Radio key={index} className="[&_.ant-radio]:hidden [&_span]:p-0 mr-0" value={item.key}>
                    {isImg.includes(type) ?
                        <div className={cn("w-12 h-8 rounded-md overflow-hidden")}>
                            <img src={`${item.value}&w=48`} className="w-full h-full object-cover object-center" />
                        </div> : type.includes('style') ? <div className="w-6 h-8 overflow-hidden" style={JSON.parse(item.key)}></div> :
                            type.includes('svg') ? <div className="w-8 h-8 rounded-full overflow-hidden" style={JSON.parse(item.key)}></div> :
                                <div className={cn("w-8 h-8 rounded-full overflow-hidden", item.value)}>
                            {item.key == 'solid_1' && <Icons.transparent className="text-[32px]" />}
                        </div>
                    }
                </Radio>
            ))}
        </Radio.Group>
    )
}