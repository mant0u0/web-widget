"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Quote, InsertQuoteFunction, defaultQuotes } from "./dataQuotes";
import { Plus, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const QuotationmMarks: React.FC<{
  insertQuote: InsertQuoteFunction;
}> = ({ insertQuote }) => {
  const [customQuotes, setCustomQuotes] = useState<Quote[]>([]);
  const [leftSymbol, setLeftSymbol] = useState("");
  const [rightSymbol, setRightSymbol] = useState("");
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editingLeft, setEditingLeft] = useState("");
  const [editingRight, setEditingRight] = useState("");

  // 新增自訂引號
  const addCustomQuote = useCallback(() => {
    // 判斷條件：只要左右符號其中一個有值就可以
    if (!leftSymbol.trim() && !rightSymbol.trim()) return;

    // 建立新的引號
    const newQuote: Quote = {
      symbol: leftSymbol + rightSymbol,
      name: `${leftSymbol || ""}${rightSymbol || ""}`,
      center: leftSymbol.length,
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

  // 編輯自訂引號
  const startEdit = useCallback((quote: Quote, index: number) => {
    setEditingIndex(index);
    const leftPart = quote.symbol.substring(0, quote.center);
    const rightPart = quote.symbol.substring(quote.center);
    setEditingLeft(leftPart);
    setEditingRight(rightPart);
  }, []);

  // 儲存編輯
  const saveEdit = useCallback(() => {
    // 修改編輯時的判斷條件：只要左右符號其中一個有值就可以
    if ((!editingLeft.trim() && !editingRight.trim()) || editingIndex === -1)
      return;

    setCustomQuotes((prev) =>
      prev.map((quote, index) => {
        if (index === editingIndex) {
          return {
            symbol: editingLeft + editingRight,
            name: `${editingLeft || ""}${editingRight || ""}`,
            center: editingLeft.length,
            editable: true,
          };
        }
        return quote;
      }),
    );

    setEditingIndex(-1);
    setEditingLeft("");
    setEditingRight("");
  }, [editingLeft, editingRight, editingIndex]);

  return (
    <div className="h-full w-full overflow-hidden pt-0">
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-xl border border-input bg-zinc-50">
        {/* 新增自訂引號 */}
        <div className="border-b bg-background p-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-background p-3 shadow-none"
              >
                <Plus />
                <p className="text-sm">自訂符號</p>
              </Button>
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
                <Button
                  onClick={addCustomQuote}
                  disabled={!leftSymbol && !rightSymbol}
                >
                  新增
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>

        {/* 引號列表 */}
        <ScrollArea className="h-full overflow-y-auto overflow-x-hidden">
          <p className="p-3 text-sm font-semibold">自訂引號</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,max-content))] gap-2 p-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="none"
                  className="flex h-full flex-col justify-start gap-1 p-0"
                >
                  <div className="flex h-16 w-full items-center justify-center rounded-md border border-input bg-white text-lg">
                    <Plus />
                  </div>
                  <p className="whitespace-normal text-sm">新增</p>
                </Button>
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
                  <Button
                    onClick={addCustomQuote}
                    disabled={!leftSymbol && !rightSymbol}
                  >
                    新增
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>

            {/* 自訂引號 */}
            {customQuotes.map((quote, index) => (
              <div key={`custom-${index}`} className="group relative w-full">
                <Button
                  variant="none"
                  className="flex h-full w-full flex-col justify-start gap-1 p-0"
                  onClick={() => insertQuote(quote)}
                >
                  <div className="flex h-16 w-full items-center justify-center rounded-md border border-input bg-white text-lg">
                    {quote.name.slice(0, quote.center)}{" "}
                    {quote.name.slice(quote.center)}
                  </div>
                  <p className="whitespace-normal text-sm">
                    {quote.name.slice(0, quote.center)}{" "}
                    {quote.name.slice(quote.center)}
                  </p>
                </Button>
                {/* 編輯項目按鈕 */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => startEdit(quote, index)}
                      variant="outline"
                      className="pointer-events-none absolute right-[-8px] top-[-8px] flex h-8 w-8 items-center justify-center rounded-full border border-input bg-background opacity-0 shadow-none transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100"
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
                          onClick={() => deleteCustomQuote(index)}
                          variant="destructive"
                          className="flex-1"
                        >
                          刪除
                        </Button>
                        <Button
                          onClick={saveEdit}
                          disabled={!editingLeft && !editingRight}
                          className="flex-1"
                        >
                          儲存
                        </Button>
                      </div>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
          {/* ----------------------- */}
          <p className="px-3 py-1 text-sm font-semibold">預設引號</p>
          {/* 預設引號 */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,max-content))] gap-2 p-3">
            {defaultQuotes.map((quote, index) => (
              <Button
                key={`default-${index}`}
                onClick={() => insertQuote(quote)}
                variant="none"
                className="flex h-full flex-col justify-start gap-1 p-0"
              >
                <div className="flex h-16 w-full items-center justify-center rounded-md border border-input bg-white text-lg">
                  {quote.symbol}
                </div>
                <p className="whitespace-normal text-sm">{quote.name}</p>
              </Button>
            ))}
          </div>

          <ScrollBar className="z-10" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default QuotationmMarks;
