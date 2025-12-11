// 简化版的时间选择器组件
import React, { useState, useRef, useEffect } from 'react';

interface TimeObject {
  hours: number;
  minutes: number;
  meridiem: string;
}

interface TimePickerOption {
  value: number | string;
  text: number | string;
}

interface TimePickerColumnProps {
  value: number | string;
  onChange: (value: number | string) => void;
  options: TimePickerOption[];
  className?: string;
  extraClass?: string;
}

const TimePickerColumn: React.FC<TimePickerColumnProps> = ({ 
  value, 
  onChange, 
  options, 
  className = "",
  extraClass = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaY = e.clientY - startY.current;
    const currentIndex = options.findIndex(option => option.value === value);
    const draggedItems = Math.round(deltaY / 48);
    let newIndex = currentIndex - draggedItems;
    
    while (newIndex < 0) newIndex += options.length;
    while (newIndex >= options.length) newIndex -= options.length;
    
    onChange(options[newIndex].value);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    
    const deltaY = e.touches[0].clientY - startY.current;
    const currentIndex = options.findIndex(option => option.value === value);
    const draggedItems = Math.round(deltaY / 48);
    let newIndex = currentIndex - draggedItems;
    
    while (newIndex < 0) newIndex += options.length;
    while (newIndex >= options.length) newIndex -= options.length;
    
    onChange(options[newIndex].value);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const currentIndex = options.findIndex(option => option.value === value);
    const delta = e.deltaY > 0 ? 1 : -1;
    let newIndex = currentIndex + delta;
    
    while (newIndex < 0) newIndex += options.length;
    while (newIndex >= options.length) newIndex -= options.length;
    
    onChange(options[newIndex].value);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative h-full text-center overflow-hidden ${className} ${extraClass}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
    >
      {/* 高亮区域指示器 */}
      <div className="absolute top-1/2 left-0 w-full h-12 -mt-6 border-t border-b border-[#1C2248] pointer-events-none z-[5]"></div>

      {/* 显示7个项目 */}
      {(() => {
        const currentIndex = options.findIndex(opt => opt.value === value);
        
        return Array.from({ length: 7 }, (_, i) => {
          const offset = i - 3;
          let index = currentIndex + offset;
          while (index < 0) index += options.length;
          while (index >= options.length) index -= options.length;
          
          const option = options[index];
          const isCenter = offset === 0;
          
          return (
            <div
              key={`${option.value}-${offset}`}
              className="absolute w-full h-12 flex items-center justify-center"
              style={{
                top: `calc(50% + ${offset * 48 - 24}px)`,
                opacity: isCenter ? 1 : 0.6 - Math.abs(offset) * 0.1,
                color: isCenter ? '#ffffff' : '#888888',
                fontSize: isCenter ? '18px' : '16px',
                fontWeight: isCenter ? '600' : '400'
              }}
            >
              {typeof option.text === 'number' && option.text < 10 ? `0${option.text}` : String(option.text)}
            </div>
          );
        });
      })()}
    </div>
  );
};

export default function Hero() {
  const [currentTime, setCurrentTime] = useState<TimeObject>({
    hours: 6,
    minutes: 30,
    meridiem: "AM"
  });

  const hours = Array.from({length: 12}, (_, i) => ({value: i + 1, text: i + 1}));
  const minutes = Array.from({length: 60}, (_, i) => ({value: i, text: i}));
  const meridiem_options = [{value: "AM", text: "AM"}, {value: "PM", text: "PM"}];

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <p className="text-xl md:text-2xl font-medium mb-6">What time do you want to wake up?</p>
        
        {/* 时间选择器 */}
        <div className="flex justify-center items-center mb-8">
          <div className="relative flex items-stretch justify-between w-full max-w-[350px] h-40 border border-[#B1A873] rounded-[13px] bg-[rgba(15,21,56,0.99)] overflow-hidden">
            
            {/* 小时选择器 */}
            <TimePickerColumn
              value={currentTime.hours}
              onChange={(value) => setCurrentTime({...currentTime, hours: value as number})}
              options={hours}
              extraClass="time-picker__inner_pl"
            />

            {/* 分钟选择器 */}
            <TimePickerColumn
              value={currentTime.minutes}
              onChange={(value) => setCurrentTime({...currentTime, minutes: value as number})}
              options={minutes}
            />

            {/* AM/PM选择器 */}
            <TimePickerColumn
              value={currentTime.meridiem}
              onChange={(value) => setCurrentTime({...currentTime, meridiem: value as string})}
              options={meridiem_options}
              extraClass="time-picker__inner_pr"
            />
          </div>
        </div>
        
        {/* 显示当前选择的时间 */}
        <div className="text-white text-lg">
          选择的时间: {currentTime.hours.toString().padStart(2, '0')}:{currentTime.minutes.toString().padStart(2, '0')} {currentTime.meridiem}
        </div>
      </div>
    </div>
  );
}
