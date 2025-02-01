"use client";

import React, { useState, useRef, useEffect } from "react";

const SocialMediaEditor = () => {
  const [text, setText] = useState("");
  const [history, setHistory] = useState([""]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [panguLoaded, setPanguLoaded] = useState(false);
  const textareaRef = useRef(null);

  // 載入 Pangu.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pangu/4.0.7/pangu.js";
    script.async = true;
    script.onload = () => setPanguLoaded(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // 符號列表
  const symbols = [
    "→",
    "←",
    "↑",
    "↓",
    "♥",
    "★",
    "☆",
    "○",
    "●",
    "❤️",
    "✨",
    "🔥",
    "⭐",
    "📌",
    "💡",
    "✅",
    "❌",
    "①",
    "②",
    "③",
    "④",
    "⑤",
    "⑥",
    "⑦",
    "⑧",
    "⑨",
    "⑩",
    "…",
  ];

  const quotes = [
    { open: "「", close: "」" },
    { open: "『", close: "』" },
  ];

  const listMarkers = [
    { label: "短橫線", mark: "－" },
    { label: "數字", mark: "number" },
    { label: "圓點", mark: "• " },
    { label: "方形", mark: "■ " },
  ];

  // 添加新的歷史記錄
  const addHistory = (newText) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setText(newText);
  };

  // 處理文字輸入
  const handleTextChange = (e) => {
    addHistory(e.target.value);
  };

  // 插入符號
  const insertSymbol = (symbol) => {
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newText = text.slice(0, start) + symbol + text.slice(end);
    addHistory(newText);

    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        start + symbol.length,
        start + symbol.length
      );
    }, 0);
  };

  // 插入引號
  const insertQuotes = (open, close) => {
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = text.slice(start, end);
    const newText =
      text.slice(0, start) + open + selectedText + close + text.slice(end);
    addHistory(newText);

    const newPosition = selectedText
      ? start + open.length + selectedText.length + close.length
      : start + open.length;
    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // 添加行標記
  const addLineMarkers = (marker) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.slice(start, end);

    if (!selectedText) return;

    let lines = selectedText.split("\n");
    let newLines = lines.map((line, index) => {
      if (!line.trim()) return line;

      if (marker === "number") {
        return `${index + 1}. ${line}`;
      }

      return `${marker}${line}`;
    });

    const newText =
      text.slice(0, start) + newLines.join("\n") + text.slice(end);
    addHistory(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + newLines.join("\n").length);
    }, 0);
  };

  // 使用 Pangu.js 調整間距
  const spacingText = () => {
    if (!panguLoaded) {
      alert("Pangu.js 還在載入中，請稍候...");
      return;
    }
    const newText = window.pangu.spacing(text);
    if (newText !== text) {
      addHistory(newText);
    }
  };

  // 復原
  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setText(history[currentIndex - 1]);
    }
  };

  // 重做
  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setText(history[currentIndex + 1]);
    }
  };

  // 檢查標點符號
  const checkPunctuation = () => {
    let newText = text;

    newText = newText.replace(
      /([\u4e00-\u9fa5」』])(,|\.|;|。|，|；)([\\u4e00-\u9fa5]|$)/g,
      (match, prev, punct, next) => {
        const correctedPunct =
          punct === ","
            ? "，"
            : punct === "."
            ? "。"
            : punct === ";"
            ? "；"
            : punct;
        return prev + correctedPunct + next;
      }
    );

    newText = newText.replace(
      /([a-zA-Z])(，|。|；|,|\.|;)(\s)?([a-zA-Z0-9])/g,
      (match, prev, punct, space, next) => {
        const correctedPunct =
          punct === "，"
            ? ","
            : punct === "。"
            ? "."
            : punct === "；"
            ? ";"
            : punct;
        return prev + correctedPunct + " " + next;
      }
    );

    if (newText !== text) {
      addHistory(newText);
    }
  };

  const buttonClass =
    "px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  const buttonContainerClass = "flex flex-wrap gap-2";
  const primaryButtonClass =
    "flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex">
      <div className="">
        <div className="space-y-4">
          {/* 特殊符號按鈕群組 */}
          <div className={buttonContainerClass}>
            {symbols.map((symbol, index) => (
              <button
                key={index}
                className={buttonClass}
                onClick={() => insertSymbol(symbol)}
              >
                {symbol}
              </button>
            ))}
          </div>

          {/* 引號按鈕群組 */}
          <div className={buttonContainerClass}>
            {quotes.map((quote, index) => (
              <button
                key={index}
                className={buttonClass}
                onClick={() => insertQuotes(quote.open, quote.close)}
              >
                {quote.open}abc{quote.close}
              </button>
            ))}
          </div>

          {/* 列表標記按鈕群組 */}
          <div className={buttonContainerClass}>
            {listMarkers.map((marker, index) => (
              <button
                key={index}
                className={buttonClass}
                onClick={() => addLineMarkers(marker.mark)}
              >
                {marker.label}
              </button>
            ))}
          </div>

          {/* 功能按鈕群組 */}
          <div className="flex gap-2">
            <button
              className={primaryButtonClass}
              onClick={spacingText}
              disabled={!panguLoaded}
            >
              自動調整間距
            </button>
            <button className={primaryButtonClass} onClick={checkPunctuation}>
              檢查標點符號
            </button>
          </div>

          {/* 復原/重做按鈕 */}
          <div className="flex gap-2">
            <button
              className={buttonClass}
              onClick={undo}
              disabled={currentIndex <= 0}
            >
              復原 (Ctrl+Z)
            </button>
            <button
              className={buttonClass}
              onClick={redo}
              disabled={currentIndex >= history.length - 1}
            >
              重做 (Ctrl+Y)
            </button>
          </div>
        </div>
      </div>
      {/* 文字編輯區域 */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        className="w-full h-48 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="在此輸入文字..."
      />
    </div>
  );
};

export default SocialMediaEditor;
