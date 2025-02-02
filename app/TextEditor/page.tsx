"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  ChangeEvent,
} from "react";
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
  Smile,
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

// 定義單個符號項目的接口
interface SymbolItem {
  symbol: string;
  tags: string[];
}

// 定義 item 的類型
type SymbolItem = {
  symbol: string;
  tags: string[];
};

// 共用的符號選擇器組件
const SymbolPicker = ({
  data,
  searchQuery,
  onSearchChange,
  recentItems,
  onSymbolSelect,
  placeholder,
}: {
  data: {
    [category: string]: {
      categoryTags: string[];
      items: {
        symbol: string;
        tags: string[];
      }[];
    };
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recentItems: {
    symbol: string;
    tags: string[];
  }[];
  onSymbolSelect: (item: { symbol: string; tags: string[] }) => void;
  placeholder: string;
}) => {
  // 過濾符號
  const filteredItems = useMemo(() => {
    if (!searchQuery) return data;

    const searchLower = searchQuery.toLowerCase();
    const filtered: {
      [category: string]: {
        categoryTags: string[];
        items: {
          symbol: string;
          tags: string[];
        }[];
      };
    } = {};

    Object.entries(data).forEach(([category, { categoryTags, items }]) => {
      // 檢查分類標籤是否匹配
      const categoryMatches = categoryTags.some((tag) =>
        tag.toLowerCase().includes(searchLower)
      );

      // 檢查項目是否匹配
      const matchedItems = items.filter(
        (item) =>
          item.symbol.includes(searchQuery) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );

      // 如果分類標籤匹配或有匹配的項目，則加入結果中
      if (categoryMatches || matchedItems.length > 0) {
        filtered[category] = {
          categoryTags,
          items: categoryMatches ? items : matchedItems,
        };
      }
    });

    return filtered;
  }, [searchQuery, data]);

  // 為 SymbolButton 添加類型
  interface SymbolButtonProps {
    item: SymbolItem;
  }

  // 符號按鈕組件
  const SymbolButton: React.FC<SymbolButtonProps> = ({ item }) => (
    <div className="relative group">
      <Button
        onClick={() => onSymbolSelect(item)}
        variant="outline"
        size="sm"
        // className="h-10 w-10 flex items-center justify-center"
        className="h-10 flex items-center justify-center"
      >
        {item.symbol}
      </Button>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-2 pointer-events-none">
        {item.tags[0]}
      </div>
    </div>
  );

  return (
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
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="p-4">
        {/* 最近使用項目 */}
        {recentItems.length > 0 && !searchQuery && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center">
              <History className="h-4 w-4 mr-1" />
              最近使用
            </h3>
            <div className="flex flex-wrap gap-1">
              {recentItems.map((item, index) => (
                <SymbolButton key={`${item.symbol}-${index}`} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* 符號列表 */}
        {Object.entries(filteredItems).map(([category, { items }]) => (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              {category}
            </h3>
            <div className="flex flex-wrap gap-1">
              {items.map((item) => (
                <SymbolButton key={item.symbol} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </PopoverContent>
  );
};

const TextFormatter = () => {
  // 基本狀態、歷史功能
  const [text, setText] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // 搜尋和取代狀態
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  // 符號搜尋狀態
  const [symbolSearchQuery, setSymbolSearchQuery] = useState("");
  const [emojiSearchQuery, setEmojiSearchQuery] = useState("");
  const [kaomojiSearchQuery, setKaomojiSearchQuery] = useState("");

  // 符號最近使用記錄
  const [recentSymbols, setRecentSymbols] = useState<SymbolItem[]>([]);
  const [recentEmojis, setRecentEmojis] = useState<SymbolItem[]>([]);
  const [recentKaomojis, setRecentKaomojis] = useState<SymbolItem[]>([]);

  // 符號 Popover 開關狀態
  const [symbolPopoverOpen, setSymbolPopoverOpen] = useState(false);
  const [emojiPopoverOpen, setEmojiPopoverOpen] = useState(false);
  const [kaomojiPopoverOpen, setKaomojiPopoverOpen] = useState(false);

  // 載入 Pangu.js
  const [panguLoaded, setPanguLoaded] = useState(false);

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

  // 搜尋功能
  const handleSearch = () => {
    if (!searchText) return;

    // 計算匹配次數
    const regex = new RegExp(searchText, "g");
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    setMatchCount(count);

    // 重置當前匹配索引
    setCurrentMatchIndex(count > 0 ? 0 : -1);

    // 如果有匹配項，選中第一個
    if (count > 0) {
      const firstMatch = text.indexOf(searchText);
      const textArea = document.querySelector("textarea");
      textArea?.setSelectionRange(firstMatch, firstMatch + searchText.length);
      textArea?.focus();
    }
  };

  // 尋找下一個
  const findNext = () => {
    if (!searchText || matchCount === 0) return;

    const nextIndex = (currentMatchIndex + 1) % matchCount;
    const textArea = document.querySelector("textarea");

    let searchIndex = 0;
    let currentMatch = 0;
    const regex = new RegExp(searchText, "g");

    while (currentMatch <= nextIndex) {
      const match = regex.exec(text);
      if (!match) break;
      if (currentMatch === nextIndex) {
        searchIndex = match.index;
        break;
      }
      currentMatch++;
    }

    textArea?.setSelectionRange(searchIndex, searchIndex + searchText.length);
    textArea?.focus();
    setCurrentMatchIndex(nextIndex);
  };

  // 尋找上一個
  const findPrevious = () => {
    if (!searchText || matchCount === 0) return;

    const prevIndex = (currentMatchIndex - 1 + matchCount) % matchCount;
    const textArea = document.querySelector("textarea");

    let searchIndex = 0;
    let currentMatch = 0;
    const regex = new RegExp(searchText, "g");

    while (currentMatch <= prevIndex) {
      const match = regex.exec(text);
      if (!match) break;
      if (currentMatch === prevIndex) {
        searchIndex = match.index;
        break;
      }
      currentMatch++;
    }

    textArea?.setSelectionRange(searchIndex, searchIndex + searchText.length);
    textArea?.focus();
    setCurrentMatchIndex(prevIndex);
  };

  // 取代當前選中的文字
  const replaceCurrent = () => {
    if (!searchText || matchCount === 0) return;

    const textArea = document.querySelector("textarea");
    const start = textArea?.selectionStart;
    const end = textArea?.selectionEnd;

    if (start === undefined || end === undefined) return;

    // 確保選中的文字是搜尋的文字
    const selectedText = text.substring(start, end);
    if (selectedText !== searchText) return;

    const newText =
      text.substring(0, start) + replaceText + text.substring(end);
    updateText(newText);

    // 更新匹配計數
    setMatchCount(matchCount - 1);
    if (matchCount <= 1) {
      setCurrentMatchIndex(-1);
    }
  };

  // 全部取代
  const replaceAll = () => {
    if (!searchText) return;

    const newText = text.replaceAll(searchText, replaceText);
    updateText(newText);
    setMatchCount(0);
    setCurrentMatchIndex(-1);
  };

  // ================================================

  // 字符數計算
  const characterCount = useMemo(() => text.length, [text]);

  // 行數計算
  const lineCount = useMemo(() => text.split("\n").length, [text]);

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
    // @ts-expect-error pangu is injected globally
    if (window.pangu && text) {
      // @ts-expect-error pangu is injected globally
      const spacedText = window.pangu.spacing(text);
      // 更新文字
      updateText(spacedText);
    }
  };

  // ================================================

  // 符號資料
  const symbolsData = {
    標點符號: {
      categoryTags: ["標點", "符號"],
      items: [
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
    },
    裝飾符號: {
      categoryTags: ["裝飾", "符號"],
      items: [
        { symbol: "★", tags: ["星星", "實心星", "強調"] },
        { symbol: "☆", tags: ["星星", "空心星"] },
        { symbol: "♥", tags: ["愛心", "實心", "喜歡"] },
        { symbol: "♡", tags: ["愛心", "空心", "喜歡"] },
        { symbol: "♪", tags: ["音符", "音樂"] },
        { symbol: "♫", tags: ["音符", "音樂"] },
        { symbol: "✿", tags: ["花", "裝飾"] },
        { symbol: "❀", tags: ["花", "裝飾"] },
      ],
    },
  };

  const emojiData = {
    表情符號: {
      categoryTags: ["表情", "臉部", "emotions"],
      items: [
        { symbol: "😀", tags: ["開心", "笑臉"] },
        { symbol: "😂", tags: ["笑到爆", "笑臉"] },
        { symbol: "😍", tags: ["愛", "笑臉"] },
      ],
    },
    食物符號: {
      categoryTags: ["食物", "吃的", "food"],
      items: [
        { symbol: "🍇", tags: ["葡萄", "水果"] },
        { symbol: "🍉", tags: ["草莓", "水果"] },
        { symbol: "🍊", tags: ["柳橙", "水果"] },
        { symbol: "🍋", tags: ["橙子", "水果"] },
        { symbol: "🍌", tags: ["香蕉", "水果"] },
      ],
    },
  };

  const kaomojiData = {
    人物符號: {
      categoryTags: ["一般"],
      items: [
        { symbol: "⸜(*ˊᗜˋ*)⸝", tags: ["好耶"] },
        { symbol: "( ´•̥̥̥ω•̥̥̥` )", tags: ["哭"] },
        { symbol: "( ¯•ω•¯ )", tags: ["盯"] },
      ],
    },
  };

  // 插入符號
  const insertSymbol = (
    item: SymbolItem,
    model: "Symbol" | "Emoji" | "Kaomoji" = "Symbol"
  ) => {
    const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
    if (!textArea) return; // 如果找不到 textarea 就提早返回

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const textBefore = text.substring(0, start);
    const textAfter = text.substring(end);

    const newText = textBefore + item.symbol + textAfter;
    const newPosition = start + item.symbol.length;

    updateText(newText);

    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(newPosition, newPosition);
    }, 0);

    // 更新最近使用記錄
    if (model === "Emoji") {
      setRecentEmojis((prev: SymbolItem[]) => {
        if (prev.find((prevItem) => prevItem.symbol === item.symbol)) {
          return prev;
        }
        return [item, ...prev].slice(0, 20);
      });
    } else if (model === "Symbol") {
      setRecentSymbols((prev: SymbolItem[]) => {
        if (prev.find((prevItem) => prevItem.symbol === item.symbol)) {
          return prev;
        }
        return [item, ...prev].slice(0, 20);
      });
    } else if (model === "Kaomoji") {
      setRecentKaomojis((prev: SymbolItem[]) => {
        if (prev.find((prevItem) => prevItem.symbol === item.symbol)) {
          return prev;
        }
        return [item, ...prev].slice(0, 20);
      });
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
  // ================================================

  // 刪除文字
  const clearText = () => {
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
  const circleNumbers = useMemo(
    () => ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"],
    []
  );

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
    [text, updateText, includeEmptyLines, circleNumbers]
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
    <div className="flex min-h-screen w-full p-4 gap-4 border ">
      <div className="w-[20%] min-w-30">
        {/* 主功能按鈕 */}
        <div className="flex flex-col gap-2">
          {/* 符號選擇按鈕 */}
          <Popover open={symbolPopoverOpen} onOpenChange={setSymbolPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setSymbolPopoverOpen(true)}
              >
                <Type className="h-5 w-5 mr-1" />
                插入符號
              </Button>
            </PopoverTrigger>
            <SymbolPicker
              data={symbolsData}
              searchQuery={symbolSearchQuery}
              onSearchChange={setSymbolSearchQuery}
              recentItems={recentSymbols}
              onSymbolSelect={(item) => insertSymbol(item, "Symbol")}
              placeholder="搜尋符號或標籤..."
            />
          </Popover>

          {/* Emoji 選擇按鈕 */}
          <Popover open={emojiPopoverOpen} onOpenChange={setEmojiPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setEmojiPopoverOpen(true)}
              >
                <Smile className="h-5 w-5 mr-1" />
                插入 Emoji
              </Button>
            </PopoverTrigger>
            <SymbolPicker
              data={emojiData}
              searchQuery={emojiSearchQuery}
              onSearchChange={setEmojiSearchQuery}
              recentItems={recentEmojis}
              onSymbolSelect={(item) => insertSymbol(item, "Emoji")}
              placeholder="搜尋 Emoji 或標籤..."
            />
          </Popover>

          {/* 顏文字選擇按鈕 */}
          <Popover
            open={kaomojiPopoverOpen}
            onOpenChange={setKaomojiPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setKaomojiPopoverOpen(true)}
              >
                <Smile className="h-5 w-5 mr-1" />
                插入顏文字
              </Button>
            </PopoverTrigger>
            <SymbolPicker
              data={kaomojiData}
              searchQuery={kaomojiSearchQuery}
              onSearchChange={setKaomojiSearchQuery}
              recentItems={recentKaomojis}
              onSymbolSelect={(item) => insertSymbol(item, "Kaomoji")}
              placeholder="搜尋 顏文字 或標籤..."
            />
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
                    <span className="mr-2 w-4 text-center">{item.symbol}</span>
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

          <div className="w-full flex flex-col gap-4 pt-10">
            {/* 搜尋輸入框 */}
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                className="bg-white"
                placeholder="搜尋..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Input
                type="text"
                className="bg-white"
                placeholder="取代為..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
            </div>

            {/* 控制按鈕 */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSearch}
                >
                  搜尋
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={findPrevious}
                  disabled={matchCount === 0}
                >
                  上一個
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={findNext}
                  disabled={matchCount === 0}
                >
                  下一個
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={replaceCurrent}
                  disabled={matchCount === 0}
                >
                  取代
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={matchCount === 0}
                    >
                      全部取代
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>確定要全部取代嗎？</AlertDialogTitle>
                      <AlertDialogDescription>
                        將會替換文件中所有符合的文字，此操作無法復原。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={replaceAll}>
                        確定
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* 搜尋狀態顯示 */}
            {matchCount > 0 && (
              <div className="text-sm text-gray-500">
                找到 {matchCount} 個結果 ({currentMatchIndex + 1}/{matchCount})
              </div>
            )}

            {/* 字數統計 */}
            <div className="text-sm text-gray-500">
              目前總共 {characterCount} 個字，共 {lineCount} 行。
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col  gap-4">
        {/* 文字輸入區域 */}
        <div className=" h-full">
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder="在這裡輸入或編輯文字..."
            className="w-full h-full p-2 bg-white resize-none min-h-full"
          />
        </div>

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
  );
};

export default TextFormatter;
