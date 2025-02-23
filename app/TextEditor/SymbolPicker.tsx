import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight, CircleDashed } from "lucide-react";
import { SymbolItem, SymbolData } from "./types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// 設定每次載入的符號數量，用於實現延遲載入功能
const ITEMS_PER_BATCH = 20;

/**
 * 單個符號按鈕組件
 * 顯示符號並在懸停時顯示提示文字
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
  <div className="group relative">
    {/* 符號按鈕 */}
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
    {/* 懸停時顯示的提示框 */}
    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 h-auto -translate-x-1/2 transform whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
      {item.tags[0]}
    </div>
  </div>
);

/**
 * 可折疊的分類區塊組件
 * 實現延遲載入和展開/收起功能
 * @param category - 分類名稱
 * @param items - 該分類下的符號項目
 * @param onSelect - 選擇符號時的回調函數
 * @param btnClassName - 自定義按鈕樣式
 * @param defaultExpanded - 預設是否展開
 */
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
  // 目前顯示的項目數量
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_BATCH);
  // 展開/收起狀態
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  // 用於觀察延遲載入的 ref
  const loadMoreRef = useRef(null);

  // 設置 Intersection Observer 實現延遲載入
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 當觀察的元素進入視圖且還有更多項目可載入時
        if (entries[0].isIntersecting && visibleItems < items.length) {
          setVisibleItems((prev) =>
            Math.min(prev + ITEMS_PER_BATCH, items.length),
          );
        }
      },
      { threshold: 0.1 }, // 當目標元素 10% 進入視圖時觸發
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleItems, items.length]);

  return (
    <div className="">
      {/* 分類標題和展開/收起按鈕 */}
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

      {/* 符號列表容器 */}
      <div
        className={`flex flex-wrap gap-1 ${
          isExpanded
            ? "p-3 opacity-100"
            : "h-0 overflow-hidden px-3 py-0 opacity-0"
        }`}
      >
        {/* 根據可見數量顯示符號按鈕 */}
        {items.slice(0, visibleItems).map((item) => (
          <SymbolButton
            key={item.symbol}
            item={item}
            onSelect={onSelect}
            btnClassName={btnClassName}
          />
        ))}
        {/* 延遲載入觸發元素 */}
        {visibleItems < items.length && (
          <div ref={loadMoreRef} className="h-4" />
        )}
      </div>
    </div>
  );
};

export const SymbolPicker: React.FC<{
  data: SymbolData;
  onSelect: (symbol: string) => void;
  btnClassName?: string;
}> = ({ data, onSelect, btnClassName }) => {
  // 搜尋關鍵字
  const [searchQuery, setSearchQuery] = useState("");
  // 最近使用的符號
  const [recentItems, setRecentItems] = useState<SymbolItem[]>([]);
  // 最近使用區塊的展開狀態
  const [isExpanded, setIsExpanded] = useState(true);

  /**
   * 處理符號選擇
   * 1. 觸發選擇回調
   * 2. 更新最近使用列表
   */
  const handleSymbolSelect = (item: SymbolItem) => {
    onSelect(item.symbol);
    setRecentItems((prev) => {
      // 避免重複添加相同的符號
      if (prev.some((prevItem) => prevItem.symbol === item.symbol)) return prev;
      // 添加到最近使用列表，最多保留 20 個
      return [item, ...prev].slice(0, 20);
    });
  };

  /**
   * 根據搜尋關鍵字過濾符號
   * 使用 useMemo 優化效能，只在 searchQuery 或 data 變更時重新計算
   */
  const filteredItems = useMemo(() => {
    if (!searchQuery) return data;

    // 將搜尋詞分割成多個關鍵字
    const searchTerms = new Set(searchQuery.toLowerCase().split(/\s+/));
    const filtered: SymbolData = {};

    // 遍歷所有分類
    Object.entries(data).forEach(([category, { categoryTags, items }]) => {
      // 檢查分類標籤是否匹配
      const categoryTagsLower = categoryTags.map((tag) => tag.toLowerCase());
      const categoryMatches = Array.from(searchTerms).some((term) =>
        categoryTagsLower.some((tag) => tag.includes(term)),
      );

      // 過濾符合搜尋條件的項目
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

      // 如果有匹配的項目，將此分類加入過濾結果
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
    <div className="h-full w-full overflow-hidden p-2 pt-0">
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-xl border border-input bg-zinc-50">
        {/* 搜尋欄 */}
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

        {/* 符號列表區域 */}
        <ScrollArea className="h-full overflow-y-auto overflow-x-hidden">
          {/* 最近使用區塊（僅在未搜尋時顯示） */}
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

          {/* 符號分類列表 */}
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
    </div>
  );
};
