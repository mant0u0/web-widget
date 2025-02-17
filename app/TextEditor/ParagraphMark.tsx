"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type TransformFunction = (text: string) => string;

interface ParagraphMarkProps {
  transformSelectedLine: (
    text: string,
    transformer: TransformFunction,
    updateText: (text: string) => void,
  ) => void;
  text: string;
  updateText: (text: string) => void;
}

export const ParagraphMark: React.FC<ParagraphMarkProps> = ({
  transformSelectedLine,
  text,
  updateText,
}) => {
  const [includeEmptyLines, setIncludeEmptyLines] = useState(true);
  const [customSymbols, setCustomSymbols] = useState<PrefixSymbol[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [editingSymbol, setEditingSymbol] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  // 在選取的行首插入符號
  const insertPrefix = useCallback(
    (prefixConfig: PrefixSymbol) => {
      let currentNumber = 1;

      const transformLine = (line: string): string => {
        if (!line.trim() && !includeEmptyLines) {
          return line;
        }

        switch (prefixConfig.type) {
          case "repeat": {
            return `${prefixConfig.symbol}${line}`;
          }
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
    [text, updateText, includeEmptyLines, transformSelectedLine],
  );

  // 檢查並移除行首前綴
  const removePrefix = useCallback(
    (prefixConfig: PrefixSymbol) => {
      const transformLine = (line: string): string => {
        if (!line.trim()) {
          return line;
        }

        switch (prefixConfig.type) {
          case "repeat": {
            if (line.startsWith(prefixConfig.symbol)) {
              return line.slice(prefixConfig.symbol.length);
            }
            return line;
          }
          case "format": {
            if (!prefixConfig.format) return line;
            const formatRegex =
              prefixConfig.format === "nn. " ? /^\d{2}\. / : /^\d+\. /;
            return line.replace(formatRegex, "");
          }
          case "order": {
            if (!prefixConfig.order) return line;
            for (const prefix of prefixConfig.order) {
              if (line.startsWith(prefix)) {
                return line.slice(prefix.length);
              }
            }
            const numberPrefixRegex = /^\d+\. /;
            return line.replace(numberPrefixRegex, "");
          }
          default:
            return line;
        }
      };

      transformSelectedLine(text, transformLine, updateText);
    },
    [text, updateText, transformSelectedLine],
  );

  // 新增自訂符號
  const addCustomSymbol = useCallback(() => {
    if (!newSymbol.trim()) return;

    const newCustomSymbol: PrefixSymbol = {
      symbol: newSymbol,
      name: newSymbol,
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
      }),
    );

    setEditingSymbol("");
    setEditingIndex(-1);
  }, [editingSymbol, editingIndex]);

  // 刪除自訂符號
  const deleteCustomSymbol = useCallback((index: number) => {
    setCustomSymbols((prev) => prev.filter((_, i) => i !== index));
    setEditingSymbol("");
    setEditingIndex(-1);
  }, []);

  return (
    <ScrollArea className="h-full w-full">
      <Label className="text-md flex h-[48px] w-full cursor-pointer items-center justify-start gap-1 border-b border-input bg-background p-4 hover:bg-accent">
        <div className="flex h-5 w-[24px] flex-none items-center justify-center">
          <Checkbox
            id="terms"
            checked={includeEmptyLines}
            onCheckedChange={(checked: boolean) =>
              setIncludeEmptyLines(checked)
            }
          />
        </div>
        <p className="ml-1 text-sm">包含空白行</p>
      </Label>

      <Dialog>
        <DialogTrigger asChild>
          <div className="flex">
            <Button
              variant="outline"
              className="text-md flex h-[44px] w-full animate-fade-in items-center justify-start rounded-none border-l-0 border-r-0 border-t-0"
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

      {/* 自訂符號區域 */}
      {customSymbols.map((symbol, index) => (
        <div key={`custom-${index}`} className="flex">
          <Button
            onClick={() => insertPrefix(symbol)}
            variant="outline"
            className="text-md flex h-[48px] w-full animate-fade-in items-center justify-start rounded-none border-l-0 border-r-0 border-t-0"
          >
            <span className="h-5 w-[24px] flex-none truncate text-center">
              {symbol.symbol}
            </span>
            <p className="text-sm">{symbol.name}</p>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                onClick={() => startEdit(symbol, index)}
                variant="outline"
                className="border-l-1 text-md flex h-[48px] animate-fade-in items-center justify-start rounded-none border-r-0 border-t-0"
              >
                <Pencil className="h-5 w-[24px] text-center" />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>編輯自訂符號</DialogTitle>
              </DialogHeader>

              <div className="grid gap-2 py-4">
                <p className="text-sm text-muted-foreground">請輸入自訂符號</p>
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
                    onClick={() => deleteCustomSymbol(index)}
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

          <Button
            onClick={() => removePrefix(symbol)}
            variant="outline"
            className="border-l-1 flex h-[48px] animate-fade-in items-center justify-start rounded-none border-r-0 border-t-0"
          >
            <PilcrowLeft className="h-5 w-[24px] text-center" />
          </Button>
        </div>
      ))}

      {/* 預設符號區域 */}
      {prefixSymbols.map((symbol, index) => (
        <div key={`default-${index}`} className="flex">
          <Button
            onClick={() => insertPrefix(symbol)}
            variant="outline"
            className="text-md flex h-[48px] w-full animate-fade-in items-center justify-start rounded-none border-l-0 border-r-0 border-t-0"
          >
            <span className="h-5 w-[24px] flex-none text-center">
              {symbol.symbol}
            </span>
            <p className="text-sm">{symbol.name}</p>
          </Button>

          <Button
            onClick={() => removePrefix(symbol)}
            variant="outline"
            className="border-l-1 text-md flex h-[48px] animate-fade-in items-center justify-start rounded-none border-r-0 border-t-0"
          >
            <PilcrowLeft className="h-5 w-[24px] text-center" />
          </Button>
        </div>
      ))}
    </ScrollArea>
  );
};

export default ParagraphMark;
