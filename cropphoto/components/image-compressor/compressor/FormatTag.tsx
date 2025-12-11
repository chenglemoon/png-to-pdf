"use client";

import React from 'react';
import { Tag } from 'antd';

export const FormatTag = ({ type }: { type: string }) => {
  return <Tag>{type}</Tag>;
};


