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
    // 滑鼠
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // 滾動
    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    };

    // 滑鼠按下
    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
      setIsMouseDown(true);
      const slider = scrollContainerRef.current;
      if (slider) {
        const startPosition = e.pageX - slider.offsetLeft;
        setStartX(startPosition);
        setScrollLeft(slider.scrollLeft);
      }
    };

    // 滑鼠移動
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const slider = scrollContainerRef.current;
      if (slider) {
        const x = e.pageX - slider.offsetLeft;
        const distance = x - startX;
        slider.scrollLeft = scrollLeft - distance;
      }
    };

    // 滑鼠放開
    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    return (
      <Tabs
        defaultValue="插入符號"
        className="flex h-full w-full flex-col overflow-hidden"
      >
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative top-0 z-0 cursor-grab select-none overflow-x-scroll py-2 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] md:pt-0"
          // [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)]
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <div className="flex cursor-grab select-none">
            <TabsList className="h-10 gap-2 bg-transparent p-0">
              <TabsTrigger
                value="插入符號"
                className="rounded- h-full cursor-grab gap-2 border border-transparent px-4 data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
              >
                <Type className="w-4" />
                <p className="whitespace-nowrap text-sm">插入符號</p>
              </TabsTrigger>
              <TabsTrigger
                value="插入 Emoji"
                className="rounded- h-full cursor-grab gap-2 border border-transparent px-4 data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
              >
                <Smile className="w-4" />
                <p className="whitespace-nowrap text-sm">插入 Emoji</p>
              </TabsTrigger>
              <TabsTrigger
                value="插入顏文字"
                className="rounded- h-full cursor-grab gap-2 border border-transparent px-4 data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
              >
                <Smile className="w-4" />
                <p className="whitespace-nowrap text-sm">插入顏文字</p>
              </TabsTrigger>
              <TabsTrigger
                value="插入引號"
                className="rounded- h-full cursor-grab gap-2 border border-transparent px-4 data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
              >
                <Quote className="w-4" />
                <p className="whitespace-nowrap text-sm">插入引號</p>
              </TabsTrigger>
              <TabsTrigger
                value="段落符號"
                className="rounded- h-full cursor-grab gap-2 border border-transparent px-4 data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
              >
                <ListOrdered className="w-4" />
                <p className="whitespace-nowrap text-sm">段落符號</p>
              </TabsTrigger>
              <TabsTrigger
                value="文字處理"
                className="rounded- h-full cursor-grab gap-2 border border-transparent px-4 data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
              >
                <SpellCheck2 className="w-4" />
                <p className="whitespace-nowrap text-sm">文字處理</p>
              </TabsTrigger>
              <TabsTrigger
                value="搜尋取代"
                className="rounded- h-full cursor-grab gap-2 border border-transparent px-4 data-[state=active]:border data-[state=active]:border-input data-[state=active]:shadow-sm"
              >
                <Search className="w-4" />
                <p className="whitespace-nowrap text-sm">搜尋取代</p>
              </TabsTrigger>
              <div className="w-10"></div>
            </TabsList>
          </div>
        </div>

        <TabsContent
          value="插入符號"
          className="mt-0 h-full w-full flex-1 overflow-y-auto"
        >
          <SymbolPicker
            data={dataSymbols}
            onSelect={insertSymbol}
            btnClassName="w-[44px] h-[48px] noto-sans-font overflow-hidden"
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
            btnClassName="w-[44px] h-[48px] emoji-font text-2xl overflow-hidden"
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
            btnClassName="emoji-font text-md overflow-hidden"
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
