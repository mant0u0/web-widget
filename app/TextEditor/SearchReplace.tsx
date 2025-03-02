// SearchReplace.tsx
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  ); // 用於輸入延遲觸發搜尋

  // 監聽文字變化，當文字變更時重新搜尋以更新結果
  useEffect(() => {
    if (searchText) {
      // 文字內容變更時重新執行搜尋
      const { positions, results } = findAllMatches(text, searchText);
      setMatchPositions(positions);
      setSearchResults(results);
      setMatchCount(positions.length);

      // 如果之前有選中的項目，嘗試保持選中狀態
      if (currentMatchIndex >= 0) {
        // 如果當前選中項超出了新的搜尋結果範圍，重設為第一項
        if (currentMatchIndex >= positions.length) {
          setCurrentMatchIndex(positions.length > 0 ? 0 : -1);
        }
      }
    }
  }, [text, searchText, currentMatchIndex]);

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

  // 處理輸入變更時的搜尋
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchText = e.target.value;
    setSearchText(newSearchText);

    // 清除先前的 timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // 設置新的 timeout (300ms 延遲)
    const timeout = setTimeout(() => {
      if (newSearchText) {
        handleSearch(newSearchText);
      } else {
        // 如果搜尋文字為空，清空搜尋結果
        setMatchPositions([]);
        setSearchResults([]);
        setMatchCount(0);
        setCurrentMatchIndex(-1);
      }
    }, 300);

    setTypingTimeout(timeout);
  };

  // 搜尋功能 - 只更新狀態，不進行選擇和 focus
  const handleSearch = (searchTextToUse = searchText) => {
    if (!searchTextToUse) return;

    // 找到所有匹配位置和上下文
    const { positions, results } = findAllMatches(text, searchTextToUse);
    setMatchPositions(positions);
    setSearchResults(results);
    setMatchCount(positions.length);

    // 只更新索引，不進行選擇
    if (positions.length > 0 && currentMatchIndex === -1) {
      setCurrentMatchIndex(0);
    }
  };

  // 當 replaceText 變更時更新視覺效果，但不實際進行替換
  useEffect(() => {
    // 每當 replaceText 改變時，重新渲染搜尋結果，但不 focus
    if (searchText) {
      handleSearch();
    }
  }, [replaceText]);

  // 點擊搜尋結果項目 - 設置索引並 focus 到 textarea
  const handleResultClick = (index: number) => {
    setCurrentMatchIndex(index);
    // 只有在點擊搜尋結果時才 focus 到 textarea
    selectMatch(matchPositions[index]);
  };

  // 選中特定位置的文字並確保卷軸捲動到可見區域
  const selectMatch = (position: number) => {
    const textArea = document.querySelector("textarea");
    if (!textArea) return;

    try {
      // 檢查位置是否有效
      if (position < 0 || position >= text.length) {
        console.warn("選中位置超出文字範圍:", position, text.length);
        return;
      }

      // 先 focus 並選中文字
      textArea.focus();
      textArea.setSelectionRange(position, position + searchText.length);

      // 更精確的卷軸位置計算
      // 使用 scrollIntoView 確保選中的文字在可見區域
      const scrollableParent = textArea;

      // 計算選中的開始和結束位置
      const startPosition = position;
      const endPosition = position + searchText.length;

      // 使用選中區域的中間位置來確定捲動位置
      const selectionMiddle = startPosition + (endPosition - startPosition) / 2;

      // 獲取選中位置前的所有文字
      const textBeforeSelection = text.substring(0, selectionMiddle);

      // 計算選中位置的行號和列號
      const lines = textBeforeSelection.split("\n");
      const lineNumber = lines.length - 1;
      // const column = lines[lineNumber].length;

      // 估算每行的高度 (像素)
      const lineHeight = parseInt(getComputedStyle(textArea).lineHeight) || 20;

      // 計算目標捲動位置
      // 目標是將選中行放在可視區域的中間
      setTimeout(() => {
        // 計算選中行的頂部位置
        const lineTop = lineNumber * lineHeight;

        // 計算使選中行在視口中間所需的捲動位置
        const scrollPosition =
          lineTop - scrollableParent.clientHeight / 2 + lineHeight;

        // 設置捲動位置，確保在有效範圍內
        scrollableParent.scrollTop = Math.max(
          0,
          Math.min(
            scrollPosition,
            scrollableParent.scrollHeight - scrollableParent.clientHeight,
          ),
        );
      }, 10);
    } catch (error) {
      console.error("選取文本時發生錯誤:", error);
    }
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
            <Collapsible>
              {/* 搜尋輸入框 */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  className="bg-white"
                  placeholder="搜尋..."
                  value={searchText}
                  onChange={handleSearchInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      if (!searchText) return;

                      // 找到所有匹配位置
                      const { positions } = findAllMatches(text, searchText);

                      if (positions.length > 0) {
                        // 已有搜尋結果時，按 Enter 往下一個選擇 (與點擊搜尋按鈕行為一致)
                        if (
                          currentMatchIndex >= 0 &&
                          currentMatchIndex < positions.length - 1
                        ) {
                          // 選擇下一個
                          const nextIndex = currentMatchIndex + 1;
                          setCurrentMatchIndex(nextIndex);
                          selectMatch(positions[nextIndex]);
                        } else {
                          // 當前已是最後一個或無選擇時，回到第一個
                          setCurrentMatchIndex(0);
                          selectMatch(positions[0]);
                        }
                      } else {
                        // 無搜尋結果時執行搜尋
                        handleSearch();
                      }
                    }
                  }}
                />
                <Button
                  className="flex-1"
                  onClick={() => {
                    // 點擊搜尋按鈕
                    if (!searchText) return;

                    // 找到所有匹配位置
                    const { positions } = findAllMatches(text, searchText);

                    if (positions.length > 0) {
                      // 已有搜尋結果時，點擊搜尋按鈕往下一個選擇
                      if (
                        currentMatchIndex >= 0 &&
                        currentMatchIndex < positions.length - 1
                      ) {
                        // 選擇下一個
                        const nextIndex = currentMatchIndex + 1;
                        setCurrentMatchIndex(nextIndex);
                        selectMatch(positions[nextIndex]);
                      } else {
                        // 當前已是最後一個或無選擇時，回到第一個
                        setCurrentMatchIndex(0);
                        selectMatch(positions[0]);
                      }
                    } else {
                      // 無搜尋結果時執行搜尋
                      handleSearch();
                    }
                  }}
                >
                  搜尋
                </Button>

                <CollapsibleTrigger>
                  <div className="inline-flex h-9 w-9 flex-1 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    <ChevronDown size={18} />
                  </div>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                {/* 取代輸入框 */}
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

                {/* 全部取代按鈕 */}
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
                          <AlertDialogTitle>
                            確定要全部取代嗎？
                          </AlertDialogTitle>
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
              </CollapsibleContent>
            </Collapsible>
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
                      {replaceText ? (
                        <>
                          <span className="bg-yellow-200 font-medium text-black line-through">
                            {result.matchText}
                          </span>
                          <span className="ml-1 mr-1 bg-green-100 font-medium text-black">
                            {replaceText}
                          </span>
                        </>
                      ) : (
                        <span className="bg-yellow-200 font-medium text-black">
                          {result.matchText}
                        </span>
                      )}
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
