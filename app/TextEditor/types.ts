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

export interface SymbolPickerProps {
  data: SymbolData;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recentItems: SymbolItem[];
  onSymbolSelect: (item: SymbolItem) => void;
  placeholder: string;
}
