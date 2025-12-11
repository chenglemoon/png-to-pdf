"use client";

import { useEffect } from 'react';

/**
 * 全局警告过滤器组件
 * 用于过滤来自第三方库（如 react-filerobot-image-editor）的已知警告
 */
export default function ConsoleWarningFilter() {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    // 保存原始的 console 方法
    const originalWarn = console.warn;
    const originalError = console.error;

    // 过滤函数 - 检查是否应该过滤这个警告
    const shouldFilter = (args: any[]): boolean => {
      const firstArg = args[0];
      const allArgsString = args.map(arg => 
        typeof arg === 'string' ? arg : 
        typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : 
        String(arg)
      ).join(' ').toLowerCase();
      
      // 过滤 react-filerobot-image-editor 相关的警告
      const filterPatterns = [
        // React 属性警告
        'received `false` for a non-boolean attribute `active`',
        'react does not recognize the',
        'non-boolean attribute',
        // styled-components 警告
        'styled-components: it looks like an unknown prop',
        'is being sent through to the dom',
        'shouldforwardprop',
        'transient props',
        // 特定的 prop 名称
        'showtabsdrawer',
        'isphonescreen',
        'nomargin',
        'showbackbutton',
        'haschildren',
        'isaccordion',
        'margin',
        'active',
        // antd 兼容性警告
        'antd: compatible',
        'antd v5 support react is 16 ~ 18',
        'v5-for-19',
      ];

      // 检查是否匹配任何过滤模式
      for (const pattern of filterPatterns) {
        if (allArgsString.includes(pattern)) {
          return true;
        }
      }

      // 检查第一个参数是否是字符串且包含相关警告
      if (typeof firstArg === 'string') {
        const lowerFirstArg = firstArg.toLowerCase();
        for (const pattern of filterPatterns) {
          if (lowerFirstArg.includes(pattern)) {
            return true;
          }
        }
      }

      return false;
    };

    // 重写 console.warn
    console.warn = (...args: any[]) => {
      if (!shouldFilter(args)) {
        try {
          originalWarn.apply(console, args);
        } catch (e) {
          // Fallback if apply fails
          originalWarn(...args);
        }
      }
    };

    // 重写 console.error
    console.error = (...args: any[]) => {
      if (!shouldFilter(args)) {
        try {
          originalError.apply(console, args);
        } catch (e) {
          // Fallback if apply fails
          originalError(...args);
        }
      }
    };

    // 清理函数
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null;
}

