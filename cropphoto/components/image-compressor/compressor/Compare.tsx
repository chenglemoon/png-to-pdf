"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactCompareImage from 'react-compare-image';
import { Button } from 'antd';
import { Icon } from './Icons';
import { useCompressorStore } from '@/stores/compressorStore';

type CompressorStore = ReturnType<typeof useCompressorStore>;

export default function Compare({ store }: { store: CompressorStore }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useRef(0.8);
  const bodyStyle = useRef<string | null>(null);
  const [show, setShow] = useState(true);
  const [width, setWidth] = useState(620);

  const info = store.compareId ? store.list.get(store.compareId) : null;

  useEffect(() => {
    if (!info || !info.compress?.src) return;

    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !info.width || !info.height) return;
      
      let imageWidth;
      let imageHeight;
      if (info.width / info.height > rect.width / rect.height) {
        imageWidth = rect.width * scale.current;
        imageHeight = (imageWidth * info.height) / info.width;
      } else {
        imageHeight = rect.height * scale.current;
        imageWidth = (imageHeight * info.width) / info.height;
      }
      setWidth(imageWidth);
    };

    const wheel = (event: WheelEvent) => {
      let newScale = -0.001 * event.deltaY + scale.current;
      if (newScale > 1) {
        newScale = 1;
      }
      if (newScale < 0.1) {
        newScale = 0.1;
      }

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !info.width || !info.height) return;
      
      let imageWidth;
      let imageHeight;
      if (info.width / info.height > rect.width / rect.height) {
        imageWidth = rect.width * newScale;
        imageHeight = (imageWidth * info.height) / info.width;
      } else {
        imageHeight = rect.height * newScale;
        imageWidth = (imageHeight * info.width) / info.height;
      }

      scale.current = newScale;
      setWidth(imageWidth);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('wheel', wheel);
    bodyStyle.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    resize();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", wheel);
      if (bodyStyle.current !== null) {
        document.body.style.overflow = bodyStyle.current;
      }
    };
  }, [info]);

  const toHide = () => {
    setShow(false);
    store.setCompareId(null);
  }

  if (!show || !info || !info.src || !info.compress?.src) {
    return null;
  }

  return createPortal(
    <div
      ref={containerRef}
      className={`fixed z-50 inset-0 flex items-center justify-center transition-opacity ${show ? "opacity-100 ease-in" : "opacity-0 ease-out"}`}
    >
      <div
        className="relative z-[1]"
        style={{
          width: `${width}px`
        }}
      >
        <ReactCompareImage leftImage={info.src} rightImage={info.compress.src} />
      </div>
      <div className="absolute inset-0 bg-black/50 z-0" onClick={toHide}></div>
      <Button onClick={toHide} type="text" icon={<Icon name="X" size={24} />} shape="circle" size="large" className="absolute opacity-90 z-[2] top-2 right-2 bg-black/50 text-white" />
    </div>,
    document.body,
  );
}

