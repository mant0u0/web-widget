"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// 引號資料
import { defaultQuotes } from "./dataQuotes";

import { Plus, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export const QuotationmMarks: React.FC<{
  insertQuote;
  text;
}> = ({ insertQuote, text }) => {
  // 自訂引號狀態
  const [customQuotes, setCustomQuotes] = useState<Quote[]>([]);
  const [leftSymbol, setLeftSymbol] = useState("");
  const [rightSymbol, setRightSymbol] = useState("");

  // 編輯相關的狀態
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editingLeft, setEditingLeft] = useState("");
  const [editingRight, setEditingRight] = useState("");

  // 新增自訂引號
  const addCustomQuote = useCallback(() => {
    if (!leftSymbol.trim() || !rightSymbol.trim()) return;

    const newQuote: Quote = {
      symbol: leftSymbol + rightSymbol,
      name: `${leftSymbol}${rightSymbol}`,
      center: leftSymbol.length, // 使用左側符號的長度作為游標位置
      editable: true,
    };

    setCustomQuotes((prev) => [...prev, newQuote]);
    setLeftSymbol("");
    setRightSymbol("");
  }, [leftSymbol, rightSymbol]);

  // 刪除自訂引號
  const deleteCustomQuote = useCallback((index: number) => {
    setCustomQuotes((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex(-1);
  }, []);

  // 開始編輯時的處理
  const startEdit = useCallback(
    (quote: Quote, index: number) => {
      const quoteIndex = index - defaultQuotes.length;
      setEditingIndex(quoteIndex);

      // 分割現有的符號為左右部分
      const leftPart = quote.symbol.substring(0, quote.center);
      const rightPart = quote.symbol.substring(quote.center);

      setEditingLeft(leftPart);
      setEditingRight(rightPart);
    },
    [defaultQuotes.length]
  );

  // 儲存編輯
  const saveEdit = useCallback(() => {
    if (!editingLeft.trim() || !editingRight.trim() || editingIndex === -1)
      return;

    setCustomQuotes((prev) =>
      prev.map((quote, index) => {
        if (index === editingIndex) {
          return {
            symbol: editingLeft + editingRight,
            name: `${editingLeft}${editingRight}`,
            center: editingLeft.length,
            editable: true,
          };
        }
        return quote;
      })
    );

    // 重置編輯狀態
    setEditingIndex(-1);
    setEditingLeft("");
    setEditingRight("");
  }, [editingLeft, editingRight, editingIndex]);

  // 組合所有引號
  const allQuotes = [...customQuotes, ...defaultQuotes];

  return (
    <div className="w-full h-[600px] p-0 overflow-y-auto overflow-x-hidden pb-5 rounded-md border border-input bg-zinc-50 flex flex-col">
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex">
            <Button
              variant="outline"
              className="flex justify-start items-center h-[44px] w-full rounded-none border-l-0 border-r-0 border-t-0 text-md animate-fade-in"
            >
              <div className="h-5 w-[24px] flex-none flex justify-center items-center">
                <Plus />
              </div>
              <p>自訂符號</p>
            </Button>
          </div>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增自訂符號</DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 py-4">
            <Input
              value={leftSymbol}
              onChange={(e) => setLeftSymbol(e.target.value)}
              placeholder="輸入左側符號"
              className="w-full"
            />
            <Input
              value={rightSymbol}
              onChange={(e) => setRightSymbol(e.target.value)}
              placeholder="輸入右側符號"
              className="w-full"
            />
          </div>

          <DialogClose asChild>
            <Button onClick={addCustomQuote}>新增</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {allQuotes.map((quote, index) => (
        <div key={quote.name} className="flex">
          {/* 預設 */}
          {!quote.editable && (
            <Button
              onClick={() => insertQuote(quote)}
              variant="outline"
              className="flex justify-start items-center h-[44px] w-full rounded-none border-l-0 border-r-0 border-t-0 text-md animate-fade-in"
            >
              <span className="h-5 w-[24px] flex-none text-center">
                {quote.symbol}
              </span>
              <span>{quote.name}</span>
            </Button>
          )}
          {/* 自訂 */}
          {quote.editable && (
            <Button
              onClick={() => insertQuote(quote)}
              variant="outline"
              className="flex justify-start items-center h-[44px] w-full rounded-none border-l-0 border-r-0 border-t-0 text-md animate-fade-in"
            >
              <span>
                {quote.name.slice(0, quote.center) +
                  "　" +
                  quote.name.slice(quote.center)}
              </span>
            </Button>
          )}
          {/* 編輯 */}
          {quote.editable && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() => startEdit(quote, index)}
                  variant="outline"
                  className="flex justify-start items-center h-11 rounded-none border-l-1 border-r-0 border-t-0 text-md animate-fade-in"
                >
                  <Pencil className="h-5 w-[24px] text-center" />
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>編輯自訂符號</DialogTitle>
                </DialogHeader>

                <div className="flex gap-4 py-4">
                  <Input
                    value={editingLeft}
                    onChange={(e) => setEditingLeft(e.target.value)}
                    placeholder="輸入左側符號"
                    className="w-full"
                  />
                  <Input
                    value={editingRight}
                    onChange={(e) => setEditingRight(e.target.value)}
                    placeholder="輸入右側符號"
                    className="w-full"
                  />
                </div>

                <DialogClose asChild>
                  <div className="flex w-full gap-2">
                    <Button
                      onClick={() =>
                        deleteCustomQuote(index - defaultQuotes.length)
                      }
                      variant="destructive"
                      className="flex-1"
                    >
                      刪除
                    </Button>
                    <Button onClick={saveEdit} className="flex-1">
                      儲存
                    </Button>
                  </div>
                </DialogClose>
              </DialogContent>
            </Dialog>
          )}
        </div>
      ))}
    </div>
  );
};
