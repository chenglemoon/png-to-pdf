"use client";

import React, { useRef, useEffect } from 'react';
import { Line, Rect, Circle, Arrow, Text, Transformer } from 'react-konva';
import type { Shape } from '@/lib/beautifier-useAnnotate';

interface ShapeLineProps {
    shape: Shape;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (newShape: Shape) => void;
    [key: string]: any;
}

export const ShapeLine = ({ shape, isSelected, onSelect, onChange, ...props }: ShapeLineProps) => {
    const shapeRef = useRef<any>(null);
    const trRef = useRef<React.ComponentRef<typeof Transformer>>(null);
    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            // we need to attach transformer manually
            trRef.current.nodes([shapeRef.current]);
            const layer = trRef.current.getLayer();
            if (layer) {
                layer.batchDraw();
            }
        }
    }, [isSelected]);
    return (
        <>
            {(shape.type === 'pencil' || shape.type === 'line') &&
            <Line
                {...props}
                ref={shapeRef}
                points={shape.points ?? []}
                stroke={shape.color}
                strokeWidth={+(shape.strokeWidth ?? 4)}
                id={shape.id}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                draggable={true}
                globalCompositeOperation={'source-over'}
                onClick={onSelect}
                onTap={onSelect}
            />
            }
            {shape.type === 'rect' &&
            <Rect
                {...props}
                ref={shapeRef}
                x={shape.points?.[0] ?? 0}
                y={shape.points?.[1] ?? 0}
                width={shape.width}
                height={shape.height}
                stroke={shape.color}
                strokeWidth={+(shape.strokeWidth ?? 4)}
                id={shape.id}
                draggable={true}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                    onChange({
                        ...shape,
                        points: [e.target.x(), e.target.y()]
                    });
                }}
            />
            }
            {shape.type === 'filledRect' &&
            <Rect
                {...props}
                ref={shapeRef}
                x={shape.points?.[0] ?? 0}
                y={shape.points?.[1] ?? 0}
                width={shape.width}
                height={shape.height}
                fill={shape.color}
                id={shape.id}
                draggable={true}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                    onChange({
                        ...shape,
                        points: [e.target.x(), e.target.y()]
                    });
                }}
            />
            }
            {shape.type === 'circle' &&
            <Circle
                {...props}
                ref={shapeRef}
                x={shape.points?.[0] ?? 0}
                y={shape.points?.[1] ?? 0}
                radius={shape.radius}
                stroke={shape.color}
                strokeWidth={+(shape.strokeWidth ?? 4)}
                id={shape.id}
                draggable={true}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                    onChange({
                        ...shape,
                        points: [e.target.x(), e.target.y()]
                    });
                }}
            />
            }
            {shape.type === 'arrow' &&
            <Arrow
                {...props}
                ref={shapeRef}
                points={shape.points ?? []}
                fill={shape.color}
                stroke={shape.color}
                strokeWidth={+(shape.strokeWidth ?? 4)}
                pointerLength={shape.pointerLength}
                pointerWidth={shape.pointerWidth}
                id={shape.id}
                draggable={true}
                onClick={onSelect}
                onTap={onSelect}
            />
            }
            {shape.type === 'emoji' &&
            <Text
                {...props}
                ref={shapeRef}
                x={shape.x}
                y={shape.y}
                text={shape.text}
                scale={shape.scale}
                fontSize={shape.fontSize}
                fontFamily="Arial"
                id={shape.id}
                draggable={true}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                    onChange({
                        ...shape,
                        x: e.target.x(),
                        y: e.target.y()
                    });
                }}
                onTransformEnd={(e) => {
                    onChange({
                        ...shape,
                        scale: e.target.scale()
                    });
                }}
            />
            }
            {isSelected &&
                <Transformer
                    ref={trRef}
                    flipEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                    anchorStyleFunc={(anchor: any) => {
                        anchor.cornerRadius(10);
                        if (anchor.hasName('top-center') || anchor.hasName('bottom-center')) {
                            anchor.height(6);
                            anchor.offsetY(3);
                            anchor.width(30);
                            anchor.offsetX(15);
                        }
                        if (anchor.hasName('middle-left') || anchor.hasName('middle-right')) {
                            anchor.height(30);
                            anchor.offsetY(15);
                            anchor.width(6);
                            anchor.offsetX(3);
                        }
                    }}
                />
            }
        </>
    )
}