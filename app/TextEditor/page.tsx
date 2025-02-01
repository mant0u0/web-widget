"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  ChangeEvent,
} from "react";
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
  ListOrdered,
  Undo,
  Trash,
  Languages,
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
  const [text, setText] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [recentSymbols, setRecentSymbols] = useState([]);

  const [panguLoaded, setPanguLoaded] = useState(false);

  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // 首行加入符號功能：設定是否包含空行
  const [includeEmptyLines, setIncludeEmptyLines] = useState(false);

  // 簡轉繁轉換功能
  const [isConverting, setIsConverting] = useState(false);

  // ================================================

  // 更新文字並記錄歷史
  const updateText = useCallback(
    (newText: string) => {
      setText(newText);
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newText);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    },
    [history, currentIndex]
  );

  // 處理文字變更
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateText(e.target.value);
  };

  // 還原功能
  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setText(history[currentIndex - 1]);
    }
  };

  // ================================================

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
      // 更新文字
      updateText(spacedText);
    }
  };

  // ================================================

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
      { symbol: "「", tags: ["上引號", "引號", "對話", "引用"] },
      { symbol: "」", tags: ["下引號", "引號", "對話", "引用"] },
      { symbol: "『", tags: ["上雙引號", "雙引號", "引用"] },
      { symbol: "』", tags: ["下雙引號", "引用"] },
      { symbol: "（", tags: ["左括號", "括號", "補充"] },
      { symbol: "）", tags: ["右括號", "括號", "補充"] },
      { symbol: "【", tags: ["左括號", "方括號", "標題"] },
      { symbol: "】", tags: ["右括號", "方括號", "標題"] },
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

  const emojisData = {
    表情符號: [
      { symbol: "😀", tags: ["開心", "笑臉"] },
      { symbol: "😂", tags: ["笑到爆", "笑臉"] },
      { symbol: "😍", tags: ["愛", "笑臉"] },
    ],
    食物符號: [
      { symbol: "🍇", tags: ["葡萄", "水果"] },
      { symbol: "🍉", tags: ["草莓", "水果"] },
      { symbol: "🍊", tags: ["柳橙", "水果"] },
      { symbol: "🍋", tags: ["橙子", "水果"] },
      { symbol: "🍌", tags: ["香蕉", "水果"] },
    ],
  };

  // ================================================

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
    const newPosition = start + symbol.length;

    // setText(newText);
    updateText(newText);

    // 使用 setTimeout 確保在狀態更新後設置游標位置
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(newPosition, newPosition);
    }, 0);

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
    // setText(newText);
    updateText(newText);

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

  // 一般符號
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
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-2 pointer-events-none">
        {item.tags[0]}
      </div>
    </div>
  );

  // 刪除文字
  const clearText = () => {
    // setText("");
    updateText("");
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

  // ================================================

  // 行首符號設定
  const prefixSymbols = [
    { symbol: "　", name: "全形空格" },
    { symbol: " ", name: "半形空格" },
    { symbol: "- ", name: "短橫線" },
    { symbol: "• ", name: "圓點" },
    { symbol: "1. ", name: "數字列表" },
    { symbol: "01. ", name: "二位數字列表" },
    { symbol: "①", name: "圓圈數字" },
  ];

  // 圓圈數字陣列
  const circleNumbers = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

  // 在選取的行首插入符號
  const insertPrefix = useCallback(
    (prefix) => {
      const textarea = document.querySelector("textarea");
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // 找出游標所在行或選取的行範圍
      let startLine, endLine;

      // 如果沒有選取文字，處理游標所在行
      if (start === end) {
        startLine = text.lastIndexOf("\n", start - 1) + 1;
        if (startLine === -1) startLine = 0;
        endLine = text.indexOf("\n", start);
        if (endLine === -1) endLine = text.length;
      }
      // 如果有選取文字，處理選取範圍
      else {
        startLine = text.lastIndexOf("\n", start - 1) + 1;
        if (startLine === -1) startLine = 0;
        endLine = text.indexOf("\n", end);
        if (endLine === -1) endLine = text.length;
      }

      const beforeSelection = text.substring(0, startLine);
      const afterSelection = text.substring(endLine);

      // 處理選取的行
      const selectedLines = text.substring(startLine, endLine).split("\n");

      // 為每行加入前綴
      let newLines;
      let currentNumber = 1; // 追踪當前序號

      // 數字列表特殊處理
      if (prefix === "1. ") {
        newLines = selectedLines.map((line) => {
          // 根據 includeEmptyLines 決定是否處理空行
          if (!line.trim() && !includeEmptyLines) return line;
          const numberedLine = `${currentNumber}. ${line}`;
          currentNumber++;
          return numberedLine;
        });
      } else if (prefix === "01. ") {
        newLines = selectedLines.map((line) => {
          if (!line.trim() && !includeEmptyLines) return line;
          const numberedLine = `${String(currentNumber).padStart(
            2,
            "0"
          )}. ${line}`;
          currentNumber++;
          return numberedLine;
        });
      }
      // 圓圈數字特殊處理
      else if (prefix === "①") {
        newLines = selectedLines.map((line) => {
          if (!line.trim() && !includeEmptyLines) return line;
          const circleNumber =
            currentNumber <= circleNumbers.length
              ? circleNumbers[currentNumber - 1]
              : `${currentNumber}.`;
          currentNumber++;
          return `${circleNumber} ${line}`;
        });
      }
      // 其他符號直接加入
      else {
        newLines = selectedLines.map((line) =>
          !line.trim() && !includeEmptyLines ? line : `${prefix}${line}`
        );
      }

      // 組合新文字
      const newText = beforeSelection + newLines.join("\n") + afterSelection;
      updateText(newText);

      // 更新選取範圍
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(startLine, endLine);
      }, 0);
    },
    [text, updateText, includeEmptyLines] // 加入 includeEmptyLines 作為依賴
  );

  // ================================================

  // 簡轉繁功能
  const convertToTraditional = async () => {
    if (!text.trim() || isConverting) return;

    setIsConverting(true);
    try {
      const response = await fetch("https://api.zhconvert.org/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          converter: "Taiwan",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // setText(data.data?.text || text);
        updateText(data.data?.text || text);
      } else {
        console.error("轉換失敗");
      }
    } catch (error) {
      console.error("轉換出錯:", error);
    } finally {
      setIsConverting(false);
    }
  };

  // ================================================

  return (
    <div className="flex flex-col items-center pt-10 min-h-screen">
      <Card className="w-full max-w-4xl flex p-4 gap-4">
        <div className="w-[20%]">
          {/* 主功能按鈕 */}
          <div className="flex flex-col gap-2">
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

            {/* emoji 選擇按鈕 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Type className="h-5 w-5 mr-1" />
                  Emoji
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
                <div className="grid grid-cols-2 gap-2">
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

            {/* 行首插入按鈕 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <ListOrdered className="h-5 w-5 mr-1" />
                  行首插入
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-84 max-h-96 overflow-y-auto overflow-x-hidden p-4"
                align="start"
              >
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="col-span-2"
                    onClick={() => setIncludeEmptyLines(!includeEmptyLines)}
                  >
                    {includeEmptyLines ? "包含空白行" : "不包含空白行"}
                  </Button>
                  {prefixSymbols.map((item) => (
                    <Button
                      key={item.symbol}
                      variant="outline"
                      onClick={() => insertPrefix(item.symbol)}
                      className="justify-start"
                    >
                      <span className="mr-2 w-4 text-center">
                        {item.symbol}
                      </span>
                      {item.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* 中英間距按鈕 */}
            <Button
              onClick={handlePangu}
              variant="outline"
              disabled={!panguLoaded || !text}
              className="flex items-center"
            >
              <UnfoldHorizontal className="h-5 w-5 mr-1" />
              中英間距
            </Button>

            {/* 簡轉繁按鈕 */}
            <Button
              onClick={convertToTraditional}
              variant="outline"
              disabled={isConverting || !text.trim()}
            >
              <Languages className="h-5 w-5 mr-1" />
              {isConverting ? "轉換中..." : "簡轉繁體"}
            </Button>
          </div>
        </div>
        <div className="w-full">
          <div className="space-y-2">
            {/* 文字輸入區域 */}
            <Textarea
              value={text}
              onChange={handleTextChange}
              placeholder="在這裡輸入或編輯文字..."
              className="w-full h-80 p-2"
            />

            {/* 其他功能按鈕 */}
            <div className="flex justify-between">
              <div className="flex gap-2">
                {/* 刪除按鈕 */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash className="h-5 w-5 mr-1" />
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
                {/* 還原按鈕 */}
                <Button
                  variant="outline"
                  onClick={handleUndo}
                  disabled={currentIndex <= 0}
                  className="flex items-center"
                >
                  <Undo className="h-5 w-5 mr-1" />
                  還原
                </Button>

                {/* 複製按鈕 */}
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
        </div>
      </Card>
    </div>
  );
};

export default TextFormatter;
