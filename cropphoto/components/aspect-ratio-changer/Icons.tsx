import { icons } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Icon = ({ name, color, size, className, ...props }: {
    name: string;
    color?: string;
    size?: string | number;
    className?: string;
    [key: string]: any;
}) => {
    const iconNameMap: Record<string, keyof typeof icons> = {
        'Crop': 'Crop',
        'Grip': 'GripVertical',
        'Download': 'Download',
        'Copy': 'Copy',
        'Eraser': 'Eraser',
        'ZoomOut': 'ZoomOut',
        'ZoomIn': 'ZoomIn',
        'Undo': 'Undo2',
        'Check': 'Check',
    };
    const iconName = iconNameMap[name] || name;
    const LucideIcon = icons[iconName as keyof typeof icons];
    if (!LucideIcon) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }
    return <span role="img" aria-label={name} className={cn("anticon", className)} {...props}><LucideIcon color={color} size={size || '1em'} /></span>;
};


