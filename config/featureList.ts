import { z } from "zod";

export type FunctionMapping = {
  model: string;
  name: string;
  description: string;
  schema: z.ZodObject<any, "strip", z.ZodTypeAny, { [x: string]: any; }, { [x: string]: any; }>;
  default_seed?: number;
  creditsCost: number;
};

export type FunctionMappings = Record<string, FunctionMapping>;

// 图片生成功能已移除，保留接口定义以防未来需要
export const featureList: FunctionMappings = {
  // 所有图片生成相关功能已被移除
  // 专注于屏幕工具和实用程序
};