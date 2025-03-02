"use client";
import React, { useCallback, ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from "@/components/ui/resizable";

// 工具列
import { Toolbar } from "./Toolbar";
// 頁尾
import { Footer } from "./Footer";

import useLocalStorage from "../hooks/useLocalStorage";

// 引號型別定義
type Quote = {
  symbol: string;
  name: string;
  center: number; // 游標位置
  editable?: boolean;
};

// 文字編輯器
const TextEditor = () => {
  // 使用 useLocalStorage hook
  const [text, setText] = useLocalStorage<string>("textEditor", "");
  const [history, setHistory] = useLocalStorage<string[]>(
    "textEditorHistory",
    [],
  );
  const [currentIndex, setCurrentIndex] = useLocalStorage<number>(
    "textEditorHistoryIndex",
    -1,
  );
  const [copyStatus, setCopyStatus] = React.useState(false);

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
    [history, currentIndex, text, setText, setHistory, setCurrentIndex],
  );

  // 處理游標位置和卷軸的輔助函數
  const handleCursorAndScroll = (
    textArea: HTMLTextAreaElement,
    scrollTop: number,
    newPosition: number,
  ) => {
    requestAnimationFrame(() => {
      textArea.focus();
      textArea.setSelectionRange(newPosition, newPosition);
      textArea.scrollTop = scrollTop;
    });
  };

  // 插入符號
  const insertSymbol = useCallback(
    (symbol: string) => {
      const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
      if (!textArea) return;

      const scrollTop = textArea.scrollTop;
      const { selectionStart, selectionEnd } = textArea;
      const newText =
        text.slice(0, selectionStart) + symbol + text.slice(selectionEnd);

      updateText(newText);
      handleCursorAndScroll(
        textArea,
        scrollTop,
        selectionStart + symbol.length,
      );
    },
    [text, updateText],
  );

  // 插入引號
  const insertQuote = useCallback(
    (quote: Quote) => {
      const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
      if (!textArea) return;

      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const selectedText = text.substring(start, end);

      const leftQuote = quote.symbol.substring(0, quote.center);
      const rightQuote = quote.symbol.substring(quote.center);

      const newText =
        text.substring(0, start) +
        leftQuote +
        selectedText +
        rightQuote +
        text.substring(end);

      const scrollTop = textArea.scrollTop;
      const newPosition =
        selectedText.length > 0
          ? start + quote.center + selectedText.length
          : start + quote.center;

      updateText(newText);
      handleCursorAndScroll(textArea, scrollTop, newPosition);
    },
    [text, updateText],
  );

  // 選取轉換的文字
  const transformSelectedText = useCallback(
    async (
      text: string,
      transformFn: (text: string) => string | Promise<string>,
      updateText: (newText: string) => void,
    ) => {
      const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
      if (!textArea) return;

      const scrollTop = textArea.scrollTop;
      const { selectionStart, selectionEnd } = textArea;
      const hasSelection = selectionStart !== selectionEnd;

      try {
        let newText: string;
        if (hasSelection) {
          const selectedText = text.substring(selectionStart, selectionEnd);
          const transformedSelection = await transformFn(selectedText);
          newText =
            text.substring(0, selectionStart) +
            transformedSelection +
            text.substring(selectionEnd);
        } else {
          newText = await transformFn(text);
        }

        updateText(newText);

        const newPosition = hasSelection
          ? selectionStart + (newText.length - text.length)
          : selectionStart;
        handleCursorAndScroll(textArea, scrollTop, newPosition);
      } catch (error) {
        console.error("轉換失敗:", error);
      }
    },
    [],
  );

  // 處理每行開頭的轉換函數
  const transformSelectedLine = useCallback(
    async (
      text: string,
      transformFn: (line: string) => string | Promise<string>,
      updateText: (newText: string) => void,
    ) => {
      const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
      if (!textArea) return;

      const scrollTop = textArea.scrollTop;
      const { selectionStart, selectionEnd } = textArea;
      const hasSelection = selectionStart !== selectionEnd;

      try {
        if (hasSelection) {
          const startLineStart = text.lastIndexOf("\n", selectionStart - 1) + 1;
          const endLineEnd = text.indexOf("\n", selectionEnd);
          const finalEndLineEnd = endLineEnd === -1 ? text.length : endLineEnd;

          const lines = text
            .substring(startLineStart, finalEndLineEnd)
            .split("\n");

          const transformedLines = await Promise.all(
            lines.map((line) => transformFn(line)),
          );

          const newText =
            text.substring(0, startLineStart) +
            transformedLines.join("\n") +
            text.substring(finalEndLineEnd);

          updateText(newText);
          handleCursorAndScroll(
            textArea,
            scrollTop,
            startLineStart + transformedLines.join("\n").length,
          );
        } else {
          const lineStart = text.lastIndexOf("\n", selectionStart - 1) + 1;
          const lineEnd = text.indexOf("\n", selectionStart);
          const finalLineEnd = lineEnd === -1 ? text.length : lineEnd;

          const currentLine = text.substring(lineStart, finalLineEnd);
          const transformedLine = await transformFn(currentLine);

          const newText =
            text.substring(0, lineStart) +
            transformedLine +
            text.substring(finalLineEnd);

          updateText(newText);
          handleCursorAndScroll(
            textArea,
            scrollTop,
            lineStart + transformedLine.length,
          );
        }
      } catch (error) {
        console.error("轉換失敗:", error);
      }
    },
    [],
  );

  // 還原
  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setText(history[currentIndex - 1]);
    }
  }, [currentIndex, history, setCurrentIndex, setText]);

  // 取消還原
  const handleRedo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setText(history[currentIndex + 1]);
    }
  }, [currentIndex, history, setCurrentIndex, setText]);

  // 刪除
  const clearText = useCallback(() => {
    setText("");
    setHistory([]);
    setCurrentIndex(-1);
  }, [setText, setHistory, setCurrentIndex]);

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

  // 處理文字變更
  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => updateText(e.target.value),
    [updateText],
  );

  return (
    <div className="flex h-screen w-screen flex-col items-center overflow-hidden">
      {/* content  */}
      <div className="flex h-full w-full flex-col overflow-hidden p-3 md:flex-row-reverse md:gap-3">
        <div className="h-full w-full overflow-hidden md:w-[80%]">
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder="在這裡輸入或編輯文字..."
            className="textarea h-full w-full resize-none rounded-xl bg-white p-4 !text-lg focus-visible:ring-0"
          />
        </div>
        <div className="h-full w-full overflow-hidden md:w-[20%] md:min-w-[340px]">
          <Toolbar
            text={text}
            updateText={updateText}
            insertSymbol={insertSymbol}
            insertQuote={insertQuote}
            transformSelectedText={transformSelectedText}
            transformSelectedLine={transformSelectedLine}
          />
        </div>
      </div>
      {/* Footer */}
      <Footer
        text={text}
        copyStatus={copyStatus}
        currentIndex={currentIndex}
        historyLength={history.length}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCopy={copyText}
        onClear={clearText}
      />
    </div>
  );
};

export default TextEditor;
