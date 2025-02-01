"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Type,
  History,
  Quote,
  UnfoldHorizontal,
  Copy,
  CircleCheck,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TextFormatter = () => {
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSymbols, setRecentSymbols] = useState([]);
  const [panguLoaded, setPanguLoaded] = useState(false);

  // 載入 pangu.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pangu/4.0.7/pangu.min.js";
    script.async = true;
    script.onload = () => {
      setPanguLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 處理中英文間距
  const handlePangu = () => {
    if (window.pangu && text) {
      const spacedText = window.pangu.spacing(text);
      setText(spacedText);
    }
  };

  // 引號設定
  const quotes = [
    { symbol: "「」", name: "單引號" },
    { symbol: "『』", name: "雙引號" },
    { symbol: "（）", name: "圓括號" },
    { symbol: "《》", name: "書名號" },
    { symbol: "〈〉", name: "篇名號" },
    { symbol: "【】", name: "方括號" },
  ];

  // 符號資料結構，包含標籤
  const symbolsData = {
    標點符號: [
      { symbol: "，", tags: ["逗號", "暫停", "分隔"] },
      { symbol: "。", tags: ["句號", "結束", "停頓"] },
      { symbol: "、", tags: ["頓號", "並列"] },
      { symbol: "！", tags: ["驚嘆號", "感嘆號", "強調"] },
      { symbol: "？", tags: ["問號", "疑問"] },
      { symbol: "：", tags: ["冒號", "解釋"] },
      { symbol: "；", tags: ["分號"] },
      { symbol: "「", tags: ["引號", "對話", "引用"] },
      { symbol: "」", tags: ["引號", "對話", "引用"] },
      { symbol: "『", tags: ["雙引號", "引用"] },
      { symbol: "』", tags: ["雙引號", "引用"] },
      { symbol: "（", tags: ["括號", "補充"] },
      { symbol: "）", tags: ["括號", "補充"] },
      { symbol: "【", tags: ["方括號", "標題"] },
      { symbol: "】", tags: ["方括號", "標題"] },
    ],
    裝飾符號: [
      { symbol: "★", tags: ["星星", "實心星", "強調"] },
      { symbol: "☆", tags: ["星星", "空心星"] },
      { symbol: "♥", tags: ["愛心", "實心", "喜歡"] },
      { symbol: "♡", tags: ["愛心", "空心", "喜歡"] },
      { symbol: "♪", tags: ["音符", "音樂"] },
      { symbol: "♫", tags: ["音符", "音樂"] },
      { symbol: "✿", tags: ["花", "裝飾"] },
      { symbol: "❀", tags: ["花", "裝飾"] },
    ],
    箭頭符號: [
      { symbol: "→", tags: ["箭頭", "右箭頭", "指向"] },
      { symbol: "←", tags: ["箭頭", "左箭頭", "返回"] },
      { symbol: "↑", tags: ["箭頭", "上箭頭", "上升"] },
      { symbol: "↓", tags: ["箭頭", "下箭頭", "下降"] },
      { symbol: "↗", tags: ["箭頭", "右上箭頭"] },
      { symbol: "↙", tags: ["箭頭", "左下箭頭"] },
    ],
    數學符號: [
      { symbol: "＋", tags: ["加號", "加法", "正"] },
      { symbol: "－", tags: ["減號", "減法", "負"] },
      { symbol: "×", tags: ["乘號", "乘法"] },
      { symbol: "÷", tags: ["除號", "除法"] },
      { symbol: "＝", tags: ["等號"] },
      { symbol: "≠", tags: ["不等號"] },
      { symbol: "∞", tags: ["無限", "永遠"] },
    ],
  };

  // 尋找符號的完整資訊
  const findSymbolInfo = (symbol) => {
    for (const category in symbolsData) {
      const found = symbolsData[category].find(
        (item) => item.symbol === symbol
      );
      if (found) return found;
    }
    return { symbol, tags: [] };
  };

  // 在指定位置插入符號並更新最近使用記錄
  const insertSymbol = (symbol) => {
    const textArea = document.querySelector("textarea");
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const textBefore = text.substring(0, start);
    const textAfter = text.substring(end);

    const newText = textBefore + symbol + textAfter;
    setText(newText);

    // 更新光標位置
    const newPosition = start + symbol.length;
    textArea.setSelectionRange(newPosition, newPosition);

    // 更新最近使用記錄
    setRecentSymbols((prev) => {
      const symbolInfo = findSymbolInfo(symbol);
      const newRecent = [
        symbolInfo,
        ...prev.filter((item) => item.symbol !== symbol),
      ].slice(0, 20);
      return newRecent;
    });
  };

  // 插入成對引號並將游標置於中間
  const insertQuote = (quote) => {
    const textArea = document.querySelector("textarea");
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const textBefore = text.substring(0, start);
    const textAfter = text.substring(end);
    const selectedText = text.substring(start, end);

    // 取得左右引號
    const leftQuote = quote.symbol.charAt(0);
    const rightQuote = quote.symbol.charAt(1);

    // 組合新文字
    const newText =
      textBefore + leftQuote + selectedText + rightQuote + textAfter;
    setText(newText);

    // 設置游標位置到引號中間
    const newPosition =
      selectedText.length > 0
        ? start + leftQuote.length + selectedText.length // 如果有選取文字，游標放在選取文字後
        : start + leftQuote.length; // 如果沒有選取文字，游標放在引號中間

    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // 搜尋符號
  const filteredSymbols = useMemo(() => {
    if (!searchQuery) return symbolsData;

    const searchLower = searchQuery.toLowerCase();
    const filtered = {};

    Object.entries(symbolsData).forEach(([category, symbols]) => {
      const matchedSymbols = symbols.filter(
        (item) =>
          item.symbol.includes(searchQuery) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );

      if (matchedSymbols.length > 0) {
        filtered[category] = matchedSymbols;
      }
    });

    return filtered;
  }, [searchQuery]);

  // 刪除文字
  const clearText = () => {
    setText("");
  };

  // 複製文字
  const [copyStatus, setCopyStatus] = useState(false);
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 1000);
    } catch (err) {
      console.error("複製失敗:", err);
    }
  };

  // 符號按鈕
  const SymbolButton = ({ item }) => (
    <div className="relative group">
      <Button
        onClick={() => insertSymbol(item.symbol)}
        variant="outline"
        size="sm"
        className="h-10 w-10 flex items-center justify-center"
      >
        {item.symbol}
      </Button>
      {/* 標籤提示 */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        {/* {item.tags.join(", ")} */}
        {item.tags[0]}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center pt-10 min-h-screen">
      <Card className="w-full max-w-4xl">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* 文字輸入區域 */}
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="在這裡輸入或編輯文字..."
              className="w-full h-40 p-2"
            />

            {/* 功能按鈕 */}
            <div className="flex justify-between">
              <div className="flex gap-2">
                {/* 刪除按鈕 */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      刪除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>確定要刪除文字嗎？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作將刪除所有已輸入的文字內容，且無法復原。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={clearText}
                      >
                        刪除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex gap-2">
                {/* 符號選擇按鈕 */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Type className="h-5 w-5 mr-1" />
                      插入符號
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-80 max-h-96 overflow-y-auto overflow-x-hidden p-0"
                    align="start"
                  >
                    {/* 搜尋框 */}
                    <div className="sticky top-0 left-0 bg-background p-4 border-b z-10">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="搜尋符號或標籤..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="p-4">
                      {/* 最近使用的符號 */}
                      {recentSymbols.length > 0 && !searchQuery && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold mb-2 flex items-center">
                            <History className="h-4 w-4 mr-1" />
                            最近使用
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {recentSymbols.map((item, index) => (
                              <SymbolButton
                                key={`${item.symbol}-${index}`}
                                item={item}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 符號按鈕組 */}
                      {Object.entries(filteredSymbols).map(
                        ([category, symbols]) => (
                          <div key={category} className="mb-4">
                            <h3 className="text-sm font-semibold mb-2">
                              {category}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {symbols.map((item) => (
                                <SymbolButton key={item.symbol} item={item} />
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* 引號選擇按鈕 */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Quote className="h-5 w-5 mr-1" />
                      插入引號
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-80 max-h-96 overflow-y-auto overflow-x-hidden p-4"
                    align="start"
                  >
                    <div className="flex flex-col gap-2">
                      {quotes.map((quote) => (
                        <Button
                          key={quote.symbol}
                          variant="outline"
                          onClick={() => insertQuote(quote)}
                          className="justify-start"
                        >
                          <span className="mr-1">{quote.symbol}</span>
                          {quote.name}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={handlePangu}
                  variant="outline"
                  disabled={!panguLoaded || !text}
                  className="flex items-center"
                >
                  <UnfoldHorizontal className="h-5 w-5 mr-1" />
                  中英間距
                </Button>

                <Button
                  onClick={copyText}
                  variant="outline"
                  disabled={copyStatus || !text}
                >
                  {copyStatus ? (
                    <CircleCheck className="h-5 w-5 mr-1" />
                  ) : (
                    <Copy className="h-5 w-5 mr-1" />
                  )}
                  {copyStatus ? "成功" : "複製"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextFormatter;
