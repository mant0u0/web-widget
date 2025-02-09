"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
// 行首符號設定
import { PrefixSymbol, prefixSymbols } from "./dataPrefixSymbols";

import { Plus, Pencil, PilcrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type TransformFunction = (text: string) => string;

interface ParagraphMarkProps {
  transformSelectedLine: (
    text: string,
    transformer: TransformFunction,
    updateText: (text: string) => void
  ) => void;
  text: string;
  updateText: (text: string) => void;
}

export const ParagraphMark: React.FC<ParagraphMarkProps> = ({
  transformSelectedLine,
  text,
  updateText,
}) => {
  // 首行加入符號功能：設定是否包含空行
  const [includeEmptyLines, setIncludeEmptyLines] = useState(true);

  // 自訂符號的狀態管理
  const [customSymbols, setCustomSymbols] = useState<PrefixSymbol[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [editingSymbol, setEditingSymbol] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  // ===============================================

  // 在選取的行首插入符號
  const insertPrefix = useCallback(
    (prefixConfig: PrefixSymbol) => {
      let currentNumber = 1;

      const transformLine = (line: string): string => {
        // 如果是空行且不包含空行，直接返回
        if (!line.trim() && !includeEmptyLines) {
          return line;
        }

        // 根據不同的前綴類型處理
        switch (prefixConfig.type) {
          // 重複符號
          case "repeat": {
            return `${prefixConfig.symbol}${line}`;
          }
          // 數字列表
          case "format": {
            if (!prefixConfig.format) return line;

            let formattedNumber: string;
            if (prefixConfig.format === "nn. ") {
              formattedNumber = String(currentNumber).padStart(2, "0");
            } else {
              formattedNumber = String(currentNumber);
            }

            const prefix = prefixConfig.format.replace(/n+/g, formattedNumber);
            currentNumber++;
            return `${prefix}${line}`;
          }

          // 有序符號
          case "order": {
            if (!prefixConfig.order) return line;

            const prefix =
              currentNumber <= prefixConfig.order.length
                ? prefixConfig.order[currentNumber - 1]
                : `${currentNumber}. `;
            currentNumber++;
            return `${prefix}${line}`;
          }

          default:
            return line;
        }
      };

      transformSelectedLine(text, transformLine, updateText);
    },
    [text, updateText, includeEmptyLines]
  );

  // 檢查並移除行首前綴
  const removePrefix = useCallback(
    (prefixConfig: PrefixSymbol) => {
      const transformLine = (line: string): string => {
        // 如果是空行，直接返回
        if (!line.trim()) {
          return line;
        }

        // 根據不同的前綴類型處理
        switch (prefixConfig.type) {
          // 重複符號
          case "repeat": {
            if (line.startsWith(prefixConfig.symbol)) {
              return line.slice(prefixConfig.symbol.length);
            }
            return line;
          }

          // 數字列表
          case "format": {
            if (!prefixConfig.format) return line;
            // 根據格式創建正則表達式
            const formatRegex =
              prefixConfig.format === "nn. "
                ? /^\d{2}\. / // 匹配 "01. ", "02. " 等
                : /^\d+\. /; // 匹配 "1. ", "2. " 等

            return line.replace(formatRegex, "");
          }

          // 有序符號
          case "order": {
            if (!prefixConfig.order) return line;

            // 檢查是否以任何有序符號開始
            for (const prefix of prefixConfig.order) {
              if (line.startsWith(prefix)) {
                return line.slice(prefix.length);
              }
            }

            // 檢查數字格式（超出 order 陣列範圍時使用的格式）
            const numberPrefixRegex = /^\d+\. /;
            return line.replace(numberPrefixRegex, "");
          }

          default:
            return line;
        }
      };

      transformSelectedLine(text, transformLine, updateText);
    },
    [text, updateText]
  );
  // 新增自訂符號
  const addCustomSymbol = useCallback(() => {
    if (!newSymbol.trim()) return;

    const newCustomSymbol: PrefixSymbol = {
      symbol: newSymbol,
      name: newSymbol, // 使用相同的值
      type: "repeat",
      editable: true,
    };

    setCustomSymbols((prev) => [...prev, newCustomSymbol]);
    setNewSymbol("");
  }, [newSymbol]);

  // 開始編輯符號
  const startEdit = useCallback((symbol: PrefixSymbol, index: number) => {
    setEditingSymbol(symbol.symbol);
    setEditingIndex(index);
  }, []);

  // 儲存編輯的符號
  const saveEdit = useCallback(() => {
    if (!editingSymbol.trim() || editingIndex === -1) return;

    setCustomSymbols((prev) =>
      prev.map((symbol, index) => {
        if (index === editingIndex) {
          return {
            ...symbol,
            symbol: editingSymbol,
            name: editingSymbol,
          };
        }
        return symbol;
      })
    );

    // 重置編輯狀態
    setEditingSymbol("");
    setEditingIndex(-1);
  }, [editingSymbol, editingIndex]);

  // 刪除自訂符號
  const deleteCustomSymbol = useCallback((index: number) => {
    setCustomSymbols((prev) => prev.filter((_, i) => i !== index));
    // 重置編輯狀態
    setEditingSymbol("");
    setEditingIndex(-1);
  }, []);

  // 組合所有符號
  const allSymbols = [...customSymbols, ...prefixSymbols];

  return (
    <div className="w-full h-[600px] p-0 overflow-y-auto overflow-x-hidden pb-5 rounded-md border border-input bg-zinc-50 flex flex-col">
      {/* 包含空白行 */}
      <Label className="flex justify-start items-center w-full bg-background text-md p-4 gap-1 h-[44px]  border-input border-b cursor-pointer hover:bg-accent">
        <div className="h-5 w-[24px]  flex-none flex justify-center items-center">
          <Checkbox
            id="terms"
            checked={includeEmptyLines}
            // onCheckedChange={(checked) => setIncludeEmptyLines(checked)}
            onCheckedChange={(checked: boolean) =>
              setIncludeEmptyLines(checked)
            }
          />
        </div>
        <p className="ml-1">包含空白行</p>
      </Label>

      {/* 自訂符號 */}
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

          <div className="grid gap-4 py-4">
            <Input
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="輸入自訂符號"
              className="w-full"
            />
          </div>

          <DialogClose asChild>
            <Button onClick={addCustomSymbol}>新增</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* 所有符號 */}
      {allSymbols.map((symbol, index) => (
        <div key={symbol.name} className="flex">
          <Button
            onClick={() => insertPrefix(symbol)}
            variant="outline"
            className="flex justify-start items-center h-[44px] w-full rounded-none border-l-0 border-r-0 border-t-0 text-md animate-fade-in"
          >
            <span
              className={`h-5 w-[24px] flex-none text-center ${
                symbol.editable ? "truncate" : ""
              }`}
            >
              {symbol.symbol}
            </span>
            <p>{symbol.name}</p>
          </Button>

          {/* 編輯縮排 */}
          {symbol.editable && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() =>
                    startEdit(symbol, index - prefixSymbols.length)
                  }
                  variant="outline"
                  className="flex justify-start items-center h-11 rounded-none  border-l-1 border-r-0 border-t-0 text-md animate-fade-in"
                >
                  <Pencil className="h-5 w-[24px] text-center" />
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>編輯自訂符號</DialogTitle>
                </DialogHeader>

                <div className="grid gap-2 py-4">
                  <p className="text-sm text-muted-foreground">
                    請輸入自訂符號
                  </p>
                  <Input
                    value={editingSymbol}
                    onChange={(e) => setEditingSymbol(e.target.value)}
                    placeholder="輸入自訂符號"
                    className="w-full"
                  />
                </div>

                <DialogClose asChild>
                  <div className="flex w-full gap-2">
                    <Button
                      onClick={() => deleteCustomSymbol(editingIndex)}
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
          {/* 刪除縮排 */}
          <Button
            onClick={() => removePrefix(symbol)}
            variant="outline"
            className="flex justify-start items-center h-11 rounded-none  border-l-1 border-r-0 border-t-0 text-md animate-fade-in"
          >
            <PilcrowLeft className="h-5 w-[24px] text-center" />
          </Button>
        </div>
      ))}
    </div>
  );
};
