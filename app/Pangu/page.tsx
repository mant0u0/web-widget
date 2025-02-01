"use client";

import React, { useState, useRef, useEffect } from "react";

const Pangu = () => {
  const [text, setText] = useState("");
  const [panguLoaded, setPanguLoaded] = useState(false);
  const [copyStatus, setCopyStatus] = useState(""); // 用於顯示複製狀態
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

  // 使用 Pangu.js 調整間距
  const spacingText = () => {
    if (!panguLoaded) {
      alert("Pangu.js 還在載入中，請稍候...");
      return;
    }
    const newText = window.pangu.spacing(text);
    if (newText !== text) {
      setText(newText);
    }
  };

  // 複製文字功能
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("已複製！");
      // 2秒後清除狀態提示
      setTimeout(() => {
        setCopyStatus("");
      }, 2000);
    } catch (err) {
      setCopyStatus("複製失敗");
      setTimeout(() => {
        setCopyStatus("");
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl p-4">
      {/* 功能按鈕群組 */}
      <div className="flex gap-2">
        <button
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={spacingText}
          disabled={!panguLoaded}
        >
          自動調整間距
        </button>
        <button
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={copyText}
          disabled={!text}
        >
          複製文字
          {copyStatus && <span className="ml-2 text-sm">{copyStatus}</span>}
        </button>
      </div>

      {/* 文字編輯區域 */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-48 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="在此輸入文字..."
      />
    </div>
  );
};

export default Pangu;
