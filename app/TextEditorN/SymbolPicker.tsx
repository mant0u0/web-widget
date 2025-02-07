import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
// import { SymbolItem, SymbolData } from "./types";

// 分批載入
const ITEMS_PER_BATCH = 100;

// 單個符號按鈕
const SymbolButton = ({
  item,
  onSelect,
  btnClassName,
}: {
  item: SymbolItem;
  onSelect: (item: SymbolItem) => void;
  btnClassName?: string;
}) => (
  <div className="relative group">
    <Button
      onClick={() => onSelect(item)}
      variant="outline"
      size="sm"
      className={
        "h-10 flex items-center justify-center text-xl animate-fade-in " +
        btnClassName
      }
    >
      {item.symbol}
    </Button>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
      {item.tags[0]}
    </div>
  </div>
);

// 分批載入
const LazyLoadSection = ({ category, items, onSelect, btnClassName }) => {
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_BATCH);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleItems < items.length) {
          setVisibleItems((prev) =>
            Math.min(prev + ITEMS_PER_BATCH, items.length)
          );
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleItems, items.length]);

  return (
    <div className="mb-4">
      <h3 className="sticky top-0 left-0 z-10 text-sm font-semibold mb-2 py-2 flex items-center gap-2 bg-zinc-50">
        {category}
      </h3>
      <div className="flex flex-wrap gap-1">
        {items.slice(0, visibleItems).map((item) => (
          <SymbolButton
            key={item.symbol}
            item={item}
            onSelect={onSelect}
            btnClassName={btnClassName}
          />
        ))}
      </div>
      {visibleItems < items.length && <div ref={loadMoreRef} className="h-4" />}
    </div>
  );
};

// 符號選擇器
export const SymbolPicker: React.FC<{
  data: SymbolData;
  onSelect: (symbol: string) => void;
  btnClassName?: string;
}> = ({ data, onSelect, btnClassName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentItems, setRecentItems] = useState([]);

  const handleSymbolSelect = (item) => {
    onSelect(item.symbol);
    setRecentItems((prev) => {
      if (prev.some((prevItem) => prevItem.symbol === item.symbol)) return prev;
      return [item, ...prev].slice(0, 20);
    });
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return data;

    const searchTerms = new Set(searchQuery.toLowerCase().split(/\s+/));
    const filtered = {};

    Object.entries(data).forEach(([category, { categoryTags, items }]) => {
      const categoryTagsLower = categoryTags.map((tag) => tag.toLowerCase());
      const categoryMatches = Array.from(searchTerms).some((term) =>
        categoryTagsLower.some((tag) => tag.includes(term))
      );

      const matchedItems = items.filter((item) => {
        if (categoryMatches) return true;
        const itemTagsLower = item.tags.map((tag) => tag.toLowerCase());
        return (
          item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          itemTagsLower.some((tag) =>
            Array.from(searchTerms).some((term) => tag.includes(term))
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
    <div className="w-full h-[600px] p-0 overflow-hidden rounded-md border border-input bg-zinc-50 flex flex-col">
      <div className="bg-background p-4 border-b">
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

      <div className="overflow-y-auto overflow-x-hidden h-full px-4">
        {recentItems.length > 0 && !searchQuery && (
          <div className="mb-4">
            <h3 className="sticky top-0 left-0 z-10 text-sm font-semibold mb-2 py-2.5 flex items-center gap-2 bg-zinc-50">
              最近使用
            </h3>
            <div className="flex flex-wrap gap-1">
              {recentItems.map((item, index) => (
                <SymbolButton
                  key={`${item.symbol}-${index}`}
                  item={item}
                  onSelect={handleSymbolSelect}
                  btnClassName={btnClassName}
                />
              ))}
            </div>
          </div>
        )}

        {/* 顯示符號 */}
        {Object.entries(filteredItems).map(([category, { items }]) => (
          <LazyLoadSection
            key={category}
            category={category}
            items={items}
            onSelect={handleSymbolSelect}
            btnClassName={btnClassName}
          />
        ))}
      </div>
    </div>
  );
};
