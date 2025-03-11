// Toolbar.tsx
import React, { useRef, useState, MouseEvent, WheelEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Type,
  Smile,
  Quote,
  ListOrdered,
  SpellCheck2,
  Search,
} from "lucide-react";
// 符號資料
import { dataSymbols } from "./dataSymbols";
import { dataEmoji } from "./dataEmoji";
import { dataKaomoji } from "./dataKaomoji";
// 元件
import { SymbolPicker } from "./SymbolPicker";
import { QuotationmMarks } from "./QuotationmMarks";
import { ParagraphMark } from "./ParagraphMark";
import { TextFormatter } from "./TextFormatter";
import { SearchReplace } from "./SearchReplace";

// 引號型別定義
type Quote = {
  symbol: string;
  name: string;
  center: number; // 游標位置
  editable?: boolean;
};

interface ToolbarProps {
  text: string;
  updateText: (newText: string) => void;
  insertSymbol: (symbol: string) => void;
  insertQuote: (quote: Quote) => void;
  transformSelectedText: (
    text: string,
    transformFn: (text: string) => string | Promise<string>,
    updateText: (newText: string) => void,
  ) => void;
  transformSelectedLine: (
    text: string,
    transformFn: (line: string) => string | Promise<string>,
    updateText: (newText: string) => void,
  ) => void;
}

export const Toolbar: React.FC<ToolbarProps> = React.memo(
  ({
    text,
    updateText,
    insertSymbol,
    insertQuote,
    transformSelectedText,
    transformSelectedLine,
  }) => {
    return (
      <Tabs
        defaultValue="插入符號"
        className="flex h-full w-full gap-2 overflow-hidden md:gap-3"
      >
        <TabsList className="no-scrollbar h-full flex-col items-start justify-start gap-1 overflow-y-auto overflow-x-hidden bg-transparent p-0">
          <TabsTrigger
            value="插入符號"
            className="h-[48px] w-[48px] flex-none gap-2 rounded-xl border border-transparent data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
          >
            {/* 插入符號 */}
            <Type className="w-6" />
          </TabsTrigger>

          <TabsTrigger
            value="插入 Emoji"
            className="h-[48px] w-[48px] flex-none gap-2 rounded-xl border border-transparent data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
          >
            {/* 插入 Emoji */}
            <Smile className="w-6" />
          </TabsTrigger>

          <TabsTrigger
            value="插入顏文字"
            className="flex-nonegap-2 h-[48px] w-[48px] flex-none rounded-xl border border-transparent data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
          >
            {/* 插入顏文字 */}
            <Smile className="w-6" />
          </TabsTrigger>

          <TabsTrigger
            value="插入引號"
            className="flex-nonegap-2 h-[48px] w-[48px] flex-none rounded-xl border border-transparent data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
          >
            {/* 插入引號 */}
            <Quote className="w-6" />
          </TabsTrigger>

          <TabsTrigger
            value="段落符號"
            className="flex-nonegap-2 h-[48px] w-[48px] flex-none rounded-xl border border-transparent data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
          >
            {/* 段落符號 */}
            <ListOrdered className="w-6" />
          </TabsTrigger>

          <TabsTrigger
            value="文字處理"
            className="flex-nonegap-2 h-[48px] w-[48px] flex-none rounded-xl border border-transparent data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
          >
            {/* 文字處理 */}
            <SpellCheck2 className="w-6" />
          </TabsTrigger>

          <TabsTrigger
            value="搜尋取代"
            className="flex-nonegap-2 h-[48px] w-[48px] flex-none rounded-xl border border-transparent data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
          >
            {/* 搜尋取代 */}
            <Search className="w-6" />
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="插入符號"
          className="mt-0 h-full w-full flex-1 overflow-y-auto"
        >
          <SymbolPicker
            data={dataSymbols}
            onSelect={insertSymbol}
            btnClassName="w-[48px] aspect-square overflow-hidden"
            listClassName="flex flex-wrap"
            pickerType="symbol" // 符號
          />
        </TabsContent>
        <TabsContent
          value="插入 Emoji"
          className="mt-0 h-full w-full flex-1 overflow-y-auto"
        >
          <SymbolPicker
            data={dataEmoji}
            onSelect={insertSymbol}
            btnClassName="w-[48px] aspect-square text-2xl overflow-hidden"
            listClassName="flex flex-wrap"
            pickerType="emoji" // Emoji
          />
        </TabsContent>
        <TabsContent
          value="插入顏文字"
          className="mt-0 h-full w-full flex-1 overflow-y-auto"
        >
          <SymbolPicker
            data={dataKaomoji}
            onSelect={insertSymbol}
            btnClassName="text-md overflow-hidden w-[full] max-w-full min-w-full"
            listClassName="grid grid-cols-2"
            pickerType="kaomoji" // 顏文字
          />
        </TabsContent>
        <TabsContent
          value="插入引號"
          className="mt-0 h-full w-full flex-1 overflow-y-auto"
        >
          <QuotationmMarks insertQuote={insertQuote} />
        </TabsContent>
        <TabsContent
          value="段落符號"
          className="mt-0 h-full w-full flex-1 overflow-y-auto"
        >
          <ParagraphMark
            transformSelectedLine={transformSelectedLine}
            text={text}
            updateText={updateText}
          />
        </TabsContent>
        <TabsContent
          value="文字處理"
          className="mt-0 h-full w-full flex-1 overflow-y-auto"
        >
          <TextFormatter
            transformSelectedText={transformSelectedText}
            text={text}
            updateText={updateText}
          />
        </TabsContent>
        <TabsContent
          value="搜尋取代"
          className="mt-0 h-full w-full flex-1 overflow-y-auto"
        >
          <SearchReplace text={text} updateText={updateText} />
        </TabsContent>
      </Tabs>
    );
  },
);

Toolbar.displayName = "Toolbar";
