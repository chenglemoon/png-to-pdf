"use client";

import React from 'react';
import { Flex, Progress } from 'antd';
import { formatSize } from '@/lib/compressor-utils';
import { useCompressorStore } from '@/stores/compressorStore';
import { Icon } from './Icons';

type CompressorStore = ReturnType<typeof useCompressorStore>;

export const ProgressHint = ({ store }: { store: CompressorStore }) => {
  const info = store.getProgressHintInfo();

  let rate = null;
  if (info.originSize > info.outputSize) {
    rate = (
      <span className="font-semibold text-green-500">
        {info.rate}%
        <Icon name="ArrowDown" />
      </span>
    );
  } else {
    rate = (
      <span className="font-semibold text-rose-500">
        {info.rate}%
        <Icon name="ArrowDown" />
      </span>
    );
  }

  return (
    <Flex align='center' className='bg-gray-800 py-1 px-3 gap-2 text-white'>
      <Progress
        type='circle'
        percent={info.percent}
        strokeWidth={20}
        size={14}
      />
      <div className="flex gap-4">
        <span className="text-slate-400">
          <span className="font-semibold text-green-500">
            {info.loadedNum}
          </span> / {info.totalNum}
        </span>
        <span className="text-slate-400">
          Before:
          <span className="text-white ml-1">
            {formatSize(info.originSize)}
          </span>
        </span>
        <span className="text-slate-400">
          After:
          <span className="text-white ml-1">
            {formatSize(info.outputSize)}
          </span>
        </span>
        <span className="text-slate-300">
          Decrease ratio: {rate}
        </span>
      </div>
    </Flex>
  );
};

