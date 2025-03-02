// SearchReplace.tsx
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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

// 定義 props 的介面
interface SearchReplaceProps {
  text: string;
  updateText: (newText: string) => void;
}

// 搜尋結果項目的介面
interface SearchResultItem {
  position: number;
  context: string;
  beforeText: string;
  matchText: string;
  afterText: string;
}

// 檢查字符是否為 CJK 字符
const isCJK = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK 統一表意文字
    (code >= 0x3040 && code <= 0x309f) || // 平假名
    (code >= 0x30a0 && code <= 0x30ff) || // 片假名
    (code >= 0xac00 && code <= 0xd7af) || // 諺文音節
    (code >= 0xf900 && code <= 0xfaff) || // CJK 兼容表意文字
    (code >= 0xff00 && code <= 0xffef) // 全形字符
  );
};

// 計算 Twitter 字數
const countTwitterLength = (text: string): number => {
  return Array.from(text).reduce((count, char) => {
    return count + (isCJK(char) ? 2 : 1);
  }, 0);
};

export const SearchReplace: React.FC<SearchReplaceProps> = ({
  text,
  updateText,
}) => {
  // 搜尋功能相關狀態
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matchPositions, setMatchPositions] = useState<number[]>([]); // 儲存所有匹配位置
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]); // 儲存帶有上下文的搜尋結果

  // 尋找所有匹配位置並生成帶有上下文的結果
  const findAllMatches = (text: string, searchText: string) => {
    if (!searchText) return { positions: [], results: [] };

    const positions: number[] = [];
    const results: SearchResultItem[] = [];
    const regex = new RegExp(searchText, "g");
    let match;

    while ((match = regex.exec(text)) !== null) {
      positions.push(match.index);

      // 產生上下文（前後各15個字符）
      const contextStart = Math.max(0, match.index - 15);
      const contextEnd = Math.min(
        text.length,
        match.index + searchText.length + 15,
      );

      const beforeText = text.substring(contextStart, match.index);
      const matchText = text.substring(
        match.index,
        match.index + searchText.length,
      );
      const afterText = text.substring(
        match.index + searchText.length,
        contextEnd,
      );

      results.push({
        position: match.index,
        context: text.substring(contextStart, contextEnd),
        beforeText,
        matchText,
        afterText,
      });
    }

    return { positions, results };
  };

  // 搜尋功能
  const handleSearch = () => {
    if (!searchText) return;

    // 找到所有匹配位置和上下文
    const { positions, results } = findAllMatches(text, searchText);
    setMatchPositions(positions);
    setSearchResults(results);
    setMatchCount(positions.length);

    if (positions.length > 0) {
      // 如果當前已經有選中的項目，移動到下一個
      if (currentMatchIndex >= 0 && currentMatchIndex < positions.length - 1) {
        const nextIndex = currentMatchIndex + 1;
        setCurrentMatchIndex(nextIndex);
        selectMatch(positions[nextIndex]);
      } else {
        // 否則選中第一個或返回第一個
        setCurrentMatchIndex(0);
        selectMatch(positions[0]);
      }
    } else {
      setCurrentMatchIndex(-1);
    }
  };

  // 點擊搜尋結果項目
  const handleResultClick = (index: number) => {
    setCurrentMatchIndex(index);
    selectMatch(matchPositions[index]);
  };

  // 選中特定位置的文字
  const selectMatch = (position: number) => {
    const textArea = document.querySelector("textarea");
    if (textArea) {
      textArea.focus();
      textArea.setSelectionRange(position, position + searchText.length);
    }
  };

  // 取消選中並返回第一項
  const clearSelection = () => {
    const textArea = document.querySelector("textarea");
    if (textArea) {
      textArea.focus();
      textArea.setSelectionRange(
        textArea.selectionStart,
        textArea.selectionStart,
      );
    }
    if (matchPositions.length > 0) {
      setCurrentMatchIndex(0);
      selectMatch(matchPositions[0]);
    }
  };

  // 尋找下一個
  const findNext = () => {
    if (!searchText || matchCount === 0) return;

    const nextIndex = (currentMatchIndex + 1) % matchCount;
    setCurrentMatchIndex(nextIndex);
    selectMatch(matchPositions[nextIndex]);
  };

  // 尋找上一個
  const findPrevious = () => {
    if (!searchText || matchCount === 0) return;

    const prevIndex = (currentMatchIndex - 1 + matchCount) % matchCount;
    setCurrentMatchIndex(prevIndex);
    selectMatch(matchPositions[prevIndex]);
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

    // 更新匹配位置、搜尋結果和計數
    const { positions, results } = findAllMatches(newText, searchText);
    setMatchPositions(positions);
    setSearchResults(results);
    setMatchCount(positions.length);

    // 更新當前索引
    if (positions.length === 0) {
      setCurrentMatchIndex(-1);
    } else if (currentMatchIndex >= positions.length) {
      setCurrentMatchIndex(0);
      selectMatch(positions[0]);
    }
  };

  // 全部取代
  const replaceAll = () => {
    if (!searchText) return;

    const newText = text.replaceAll(searchText, replaceText);
    updateText(newText);
    setMatchCount(0);
    setCurrentMatchIndex(-1);
    setMatchPositions([]);
    setSearchResults([]);
  };
  // ================================================

  // 字符數計算
  const characterCount = useMemo(() => text.length, [text]);

  // 行數計算
  const lineCount = useMemo(() => text.split("\n").length, [text]);

  // 使用 useMemo 計算 Twitter 字數
  const twitterCount = useMemo(() => {
    const count = countTwitterLength(text);
    const remaining = 280 - count;
    return {
      count,
      remaining,
      isOverLimit: remaining < 0,
    };
  }, [text]);

  return (
    <div className="h-full w-full overflow-hidden pt-0">
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-xl border border-input bg-zinc-50">
        {/* 搜尋欄 */}
        <div className="border-b bg-background p-3">
          <div className="relative">
            {/* 搜尋輸入框 */}
            <div className="flex gap-2">
              <Input
                type="text"
                className="bg-white"
                placeholder="搜尋..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button className="flex-1" onClick={handleSearch}>
                搜尋
              </Button>
            </div>

            <div className="mt-2 flex gap-2">
              <Input
                type="text"
                className="bg-white"
                placeholder="取代為..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
              <Button
                variant="outline"
                className="flex-1"
                onClick={replaceCurrent}
                disabled={matchCount === 0}
              >
                取代
              </Button>
            </div>

            {/* 控制按鈕 */}
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex gap-2">
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
          </div>
        </div>

        <ScrollArea className="h-full overflow-y-auto overflow-x-hidden">
          <div className="flex h-full flex-col gap-2">
            {/* 搜尋狀態顯示 */}
            {matchCount > 0 && (
              <div className="sticky top-0 flex items-center justify-between bg-zinc-50 px-3 py-3 pt-3">
                <p className="text-sm font-semibold">搜尋結果</p>
                <div className="text-sm text-gray-500">
                  找到 {matchCount} 個結果 ({currentMatchIndex + 1}/{matchCount}
                  )
                </div>
              </div>
            )}

            {/* 搜尋結果列表 */}
            {searchResults.length > 0 && (
              <div className="divide-y">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer p-3 hover:bg-gray-100 ${
                      index === currentMatchIndex ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleResultClick(index)}
                  >
                    <div className="text-sm">
                      <span className="text-gray-500">{result.beforeText}</span>
                      <span className="bg-yellow-200 font-medium text-black">
                        {result.matchText}
                      </span>
                      <span className="text-gray-500">{result.afterText}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex flex-col gap-1 p-3">
          {/* 字數統計 */}
          <div className="text-sm text-gray-500">
            目前總共 {characterCount} 個字，共 {lineCount} 行。
          </div>

          {characterCount > 500 ? (
            <div className="text-sm text-red-500">
              Threads 文字上限 {characterCount} / 500 字，超過{" "}
              {characterCount - 500} 字。
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Threads 發文上限 {characterCount} / 500 字。
            </div>
          )}

          {twitterCount.count > 280 ? (
            <div className="text-sm text-red-500">
              Twitter 發文上限 {twitterCount.count} / 280 字符，超過{" "}
              {twitterCount.count - 280} 字。
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Twitter 發文上限 {twitterCount.count} / 280 字符。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
