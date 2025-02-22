// page.tsx
"use client";
import React, { useState, useCallback, ChangeEvent, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// 工具列
import { Toolbar } from "./Toolbar";
// 頁尾
import { Footer } from "./Footer";

// 常數定義
const STORAGE_KEY = "textEditor";
const HISTORY_KEY = "textEditorHistory";
const HISTORY_INDEX_KEY = "textEditorHistoryIndex";

// 本地儲存相關函數
const saveToLocalStorage = (
  text: string,
  history: string[],
  currentIndex: number,
) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, text);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    localStorage.setItem(HISTORY_INDEX_KEY, currentIndex.toString());
  } catch (error) {
    console.error("保存到 localStorage 失敗:", error);
  }
};

// 從本地儲存讀取數據
const loadFromLocalStorage = () => {
  if (typeof window === "undefined") {
    return { savedText: "", savedHistory: [], savedIndex: -1 };
  }

  try {
    const savedText = localStorage.getItem(STORAGE_KEY) || "";
    const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const savedIndex = parseInt(
      localStorage.getItem(HISTORY_INDEX_KEY) || "-1",
    );
    return { savedText, savedHistory, savedIndex };
  } catch (error) {
    console.error("從 localStorage 讀取失敗:", error);
    return { savedText: "", savedHistory: [], savedIndex: -1 };
  }
};

// 引號型別定義
type Quote = {
  symbol: string;
  name: string;
  center: number; // 游標位置
  editable?: boolean;
};

// 文字編輯器
const TextEditor = () => {
  const [text, setText] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [copyStatus, setCopyStatus] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 在 useEffect 中從 localStorage 讀取數據
  useEffect(() => {
    const { savedText, savedHistory, savedIndex } = loadFromLocalStorage();
    setText(savedText);
    setHistory(savedHistory);
    setCurrentIndex(savedIndex);
    setIsLoaded(true);
  }, []);

  // 當文字、歷史記錄或當前索引改變時，保存到 localStorage
  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage(text, history, currentIndex);
    }
  }, [text, history, currentIndex, isLoaded]);

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
    [history, currentIndex, text],
  );

  // 插入符號
  const insertSymbol = (symbol: string) => {
    // 選取 textArea
    const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
    if (!textArea) return;

    // 儲存當前卷軸位置
    const scrollTop = textArea.scrollTop;

    // 取得游標位置 (selectionStart 和 selectionEnd 是游標起點和結束位置)
    const { selectionStart, selectionEnd } = textArea;

    // 組合新文字
    const newText =
      text.slice(0, selectionStart) + symbol + text.slice(selectionEnd);

    // 更新文字
    updateText(newText);

    // 更新游標位置並恢復卷軸位置
    requestAnimationFrame(() => {
      const newPosition = selectionStart + symbol.length;
      textArea.focus();
      textArea.setSelectionRange(newPosition, newPosition);
      // 恢復卷軸位置
      textArea.scrollTop = scrollTop;
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
      const leftSymbolLength = quote.center;

      // 取得左右引號
      const leftQuote = quote.symbol.substring(0, leftSymbolLength);
      const rightQuote = quote.symbol.substring(leftSymbolLength);

      // 組合新文字
      const newText =
        textBefore + leftQuote + selectedText + rightQuote + textAfter;
      updateText(newText);

      // 儲存當前卷軸位置
      const scrollTop = textArea.scrollTop;

      // 設定游標位置
      const newPosition =
        selectedText.length > 0
          ? start + leftSymbolLength + selectedText.length // 如果有選取文字，游標放在選取文字後
          : start + leftSymbolLength; // 如果沒有選取文字，游標放在指定位置

      // 更新游標位置
      requestAnimationFrame(() => {
        textArea.focus();
        textArea.setSelectionRange(newPosition, newPosition);
        // 恢復卷軸位置
        textArea.scrollTop = scrollTop;
      });
    },
    [text, updateText],
  );

  // 選取轉換的文字
  const transformSelectedText = async (
    text: string,
    transformFn: (text: string) => string | Promise<string>,
    updateText: (newText: string) => void,
  ) => {
    // 取得 textarea 元素
    const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
    if (!textArea) return;

    // 儲存當前卷軸位置
    const scrollTop = textArea.scrollTop;

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
        // 恢復卷軸位置
        textArea.scrollTop = scrollTop;
      });
    } catch (error) {
      console.error("轉換失敗:", error);
    }
  };

  // 處理每行開頭的轉換函數
  const transformSelectedLine = async (
    text: string,
    transformFn: (line: string) => string | Promise<string>,
    updateText: (newText: string) => void,
  ) => {
    // 取得 textarea 元素
    const textArea = document.querySelector<HTMLTextAreaElement>("textarea");
    if (!textArea) return;
    // 儲存當前卷軸位置
    const scrollTop = textArea.scrollTop;
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
          finalEndLineEnd,
        );
        const afterFullSelection = text.substring(finalEndLineEnd);

        // 將選取的文字分割成行
        const lines = fullSelectedText.split("\n");

        // 對每一行進行轉換
        const transformedLines = await Promise.all(
          lines.map(async (line) => await transformFn(line)),
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
            startLineStart + transformedSelection.length,
          );
          // 恢復卷軸位置
          textArea.scrollTop = scrollTop;
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
          finalCurrentLineEnd,
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
          // 恢復卷軸位置
          textArea.scrollTop = scrollTop;
        });
      }
    } catch (error) {
      console.error("轉換失敗:", error);
    }
  };

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

  // 取消還原
  const handleRedo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setText(history[currentIndex + 1]);
    }
  }, [currentIndex, history]);

  // 刪除
  const clearText = useCallback(() => {
    updateText("");
    // 清除 localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(HISTORY_INDEX_KEY);
    }
  }, [updateText]);

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
    <div className="flex h-screen w-screen flex-col">
      <ResizablePanelGroup direction="vertical">
        {/* 文字編輯區 */}
        <ResizablePanel defaultSize={50}>
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder="在這裡輸入或編輯文字..."
            className="textarea h-full w-full resize-none rounded-none bg-white p-2 !text-lg focus-visible:ring-0"
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* 工具選擇區 */}
        <ResizablePanel defaultSize={50}>
          <Toolbar
            text={text}
            updateText={updateText}
            insertSymbol={insertSymbol}
            insertQuote={insertQuote}
            transformSelectedText={transformSelectedText}
            transformSelectedLine={transformSelectedLine}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

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
