import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight, CircleDashed } from "lucide-react";
import { SymbolItem, SymbolData } from "./types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// 每次載入的項目數量
const ITEMS_PER_BATCH = 20;

// 單個符號按鈕組件
const SymbolButton = ({
  item,
  onSelect,
  btnClassName,
}: {
  item: SymbolItem;
  onSelect: (item: SymbolItem) => void;
  btnClassName?: string;
}) => (
  <div className="group relative">
    <Button
      onClick={() => onSelect(item)}
      variant="outline"
      size="sm"
      className={
        "text-md flex h-10 animate-fade-in items-center justify-center " +
        btnClassName
      }
    >
      {item.symbol}
    </Button>
    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 h-auto -translate-x-1/2 transform whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
      {item.tags[0]}
    </div>
  </div>
);

// 可折疊的分類區塊組件
const LazyLoadSection = ({
  category,
  items,
  onSelect,
  btnClassName,
  defaultExpanded = true,
}: {
  category: string;
  items: SymbolItem[];
  onSelect: (item: SymbolItem) => void;
  btnClassName?: string;
  defaultExpanded?: boolean;
}) => {
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_BATCH);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleItems < items.length) {
          setVisibleItems((prev) =>
            Math.min(prev + ITEMS_PER_BATCH, items.length),
          );
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleItems, items.length]);

  return (
    <div className="">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="sticky left-0 top-0 z-10 flex w-full items-center gap-2 bg-zinc-50 px-3 py-3 text-left text-sm font-semibold transition-colors hover:bg-zinc-100"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <p className="">{category}</p>
        <span className="text-xs text-zinc-400">{items.length}</span>
      </button>
      <div
        className={`flex flex-wrap gap-1 ${
          isExpanded
            ? "p-3 opacity-100"
            : "h-0 overflow-hidden px-3 py-0 opacity-0"
        }`}
      >
        {items.slice(0, visibleItems).map((item) => (
          <SymbolButton
            key={item.symbol}
            item={item}
            onSelect={onSelect}
            btnClassName={btnClassName}
          />
        ))}
        {visibleItems < items.length && (
          <div ref={loadMoreRef} className="h-4" />
        )}
      </div>
    </div>
  );
};

// 主要的符號選擇器組件
export const SymbolPicker: React.FC<{
  data: SymbolData;
  onSelect: (symbol: string) => void;
  btnClassName?: string;
}> = ({ data, onSelect, btnClassName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentItems, setRecentItems] = useState<SymbolItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSymbolSelect = (item: SymbolItem) => {
    onSelect(item.symbol);
    setRecentItems((prev) => {
      if (prev.some((prevItem) => prevItem.symbol === item.symbol)) return prev;
      return [item, ...prev].slice(0, 20);
    });
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return data;

    const searchTerms = new Set(searchQuery.toLowerCase().split(/\s+/));
    const filtered: SymbolData = {};

    Object.entries(data).forEach(([category, { categoryTags, items }]) => {
      const categoryTagsLower = categoryTags.map((tag) => tag.toLowerCase());
      const categoryMatches = Array.from(searchTerms).some((term) =>
        categoryTagsLower.some((tag) => tag.includes(term)),
      );

      const matchedItems = items.filter((item) => {
        if (categoryMatches) return true;
        const itemTagsLower = item.tags.map((tag) => tag.toLowerCase());
        return (
          item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          itemTagsLower.some((tag) =>
            Array.from(searchTerms).some((term) => tag.includes(term)),
          )
        );
      });

      if (matchedItems.length > 0) {
        filtered[category] = {
          categoryTags,
          items: matchedItems,
        };
      }
    });

    return filtered;
  }, [searchQuery, data]);

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden border-input bg-zinc-50 p-0">
      <div className="border-b bg-background p-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="搜尋符號"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="h-full overflow-y-auto overflow-x-hidden">
        {!searchQuery && (
          <div className="">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="sticky left-0 top-0 z-10 flex w-full items-center gap-2 bg-zinc-50 px-3 py-3 text-left text-sm font-semibold transition-colors hover:bg-zinc-100"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <p className="">最近使用</p>
              <span className="text-xs text-zinc-400">
                {recentItems.length}
              </span>
            </button>
            <div
              className={`flex flex-wrap gap-1 ${
                isExpanded
                  ? "p-3 opacity-100"
                  : "h-0 overflow-hidden px-3 py-0 opacity-0"
              }`}
            >
              {recentItems.length > 0 ? (
                recentItems.map((item, index) => (
                  <SymbolButton
                    key={`${item.symbol}-${index}`}
                    item={item}
                    onSelect={handleSymbolSelect}
                    btnClassName={btnClassName}
                  />
                ))
              ) : (
                <div className="flex w-full items-center justify-center gap-2 text-sm text-zinc-400">
                  <CircleDashed className="h-5 w-4" />
                  沒有最近使用的符號
                </div>
              )}
            </div>
          </div>
        )}

        {Object.entries(filteredItems).map(([category, { items }]) => (
          <LazyLoadSection
            key={category}
            category={category}
            items={items}
            onSelect={handleSymbolSelect}
            btnClassName={btnClassName}
          />
        ))}

        <ScrollBar className="z-10" />
      </ScrollArea>
    </div>
  );
};
