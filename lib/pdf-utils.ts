"use client";

/**
 * PDF utilities - 按照 bentopdf-main 的实现方式
 * 这个文件只在客户端使用
 */

// 扩展 Window 接口以支持 pdfjsLib
declare global {
  interface Window {
    pdfjsLib?: any;
    pdfjsLibReady?: boolean;
  }
}

let pdfjsLib: any = null;
let initPromise: Promise<any> | null = null;

/**
 * 初始化 pdfjs-dist（只在客户端执行）
 * 使用 CDN 方式加载以避免 Next.js webpack 问题
 */
async function initPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('pdfjs-dist can only be loaded in browser environment');
  }

  if (pdfjsLib) {
    return pdfjsLib;
  }

  // 如果正在初始化，等待完成
  if (initPromise) {
    return await initPromise;
  }

  // 开始初始化
  initPromise = (async () => {
    try {
      // 在 Next.js 中，直接使用 CDN 加载 pdfjs-dist 以避免 webpack 模块解析问题
      // 这是最可靠的方法
      return await loadPdfJsFromCDN();
    } catch (error) {
      initPromise = null; // 重置，允许重试
      throw error;
    }
  })();

  return await initPromise;
}

/**
 * 从 CDN 加载 pdfjs-dist
 * 使用 script 标签加载 ES 模块，完全避免 webpack 问题
 */
async function loadPdfJsFromCDN(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('CDN loading only works in browser');
  }

  // 检查是否已经加载
  if (window.pdfjsLib && window.pdfjsLibReady) {
    pdfjsLib = window.pdfjsLib;
    return pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    // 检查是否已经有正在加载的脚本
    const existingScript = document.querySelector('script[data-pdfjs-loader]');
    if (existingScript) {
      // 如果正在加载，等待完成事件
      const handleReady = () => {
        // @ts-ignore
        if (window.pdfjsLib) {
          pdfjsLib = window.pdfjsLib;
          window.removeEventListener('pdfjsLibReady', handleReady);
          resolve(pdfjsLib);
        }
      };
      window.addEventListener('pdfjsLibReady', handleReady);
      setTimeout(() => {
        window.removeEventListener('pdfjsLibReady', handleReady);
        if (!pdfjsLib) {
          reject(new Error('Timeout waiting for pdfjs-dist'));
        }
      }, 10000);
      return;
    }

    let isResolved = false;
    
    // 创建 script 标签加载模块
    const script = document.createElement('script');
    script.type = 'module';
    script.setAttribute('data-pdfjs-loader', 'true');
    script.textContent = `
      import * as pdfjsLib from 'https://unpkg.com/pdfjs-dist@5.4.449/build/pdf.mjs';
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.449/build/pdf.worker.min.mjs';
      window.pdfjsLib = pdfjsLib;
      window.pdfjsLibReady = true;
      window.dispatchEvent(new CustomEvent('pdfjsLibReady'));
    `;
    
    script.onerror = (error) => {
      if (!isResolved) {
        isResolved = true;
        script.remove();
        reject(new Error('Failed to load pdfjs-dist from CDN'));
      }
    };
    
    // 监听加载完成事件
    const handleReady = () => {
      if (isResolved) return;
      // @ts-ignore
      if (window.pdfjsLib) {
        isResolved = true;
        pdfjsLib = window.pdfjsLib;
        window.removeEventListener('pdfjsLibReady', handleReady);
        clearTimeout(timeout);
        script.remove();
        resolve(pdfjsLib);
      }
    };
    window.addEventListener('pdfjsLibReady', handleReady);
    
    // 超时处理
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        window.removeEventListener('pdfjsLibReady', handleReady);
        script.remove();
        reject(new Error('Timeout loading pdfjs-dist from CDN'));
      }
    }, 15000);
    
    document.head.appendChild(script);
  });
}

/**
 * Wrapper for pdfjsLib.getDocument that adds the required wasmUrl configuration.
 * Use this instead of calling pdfjsLib.getDocument directly.
 * 完全按照 bentopdf-main/src/js/utils/helpers.ts 的实现
 * @param src The source to load (url string, typed array, or parameters object)
 * @returns The PDF loading task
 */
export async function getPDFDocument(src: any) {
  // 确保 pdfjs-dist 已初始化
  const lib = await initPdfJs();
  
  let params = src;

  // Handle different input types similar to how getDocument handles them, 
  // but we ensure we have an object to attach wasmUrl to.
  if (typeof src === 'string') {
    params = { url: src };
  } else if (src instanceof Uint8Array || src instanceof ArrayBuffer) {
    params = { data: src };
  }

  // Ensure params is an object
  if (typeof params !== 'object' || params === null) {
    params = {};
  }

  // Add wasmUrl pointing to CDN (Next.js 中不能使用本地路径)
  // This is required for PDF.js v5+ to load OpenJPEG for certain images
  // wasmUrl 必须是一个目录路径（以斜杠结尾），而不是文件路径
  return lib.getDocument({
    ...params,
    wasmUrl: 'https://unpkg.com/pdfjs-dist@5.4.449/build/',
  });
}

/**
 * 读取文件为 ArrayBuffer
 * 按照 bentopdf-main 的实现方式
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

