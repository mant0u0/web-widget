import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { SymbolItem, SymbolData } from "./types";

// 每次載入的項目數量
const ITEMS_PER_BATCH = 20;

/**
 * 單個符號按鈕組件
 * @param item - 符號項目資料
 * @param onSelect - 選擇符號時的回調函數
 * @param btnClassName - 自定義按鈕樣式
 */

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
    {/* 符號按鈕 */}
    <Button
      onClick={() => onSelect(item)}
      variant="outline"
      size="sm"
      className={
        "h-10 flex items-center justify-center text-md animate-fade-in " +
        btnClassName
      }
    >
      {item.symbol}
    </Button>
    {/* 懸停時顯示的提示框 */}
    <div className="absolute bottom-full h-auto left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
      {item.tags[0]}
    </div>
  </div>
);

/**
 * 可折疊的分類區塊組件，支持懶加載
 * @param category - 分類名稱
 * @param items - 該分類下的符號項目
 * @param onSelect - 選擇符號時的回調函數
 * @param btnClassName - 自定義按鈕樣式
 */
const LazyLoadSection = ({
  category,
  items,
  onSelect,
  btnClassName,
}: {
  category: string;
  items: SymbolItem[];
  onSelect: (item: SymbolItem) => void;
  btnClassName?: string;
}) => {
  // 控制已顯示的項目數量
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_BATCH);
  // 控制分類的展開/摺疊狀態
  const [isExpanded, setIsExpanded] = useState(true);
  // 用於觀察加載更多的觸發點
  const loadMoreRef = useRef(null);

  // 設置 Intersection Observer 用於懶加載
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 當觀察點進入視窗且還有更多項目時，增加顯示數量
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

    // 清理 observer
    return () => observer.disconnect();
  }, [visibleItems, items.length]);

  return (
    <div className="">
      {/* 可點擊的分類標題 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="sticky top-0 left-0 z-10 w-full text-left text-sm font-semibold py-3 px-3 flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100 transition-colors"
      >
        {/* 展開/摺疊狀態指示器 */}
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <p className="">{category}</p>

        {/* 符號數量 */}
        <span className="text-xs text-zinc-400">{items.length}</span>
      </button>
      {/* 符號列表容器，帶有展開/摺疊動畫 */}
      <div
        className={`flex flex-wrap gap-1 ${
          isExpanded
            ? "opacity-100 p-3"
            : "opacity-0 h-0 overflow-hidden px-3 py-0"
        }`}
      >
        {/* 渲染可見的符號按鈕 */}
        {items.slice(0, visibleItems).map((item) => (
          <SymbolButton
            key={item.symbol}
            item={item}
            onSelect={onSelect}
            btnClassName={btnClassName}
          />
        ))}
        {/* 懶加載觸發點 */}
        {visibleItems < items.length && (
          <div ref={loadMoreRef} className="h-4" />
        )}
      </div>
    </div>
  );
};

/**
 * 主要的符號選擇器組件
 * @param data - 符號數據
 * @param onSelect - 選擇符號時的回調函數
 * @param btnClassName - 自定義按鈕樣式
 */
export const SymbolPicker: React.FC<{
  data: SymbolData;
  onSelect: (symbol: string) => void;
  btnClassName?: string;
}> = ({ data, onSelect, btnClassName }) => {
  // 搜尋查詢
  const [searchQuery, setSearchQuery] = useState("");
  // 最近使用的符號
  const [recentItems, setRecentItems] = useState<SymbolItem[]>([]);

  /**
   * 處理符號選擇事件
   * 選擇符號時更新最近使用列表
   */
  const handleSymbolSelect = (item: SymbolItem) => {
    onSelect(item.symbol);
    setRecentItems((prev) => {
      if (prev.some((prevItem) => prevItem.symbol === item.symbol)) return prev;
      return [item, ...prev].slice(0, 20);
    });
  };

  /**
   * 根據搜尋條件過濾符號
   * 使用 useMemo 優化性能
   */
  const filteredItems = useMemo(() => {
    if (!searchQuery) return data;

    const searchTerms = new Set(searchQuery.toLowerCase().split(/\s+/));
    const filtered: SymbolData = {};

    // 遍歷所有分類和項目進行過濾
    Object.entries(data).forEach(([category, { categoryTags, items }]) => {
      const categoryTagsLower = categoryTags.map((tag) => tag.toLowerCase());
      // 檢查分類標籤是否匹配
      const categoryMatches = Array.from(searchTerms).some((term) =>
        categoryTagsLower.some((tag) => tag.includes(term))
      );

      // 過濾符合條件的項目
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

      // 只保留有匹配項目的分類
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
      {/* 搜尋欄 */}
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

      {/* 符號列表區域 */}
      <div className="overflow-y-auto overflow-x-hidden h-full">
        {/* 最近使用的符號區域 */}
        {recentItems.length > 0 && !searchQuery && (
          <div className="">
            <h3 className="sticky top-0 left-0 z-10 w-full text-left text-sm font-semibold py-3 px-3 flex items-center gap-2 bg-zinc-50 transition-colors">
              最近使用
            </h3>
            <div className="flex flex-wrap gap-1 p-3">
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

        {/* 分類符號列表 */}
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
