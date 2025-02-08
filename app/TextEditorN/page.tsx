// page.tsx
"use client";
import React, { useState, useCallback, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CircleCheck, Undo, Trash } from "lucide-react";
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

import { Type, Smile } from "lucide-react";
import { SymbolPicker } from "./SymbolPicker";
// 符號數據
import { symbolsData } from "./symbolsData";
import { emojiData } from "./emojiData";
import { kaomojiData } from "./kaomojiData";

const TextFormatter = () => {
  const [text, setText] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [copyStatus, setCopyStatus] = useState(false);

  const updateText = useCallback(
    (newText: string) => {
      setText(newText);
      const newHistory = [...history.slice(0, currentIndex + 1), newText];
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    },
    [history, currentIndex]
  );

  const insertSymbol = (symbol: string) => {
    const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
    if (!textArea) return;

    const { selectionStart, selectionEnd } = textArea;
    const newText =
      text.slice(0, selectionStart) + symbol + text.slice(selectionEnd);
    updateText(newText);

    requestAnimationFrame(() => {
      const newPosition = selectionStart + symbol.length;
      textArea.focus();
      textArea.setSelectionRange(newPosition, newPosition);
    });
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    updateText(e.target.value);
  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setText(history[currentIndex - 1]);
    }
  }, [currentIndex, history]);

  const clearText = () => updateText("");

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 1000);
    } catch (err) {
      console.error("複製失敗:", err);
    }
  };

  return (
    <div className="flex h-[100vh] w-full p-4 gap-4">
      <div className="w-[28%] min-w-30 h-full overflow-hidden flex flex-col gap-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="!no-underline ">
              <Type className="h-5 w-5 mr-1 !rotate-0" />
              <p className="">插入符號</p>
            </AccordionTrigger>
            <AccordionContent>
              <SymbolPicker 
              data={symbolsData} 
              onSelect={insertSymbol} 
              btnClassName="w-[44px] h-[44px] noto-sans-font"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="!no-underline ">
              <Smile className="h-5 w-5 mr-1 !rotate-0" />
              插入 Emoji
            </AccordionTrigger>
            <AccordionContent>
              <SymbolPicker
                data={emojiData}
                onSelect={insertSymbol}
                btnClassName="w-[44px] h-[44px] emoji-font"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="!no-underline ">
              <Smile className="h-5 w-5 mr-1 !rotate-0" />
              插入顏文字
            </AccordionTrigger>
            <AccordionContent>
              <SymbolPicker data={kaomojiData} onSelect={insertSymbol} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

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

export default TextFormatter;
