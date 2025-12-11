"use client";

import React from 'react';
import FilerobotImageEditor, { TABS, TOOLS } from 'react-filerobot-image-editor';

type AvailableTab = typeof TABS[keyof typeof TABS];
type AvailableTool = typeof TOOLS[keyof typeof TOOLS];

interface FilerobotImageEditorWrapperProps {
    source: string;
    defaultSavedImageName: string;
    onSave: (editedImageObject: any, designState: any) => void;
    theme: any;
    annotationsCommon: any;
    Text: any;
    Rotate: any;
    Crop: any;
    tabsIds: AvailableTab[];
    defaultTabId: AvailableTab;
    defaultToolId: AvailableTool;
    useBackendTranslations: boolean;
    avoidChangesNotSavedAlertOnLeave: boolean;
    savingPixelRatio: number;
    previewPixelRatio: number;
}

/**
 * 包装组件用于 react-filerobot-image-editor
 * 注意：active 属性的警告来自库内部，不影响功能
 * 全局 ConsoleWarningFilter 组件会过滤这些警告
 */
const FilerobotImageEditorWrapper: React.FC<FilerobotImageEditorWrapperProps> = (props) => {
    return <FilerobotImageEditor {...props} />;
};

export default FilerobotImageEditorWrapper;
