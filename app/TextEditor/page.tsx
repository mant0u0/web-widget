// page.tsx
"use client";
import React, { useState, useCallback, ChangeEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import {
  Copy,
  CircleCheck,
  Undo,
  Trash,
  Quote,
  SpellCheck2,
  Type,
  Smile,
  ListOrdered,
  Search,
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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// 符號選擇
import { SymbolPicker } from "./SymbolPicker";
// 符號資料
import { dataSymbols } from "./dataSymbols";
import { dataEmoji } from "./dataEmoji";
import { dataKaomoji } from "./dataKaomoji";
// 文字處理
import { TextFormatter } from "./TextFormatter";
// 段落符號
import { ParagraphMark } from "./ParagraphMark";
// 引號
import { QuotationmMarks } from "./QuotationmMarks";

// 引號型別定義
type Quote = {
  symbol: string;
  name: string;
  center: number; // 游標位置
  editable?: boolean;
};

const TextEditor = () => {
  const [text, setText] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [copyStatus, setCopyStatus] = useState(false);

  // 搜尋功能相關狀態
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matchPositions, setMatchPositions] = useState<number[]>([]); // 儲存所有匹配位置

  // 更新文字
  const updateText = useCallback(
    (newText: string) => {
      // 更新文字
      setText(newText);

      // 如果文字不變動，不更新還原歷史紀錄
      if (newText === text) return;

      // 更新還原歷史紀錄
      const newHistory = [...history.slice(0, currentIndex + 1), newText];
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    },
    [history, currentIndex]
  );

  // ===============================================

  // 插入符號
  const insertSymbol = (symbol: string) => {
    // 選取 textArea
    const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
    if (!textArea) return;

    // 取得游標位置 (selectionStart 和 selectionEnd 是游標起點和結束位置)
    const { selectionStart, selectionEnd } = textArea;

    // 組合新文字
    const newText =
      text.slice(0, selectionStart) + symbol + text.slice(selectionEnd);

    // 更新文字
    updateText(newText);

    // 更新游標位置
    requestAnimationFrame(() => {
      const newPosition = selectionStart + symbol.length;
      textArea.focus();
      textArea.setSelectionRange(newPosition, newPosition);
    });
  };

  // 插入引號函數
  const insertQuote = useCallback(
    (quote: Quote) => {
      const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
      if (!textArea) return;

      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const textBefore = text.substring(0, start);
      const textAfter = text.substring(end);
      const selectedText = text.substring(start, end);

      // 計算左右引號的長度
      // const totalLength = quote.symbol.length;
      const leftSymbolLength = quote.center;
      // const rightSymbolLength = totalLength - leftSymbolLength;

      // 取得左右引號
      const leftQuote = quote.symbol.substring(0, leftSymbolLength);
      const rightQuote = quote.symbol.substring(leftSymbolLength);

      // 組合新文字
      const newText =
        textBefore + leftQuote + selectedText + rightQuote + textAfter;
      updateText(newText);

      // 設定游標位置
      const newPosition =
        selectedText.length > 0
          ? start + leftSymbolLength + selectedText.length // 如果有選取文字，游標放在選取文字後
          : start + leftSymbolLength; // 如果沒有選取文字，游標放在指定位置

      // 更新游標位置
      requestAnimationFrame(() => {
        textArea.focus();
        textArea.setSelectionRange(newPosition, newPosition);
      });
    },
    [text, updateText]
  );

  // 選取轉換的文字
  const transformSelectedText = async (
    text: string,
    transformFn: (text: string) => string | Promise<string>,
    updateText: (newText: string) => void
  ) => {
    // 取得 textarea 元素
    const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
    if (!textArea) return;

    // 獲取選取範圍
    const { selectionStart, selectionEnd } = textArea;
    const hasSelection = selectionStart !== selectionEnd;

    try {
      // 轉換文字
      let newText: string;
      if (hasSelection) {
        // 轉換選取的文字
        const beforeSelection = text.substring(0, selectionStart);
        const selectedText = text.substring(selectionStart, selectionEnd);
        const afterSelection = text.substring(selectionEnd);

        const transformedSelection = await transformFn(selectedText);
        newText = beforeSelection + transformedSelection + afterSelection;
      } else {
        // 轉換全部文字
        newText = await transformFn(text);
      }

      // 更新文字
      updateText(newText);

      // 更新游標位置
      const newPosition = hasSelection
        ? selectionStart + (newText.length - text.length)
        : selectionStart;
      requestAnimationFrame(() => {
        textArea.focus();
        textArea.setSelectionRange(newPosition, newPosition);
      });
    } catch (error) {
      console.error("轉換失敗:", error);
    }
  };

  // 處理每行開頭的轉換函數
  const transformSelectedLine = async (
    text: string,
    transformFn: (line: string) => string | Promise<string>,
    updateText: (newText: string) => void
  ) => {
    // 取得 textarea 元素
    const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
    if (!textArea) return;

    // 獲取選取範圍
    const { selectionStart, selectionEnd } = textArea;
    // 判斷是否有選取
    const hasSelection = selectionStart !== selectionEnd;

    try {
      let newText: string;
      if (hasSelection) {
        // 找到選取範圍所在的完整行
        const startLineStart = text.lastIndexOf("\n", selectionStart - 1) + 1;
        const endLineEnd = text.indexOf("\n", selectionEnd);
        const finalEndLineEnd = endLineEnd === -1 ? text.length : endLineEnd;

        // 取得完整行的選取範圍
        const beforeFullSelection = text.substring(0, startLineStart);
        const fullSelectedText = text.substring(
          startLineStart,
          finalEndLineEnd
        );
        const afterFullSelection = text.substring(finalEndLineEnd);

        // 將選取的文字分割成行
        const lines = fullSelectedText.split("\n");

        // 對每一行進行轉換
        const transformedLines = await Promise.all(
          lines.map(async (line) => await transformFn(line))
        );

        // 將轉換後的行重新組合
        const transformedSelection = transformedLines.join("\n");

        // 組合完整的新文字
        newText =
          beforeFullSelection + transformedSelection + afterFullSelection;

        // 更新文字
        updateText(newText);

        // 更新選取範圍，保持完整行的選取
        requestAnimationFrame(() => {
          textArea.focus();
          textArea.setSelectionRange(
            startLineStart,
            startLineStart + transformedSelection.length
          );
        });
      } else {
        // 如果沒有選取範圍，找到游標所在的完整行
        const currentLineStart = text.lastIndexOf("\n", selectionStart - 1) + 1;
        const currentLineEnd = text.indexOf("\n", selectionStart);
        const finalCurrentLineEnd =
          currentLineEnd === -1 ? text.length : currentLineEnd;

        // 取得當前行的文字
        const beforeCurrentLine = text.substring(0, currentLineStart);
        const currentLine = text.substring(
          currentLineStart,
          finalCurrentLineEnd
        );
        const afterCurrentLine = text.substring(finalCurrentLineEnd);

        // 轉換當前行
        const transformedLine = await transformFn(currentLine);

        // 組合新文字
        newText = beforeCurrentLine + transformedLine + afterCurrentLine;

        // 更新文字
        updateText(newText);

        // 游標位置更新至選取範圍的最後一個字符
        const newCursorPosition = currentLineStart + transformedLine.length;

        requestAnimationFrame(() => {
          textArea.focus();
          textArea.setSelectionRange(newCursorPosition, newCursorPosition);
        });
      }
    } catch (error) {
      console.error("轉換失敗:", error);
    }
  };

  // ===============================================

  // 處理文字變更
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    updateText(e.target.value);

  // 還原
  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setText(history[currentIndex - 1]);
    }
  }, [currentIndex, history]);

  // 刪除
  const clearText = () => updateText("");

  // 複製文字
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 1000);
    } catch (err) {
      console.error("複製失敗:", err);
    }
  };

  // ==========================================

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
        textArea.selectionStart
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

  // ===============================================

  return (
    <div className="flex h-[100vh] w-full">
      {/* 功能列 */}
      <div className="w-[28%] min-w-[290px] h-full p-4 overflow-hidden overflow-y-auto flex flex-col gap-2">
        <Accordion type="single" collapsible>
          {/* 插入符號 */}
          <AccordionItem value="item-1">
            <AccordionTrigger className="!no-underline ">
              <Type className="h-5 w-[24px] mr-1 !rotate-0" />
              <p className="">插入符號</p>
            </AccordionTrigger>
            <AccordionContent>
              <SymbolPicker
                data={dataSymbols}
                onSelect={insertSymbol}
                btnClassName="w-[44px] h-[44px] noto-sans-font"
              />
            </AccordionContent>
          </AccordionItem>

          {/* 插入 Emoji */}
          <AccordionItem value="item-2">
            <AccordionTrigger className="!no-underline ">
              <Smile className="h-5 w-[24px] mr-1 !rotate-0" />
              插入 Emoji
            </AccordionTrigger>
            <AccordionContent>
              <SymbolPicker
                data={dataEmoji}
                onSelect={insertSymbol}
                btnClassName="w-[44px] h-[44px] emoji-font text-2xl"
              />
            </AccordionContent>
          </AccordionItem>

          {/* 插入顏文字 */}
          <AccordionItem value="item-3">
            <AccordionTrigger className="!no-underline ">
              <Smile className="h-5 w-[24px] mr-1 !rotate-0" />
              插入顏文字
            </AccordionTrigger>
            <AccordionContent>
              <SymbolPicker data={dataKaomoji} onSelect={insertSymbol} />
            </AccordionContent>
          </AccordionItem>

          {/* 插入引號 */}
          <AccordionItem value="item-4">
            <AccordionTrigger className="!no-underline ">
              <Quote className="h-5 w-[24px] mr-1 !rotate-0" />
              插入引號
            </AccordionTrigger>
            <AccordionContent>
              <QuotationmMarks insertQuote={insertQuote} />
            </AccordionContent>
          </AccordionItem>

          {/* 段落符號 */}
          <AccordionItem value="item-5">
            <AccordionTrigger className="!no-underline ">
              <ListOrdered className="h-5 w-[24px] mr-1 !rotate-0" />
              段落符號
            </AccordionTrigger>
            <AccordionContent>
              <ParagraphMark
                transformSelectedLine={transformSelectedLine}
                text={text}
                updateText={updateText}
              />
            </AccordionContent>
          </AccordionItem>

          {/* 文字處理 */}
          <AccordionItem value="item-6">
            <AccordionTrigger className="!no-underline ">
              <SpellCheck2 className="h-5 w-[24px] mr-1 !rotate-0" />
              文字處理
            </AccordionTrigger>
            <AccordionContent>
              <TextFormatter
                transformSelectedText={transformSelectedText}
                text={text}
                updateText={updateText}
              />
            </AccordionContent>
          </AccordionItem>

          {/* 搜尋取代 */}
          <AccordionItem value="item-7">
            <AccordionTrigger className="!no-underline ">
              <Search className="h-5 w-[24px] mr-1 !rotate-0" />
              搜尋取代 (測試)
            </AccordionTrigger>

            <AccordionContent>
              <div className="w-full flex flex-col gap-2 p-4 px-2">
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

                {/* 搜尋狀態顯示 */}
                {matchCount > 0 && (
                  <div className="text-sm text-gray-500">
                    找到 {matchCount} 個結果 ({currentMatchIndex + 1}/
                    {matchCount})
                  </div>
                )}

                <div className="pt-4 flex flex-col gap-1">
                  {/* 字數統計 */}
                  <div className="text-sm text-gray-500">
                    目前總共 {characterCount} 個字，共 {lineCount} 行。
                  </div>

                  {characterCount > 500 ? (
                    <div className="text-sm  text-red-500">
                      Threads 文字上限 {characterCount} / 500 字，超過{" "}
                      {characterCount - 500} 字。
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Threads 發文上限 {characterCount} / 500 字。
                    </div>
                  )}

                  {twitterCount.count > 280 ? (
                    <div className="text-sm  text-red-500">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* 文字編輯區 */}
      <div className="w-full flex flex-col gap-4 pt-4 pb-4 pr-4 text-3xl">
        <Textarea
          value={text}
          onChange={handleTextChange}
          placeholder="在這裡輸入或編輯文字..."
          className="w-full h-full p-2 !text-lg bg-white resize-none "
        />

        <div className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash className="h-5 w-[24px] mr-1" />
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={currentIndex <= 0}
              className="flex items-center"
            >
              <Undo className="h-5 w-[24px] mr-1" />
              還原
            </Button>
            <Button
              onClick={copyText}
              variant="outline"
              disabled={copyStatus || !text}
            >
              {copyStatus ? (
                <CircleCheck className="h-5 w-[24px] mr-1" />
              ) : (
                <Copy className="h-5 w-[24px] mr-1" />
              )}
              {copyStatus ? "成功" : "複製"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
