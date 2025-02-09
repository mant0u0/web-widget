// page.tsx
"use client";
import React, { useState, useCallback, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  CircleCheck,
  Undo,
  Trash,
  Quote,
  SpellCheck2,
  Type,
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
import { dataQuotes } from "./dataQuotes";

// 文字處理
import { TextFormatter } from "./TextFormatter";

const TextEditor = () => {
  const [text, setText] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [copyStatus, setCopyStatus] = useState(false);

  // 更新文字
  const updateText = useCallback(
    (newText: string) => {
      // 更新文字
      setText(newText);

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

  // 插入引號
  const insertQuote = (quote: { symbol: string }) => {
    // 選取 textArea
    const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
    if (!textArea) return;

    // 取得游標位置
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
    updateText(newText);

    // 設定游標位置到引號中間
    const newPosition =
      selectedText.length > 0
        ? start + leftQuote.length + selectedText.length // 如果有選取文字，游標放在選取文字後
        : start + leftQuote.length; // 如果沒有選取文字，游標放在引號中間

    // 更新游標位置
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

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

  // ===============================================

  return (
    <div className="flex h-[100vh] w-full p-4 gap-4">
      {/* 功能列 */}
      <div className="w-[28%] min-w-[290px] h-full overflow-hidden flex flex-col gap-2">
        <Accordion type="single" collapsible>
          {/* 插入符號 */}
          <AccordionItem value="item-1">
            <AccordionTrigger className="!no-underline ">
              <Type className="h-5 w-5 mr-1 !rotate-0" />
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
              <Smile className="h-5 w-5 mr-1 !rotate-0" />
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
              <Smile className="h-5 w-5 mr-1 !rotate-0" />
              插入顏文字
            </AccordionTrigger>
            <AccordionContent>
              <SymbolPicker data={dataKaomoji} onSelect={insertSymbol} />
            </AccordionContent>
          </AccordionItem>

          {/* 插入引號 */}
          <AccordionItem value="item-4">
            <AccordionTrigger className="!no-underline ">
              <Quote className="h-5 w-5 mr-1 !rotate-0" />
              插入引號
            </AccordionTrigger>
            <AccordionContent>
              <div className="w-full h-[600px] p-0 overflow-hidden rounded-md border border-input bg-zinc-50 flex flex-col">
                {dataQuotes.map((quote) => (
                  <Button
                    key={quote.symbol}
                    variant="outline"
                    onClick={() => insertQuote(quote)}
                    className="flex justify-start items-center h-11 w-full  rounded-none border-l-0 border-r-0 border-t-0 text-md animate-fade-in"
                  >
                    <span className="mr-1 w-8">{quote.symbol}</span>
                    {quote.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 文字處理 */}
          <AccordionItem value="item-5">
            <AccordionTrigger className="!no-underline ">
              <SpellCheck2 className="h-5 w-5 mr-1 !rotate-0" />
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
        </Accordion>
      </div>

      {/* 文字編輯區 */}
      <div className="w-full flex flex-col gap-4 text-3xl">
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={currentIndex <= 0}
              className="flex items-center"
            >
              <Undo className="h-5 w-5 mr-1" />
              還原
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
    </div>
  );
};

export default TextEditor;
