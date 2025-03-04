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
        "text-md flex h-10 animate-fade-in items-center justify-center" +
        btnClassName
      }
    >
      {item.symbol}
    </Button>
    {/* 懸停時顯示的提示框 */}
    {item.tags[0] !== "" && (
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 h-auto -translate-x-1/2 transform whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {item.tags[0]}
      </div>
    )}
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
  listClassName = "",
  defaultExpanded = true,
}: {
  category: string;
  items: SymbolItem[];
  onSelect: (item: SymbolItem) => void;
  btnClassName?: string;
  listClassName?: string;
  defaultExpanded?: boolean;
}) => {
  // 注意：將狀態初始化移動到 useEffect 中
  const [visibleItems, setVisibleItems] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);

  // 用於觀察延遲載入的 ref
  const loadMoreRef = useRef(null);

  // 在客戶端使用 useEffect 初始化狀態
  useEffect(() => {
    setVisibleItems(ITEMS_PER_BATCH);
    setIsExpanded(defaultExpanded);
    setIsClientSide(true);
  }, [defaultExpanded]);

  // 設置 Intersection Observer 實現延遲載入
  useEffect(() => {
    if (!isClientSide) return;

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
  }, [visibleItems, items.length, isClientSide]);

  if (!isClientSide) {
    return null; // 在伺服器端或初始渲染時不顯示任何內容
  }

  return (
    <div className="">
      {/* 分類標題和展開/收起按鈕 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="sticky left-0 top-0 z-10 flex w-full items-center gap-2 bg-zinc-50 px-2 py-2 text-left text-sm font-semibold transition-colors hover:bg-zinc-100 md:px-3 md:py-2"
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
        className={`gap-1 ${
          isExpanded
            ? "p-2 opacity-100 md:p-3"
            : "h-0 overflow-hidden px-2 py-0 opacity-0 md:px-3"
        } ${listClassName} `}
      >
        {/* 根據可見數量顯示符號按鈕 */}
        {items.slice(0, visibleItems).map((item, index) => (
          <SymbolButton
            key={`${item.symbol}-${index}`}
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
  listClassName?: string;
  pickerType?: "symbol" | "emoji" | "kaomoji";
}> = ({
  data,
  onSelect,
  btnClassName,
  listClassName,
  pickerType = "symbol",
}) => {
  // 搜尋關鍵字
  const [searchQuery, setSearchQuery] = useState("");
  // 最近使用的符號
  const [recentItems, setRecentItems] = useState<SymbolItem[]>([]);
  // 最近使用區塊的展開狀態
  const [isExpanded, setIsExpanded] = useState(false);
  // 客戶端渲染標記
  const [isClientSide, setIsClientSide] = useState(false);

  // 根據不同的 pickerType 獲取對應的 localStorage key
  const getLocalStorageKey = () => {
    switch (pickerType) {
      case "emoji":
        return "recentEmojis";
      case "kaomoji":
        return "recentEmoticons";
      case "symbol":
      default:
        return "recentSymbols";
    }
  };

  const localStorageKey = getLocalStorageKey();

  // 在客戶端初始化狀態
  useEffect(() => {
    setIsExpanded(true);
    setIsClientSide(true);

    // 根據 pickerType 從 localStorage 讀取最近使用的項目
    try {
      const storedRecent = localStorage.getItem(localStorageKey);
      if (storedRecent) {
        setRecentItems(JSON.parse(storedRecent));
      }
    } catch (e) {
      console.error(`Failed to read ${localStorageKey} from localStorage:`, e);
    }
  }, [localStorageKey]);

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
      const newRecentItems = [item, ...prev].slice(0, 20);

      // 儲存到 localStorage，使用對應的 key
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(newRecentItems));
      } catch (e) {
        console.error(
          `Failed to write to localStorage (${localStorageKey}):`,
          e,
        );
      }

      return newRecentItems;
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

  // 在客戶端渲染之前，先返回空的 skeleton
  if (!isClientSide) {
    return (
      <div className="h-full w-full overflow-hidden pt-0">
        <div className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-xl border border-input bg-zinc-50">
          <div className="border-b bg-background p-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={`搜尋${pickerType === "emoji" ? "表情符號" : pickerType === "kaomoji" ? "顏文字" : "符號"}`}
                value=""
                className="pl-8 text-sm"
                disabled
              />
            </div>
          </div>
          <div className="flex h-full items-center justify-center">
            <CircleDashed className="h-6 w-6 animate-spin text-zinc-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden pt-0">
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-xl border border-input bg-zinc-50">
        {/* 搜尋欄 */}
        <div className="border-b bg-background p-2 md:p-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={`搜尋${pickerType === "emoji" ? "表情符號" : pickerType === "kaomoji" ? "顏文字" : "符號"}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm"
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
                className="sticky left-0 top-0 z-10 flex w-full items-center gap-2 bg-zinc-50 p-2 text-left text-sm font-semibold transition-colors hover:bg-zinc-100 md:px-3 md:py-2"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <p className="">
                  最近使用
                  {pickerType === "emoji"
                    ? "的表情符號"
                    : pickerType === "kaomoji"
                      ? "的顏文字"
                      : "的符號"}
                </p>
                <span className="text-xs text-zinc-400">
                  {recentItems.length}
                </span>
              </button>
              <div
                className={`flex flex-wrap gap-1 ${
                  isExpanded
                    ? "p-2 opacity-100 md:p-3"
                    : "h-0 overflow-hidden px-2 py-0 opacity-0 md:px-3"
                } ${listClassName}`}
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
                    最近沒有使用
                    {pickerType === "emoji"
                      ? "的表情符號"
                      : pickerType === "kaomoji"
                        ? "的顏文字"
                        : "的符號"}
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
              listClassName={listClassName}
            />
          ))}

          <ScrollBar className="z-10" />
        </ScrollArea>
      </div>
    </div>
  );
};
