"use client";

import React, { useState } from 'react';
import { Button, Popover } from 'antd';
import { Icon } from './Icons';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiSelectProps {
    disabled?: boolean;
    toSelect: (emoji: string) => void;
}

export const EmojiSelect = ({disabled, toSelect}: EmojiSelectProps) => {
    const [open, setOpen] = useState(false);
    const hide = () => {
        setOpen(false);
    };
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };
    const onEmojiSelect = (e: { native: string }) => {
        toSelect(e.native);
        hide();
    }
    return (
        <Popover
        content={<Picker data={data} onEmojiSelect={onEmojiSelect} />}
        title=""
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
        >
            <Button
                type="text"
                shape="circle"
                disabled={disabled}
                icon={<Icon name="Smile" />}
            ></Button>
        </Popover>
    )
}