// types.ts
export type SymbolItem = {
  symbol: string;
  tags: string[];
};

export type CategoryData = {
  categoryTags: string[];
  items: SymbolItem[];
};

export type SymbolData = {
  [category: string]: CategoryData;
};

// SymbolPicker.tsx
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, History } from "lucide-react";
// import { SymbolItem, SymbolData } from "./types";

const SymbolButton = ({
  item,
  onSelect,
}: {
  item: SymbolItem;
  onSelect: (item: SymbolItem) => void;
}) => (
  <div className="relative group">
    <Button
      onClick={() => onSelect(item)}
      variant="outline"
      size="sm"
      className="h-10 flex items-center justify-center text-xl"
    >
      {item.symbol}
    </Button>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-2 pointer-events-none">
      {item.tags[0]}
    </div>
  </div>
);

export const SymbolPicker: React.FC<{
  data: SymbolData;
  onSelect: (symbol: string) => void;
}> = ({ data, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentItems, setRecentItems] = useState<SymbolItem[]>([]);

  const handleSymbolSelect = (item: SymbolItem) => {
    onSelect(item.symbol);
    setRecentItems((prev) => {
      if (prev.some((prevItem) => prevItem.symbol === item.symbol)) return prev;
      return [item, ...prev].slice(0, 20);
    });
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return data;

    const searchLower = searchQuery.toLowerCase();
    const filtered: SymbolData = {};

    Object.entries(data).forEach(([category, { categoryTags, items }]) => {
      const categoryMatches = categoryTags.some((tag) =>
        tag.toLowerCase().includes(searchLower)
      );

      const matchedItems = items.filter(
        (item) =>
          item.symbol.includes(searchQuery) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );

      if (categoryMatches || matchedItems.length > 0) {
        filtered[category] = {
          categoryTags,
          items: categoryMatches ? items : matchedItems,
        };
      }
    });

    return filtered;
  }, [searchQuery, data]);

  return (
    <div className="w-full max-h-96 overflow-y-auto overflow-x-hidden p-0 border border-gray-950 bg-zinc-50 z-40">
      <div className="sticky top-0 left-0 bg-background p-4 border-b z-10">
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

      <div className="p-4">
        {recentItems.length > 0 && !searchQuery && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center">
              <History className="h-4 w-4 mr-1" />
              最近使用
            </h3>
            <div className="flex flex-wrap gap-1">
              {recentItems.map((item, index) => (
                <SymbolButton
                  key={`${item.symbol}-${index}`}
                  item={item}
                  onSelect={handleSymbolSelect}
                />
              ))}
            </div>
          </div>
        )}

        {Object.entries(filteredItems).map(([category, { items }]) => (
          <div key={category} className="mb-4">
            <h3 className="sticky top-0 left-0 text-sm font-semibold mb-2 flex items-center gap-2">
              {category}
            </h3>
            <div className="flex flex-wrap gap-1">
              {items.map((item) => (
                <SymbolButton
                  key={item.symbol}
                  item={item}
                  onSelect={handleSymbolSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
