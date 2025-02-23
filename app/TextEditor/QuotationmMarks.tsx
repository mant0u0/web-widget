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
    <div className="h-full w-full overflow-hidden p-2 pt-0">
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-xl border border-input bg-zinc-50">
        <ScrollArea className="h-full w-full">
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex">
                <Button
                  variant="outline"
                  className="text-md flex h-[48px] w-full animate-fade-in items-center justify-start rounded-none border-l-0 border-r-0 border-t-0"
                >
                  <div className="flex h-5 w-[24px] flex-none items-center justify-center">
                    <Plus />
                  </div>
                  <p className="text-sm">自訂符號</p>
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
                <Button
                  onClick={addCustomQuote}
                  disabled={!leftSymbol && !rightSymbol}
                >
                  新增
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
          {/* Custom Quotes */}
          {customQuotes.map((quote, index) => (
            <div key={`custom-${index}`} className="flex">
              <Button
                onClick={() => insertQuote(quote)}
                variant="outline"
                className="text-md flex h-[48px] w-full animate-fade-in items-center justify-start rounded-none border-l-0 border-r-0 border-t-0"
              >
                <span className="flex-1 text-left">
                  {quote.name.slice(0, quote.center)}
                  <span className="mx-1" />
                  {quote.name.slice(quote.center)}
                </span>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => startEdit(quote, index)}
                    variant="outline"
                    className="border-l-1 text-md flex h-11 animate-fade-in items-center justify-start rounded-none border-r-0 border-t-0"
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

          {/* Default Quotes */}
          {defaultQuotes.map((quote, index) => (
            <div key={`default-${index}`} className="flex">
              <Button
                onClick={() => insertQuote(quote)}
                variant="outline"
                className="text-md flex h-[48px] w-full animate-fade-in items-center justify-start rounded-none border-l-0 border-r-0 border-t-0"
              >
                <p className="h-5 w-[24px] flex-none text-center text-sm">
                  {quote.symbol}
                </p>
                <p className="flex-1 text-left text-sm">{quote.name}</p>
              </Button>
            </div>
          ))}

          <ScrollBar className="z-10" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default QuotationmMarks;
