"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PrefixSymbol, prefixSymbols } from "./dataPrefixSymbols";
import {
  Plus,
  Pencil,
  PilcrowLeft,
  PilcrowRight,
  CircleDashed,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="h-full w-full overflow-hidden pt-0">
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-xl border border-input bg-zinc-50">
        <div className="flex items-center justify-between border-b bg-background p-3">
          {/* 新增自訂符號 */}
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
              <p className="text-sm font-medium leading-6 text-gray-700">
                可於每行的開頭新增該自訂符號；符號新增後，可於編輯區域「選取文字」新增該自訂符號。
              </p>
              <Input
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="輸入自訂符號"
                className="w-full"
              />

              <DialogClose asChild>
                <Button size="lg" onClick={addCustomSymbol}>
                  <Plus />
                  新增
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          {/* 包含空白行 */}
          <div className="flex h-[36px] overflow-hidden rounded-md border border-input">
            <Label className="flex cursor-pointer items-center gap-1 px-3 py-2">
              <Checkbox
                id="terms"
                checked={includeEmptyLines}
                onCheckedChange={(checked: boolean) =>
                  setIncludeEmptyLines(checked)
                }
              />
              <p className="ml-1 text-sm">包含空行</p>
            </Label>

            {/* 空白字元縮排 */}
            <Button
              onClick={() =>
                removePrefix({
                  symbol: " ",
                  name: "半形空格",
                  type: "repeat",
                  editable: false,
                })
              }
              variant="outline"
              className="rounded-none border-b-0 border-r-0 border-t-0 bg-background p-3 shadow-none"
            >
              <PilcrowLeft />
            </Button>
            <Button
              onClick={() =>
                insertPrefix({
                  symbol: " ",
                  name: "半形空格",
                  type: "repeat",
                  editable: false,
                })
              }
              variant="outline"
              className="rounded-none border-b-0 border-r-0 border-t-0 bg-background p-3 shadow-none"
            >
              <PilcrowRight />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-full overflow-y-auto overflow-x-hidden">
          <p className="px-3 py-1 pt-3 text-sm font-semibold">自訂符號</p>

          {/* 自訂符號區域 */}
          {customSymbols.length !== 0 && (
            <div className="grid grid-cols-2 gap-2 p-3">
              {customSymbols.map((symbol, index) => (
                <div key={`custom-${index}`} className="group relative w-full">
                  <Button
                    variant="none"
                    className="flex h-full w-full flex-col justify-start gap-1 p-0"
                    onClick={() => insertPrefix(symbol)}
                  >
                    <div className="flex h-16 w-full items-center justify-center rounded-md border border-input bg-white text-lg">
                      <p className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {symbol.symbol}
                      </p>
                    </div>
                    <p className="line-clamp-1 max-w-[120px] whitespace-normal text-sm">
                      {symbol.name}
                    </p>
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => startEdit(symbol, index)}
                        variant="outline"
                        className="pointer-events-none absolute right-[-4px] top-[-4px] flex h-8 w-8 items-center justify-center rounded-full border border-input bg-background opacity-0 shadow-none transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100"
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
                </div>
              ))}
            </div>
          )}
          {customSymbols.length === 0 && (
            <div className="flex w-full items-center justify-center gap-2 p-6 text-sm text-zinc-400">
              <CircleDashed className="h-5 w-4" />
              目前沒有自訂符號
            </div>
          )}

          <p className="px-3 py-1 text-sm font-semibold">預設符號</p>
          <div className="grid gap-2 p-3 sm:grid-cols-3">
            {/* 預設符號區域 */}
            {prefixSymbols.map((symbol, index) => (
              <div key={`default-${index}`} className="group relative w-full">
                <Button
                  variant="none"
                  className="flex h-full w-full flex-col justify-start gap-1 p-0"
                  onClick={() => insertPrefix(symbol)}
                >
                  <div className="flex h-16 w-full items-center justify-center rounded-md border border-input bg-white text-lg">
                    <p className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {symbol.symbol}
                    </p>
                  </div>
                  <p className="line-clamp-1 max-w-[120px] whitespace-normal text-sm">
                    {symbol.name}
                  </p>
                </Button>

                <Button
                  onClick={() => removePrefix(symbol)}
                  variant="outline"
                  className="pointer-events-none absolute right-[-4px] top-[-4px] flex h-8 w-8 items-center justify-center rounded-full border border-input bg-background opacity-0 shadow-none transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100"
                >
                  <PilcrowLeft className="h-5 w-[24px] text-center" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ParagraphMark;
