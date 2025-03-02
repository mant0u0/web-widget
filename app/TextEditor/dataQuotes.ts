// 定義引號結構的介面
export interface Quote {
  symbol: string; // 引號符號
  name: string; // 引號名稱
  center: number; // 居中設定
  editable?: boolean; // 是否可編輯
}

// 定義插入引號的函數類型
export type InsertQuoteFunction = (quote: Quote) => void;

// 預設引號數據
export const defaultQuotes: Quote[] = [
  { symbol: "「」", name: "單引號", center: 1, editable: false },
  { symbol: "『』", name: "雙引號", center: 1, editable: false },
  { symbol: "（）", name: "全形圓括號", center: 1, editable: false },
  { symbol: "()", name: "半形圓括號", center: 1, editable: false },
  { symbol: "《》", name: "書名號", center: 1, editable: false },
  { symbol: "〈〉", name: "篇名號", center: 1, editable: false },
  { symbol: "【】", name: "方括號", center: 1, editable: false },
  { symbol: "{}", name: "大括號", center: 1, editable: false },
  { symbol: "[]", name: "中括號", center: 1, editable: false },
  { symbol: "｛｝", name: "全形大括號", center: 1, editable: false },
  { symbol: "［］", name: "全形中括號", center: 1, editable: false },
  { symbol: "{{}}", name: "雙重大括號", center: 2, editable: false },
  { symbol: "''", name: "單撇號", center: 1 },
  { symbol: "＇＇", name: "全形單撇號", center: 1 },
  { symbol: '""', name: "雙撇號", center: 1 },
  { symbol: "＂＂", name: "全形雙撇號", center: 1 },
  { symbol: '""', name: "左右雙撇號", center: 1 },
];
