"use client";

import { icons } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Icon = ({ name, color, size, className, ...props }: { name: string; color?: string; size?: string | number; className?: string; [key: string]: any }) => {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) {
    return <span className={cn("anticon", className)} {...props}>{name}</span>;
  }
  return <span role="img" aria-label={name} className={cn("anticon", className)} {...props}><LucideIcon color={color} size={size || '1em'} /></span>;
};

export const Icons = {
  comparer: (props: any) => (
    <svg viewBox="0 0 24 24" {...props} width="1em" height="1em" fill="currentColor">
      <path d="M13,23H11V1H13V23M9,19H5V5H9V3H5C3.89,3 3,3.89 3,5V19C3,20.11 3.9,21 5,21H9V19M19,7V9H21V7H19M19,5H21C21,3.89 20.1,3 19,3V5M21,15H19V17H21V15M19,11V13H21V11H19M17,3H15V5H17V3M19,21C20.11,21 21,20.11 21,19H19V21M17,19H15V21H17V19Z" />
    </svg>
  )
};

