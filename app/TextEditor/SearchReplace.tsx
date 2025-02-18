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

export const SearchReplace = ({
  // transformSelectedText,
  text,
  updateText,
}) => {
  // 搜尋功能相關狀態
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matchPositions, setMatchPositions] = useState<number[]>([]); // 儲存所有匹配位置

  // 尋找所有匹配位置
  const findAllMatches = (text: string, searchText: string) => {
    const positions: number[] = [];
    const regex = new RegExp(searchText, "g");
    let match;

    while ((match = regex.exec(text)) !== null) {
      positions.push(match.index);
    }

    return positions;
  };

  // 搜尋功能
  const handleSearch = () => {
    if (!searchText) return;

    // 找到所有匹配位置
    const positions = findAllMatches(text, searchText);
    setMatchPositions(positions);
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

    // 更新匹配位置和計數
    const newPositions = findAllMatches(newText, searchText);
    setMatchPositions(newPositions);
    setMatchCount(newPositions.length);

    // 更新當前索引
    if (newPositions.length === 0) {
      setCurrentMatchIndex(-1);
    } else if (currentMatchIndex >= newPositions.length) {
      setCurrentMatchIndex(0);
      selectMatch(newPositions[0]);
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
  };
  // ================================================

  // 字符數計算
  const characterCount = useMemo(() => text.length, [text]);

  // 行數計算
  const lineCount = useMemo(() => text.split("\n").length, [text]);

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
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-2 p-4 px-2">
        {/* 搜尋輸入框 */}
        <div className="flex gap-2">
          <Input
            type="text"
            className="bg-white"
            placeholder="搜尋..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            // onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button className="flex-1" onClick={handleSearch}>
            搜尋
          </Button>
        </div>
        <Input
          type="text"
          className="bg-white"
          placeholder="取代為..."
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
        />

        {/* 控制按鈕 */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
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
              onClick={clearSelection}
              disabled={matchCount === 0}
            >
              返回第一個
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

        <div className="flex flex-col gap-1 pt-4">
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
    </ScrollArea>
  );
};
