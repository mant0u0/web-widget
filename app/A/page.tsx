"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Edit,
  Trash2,
  Plus,
  // Info,
  CircleHelp,
  FileText,
  GitBranch,
  Copy,
  ListCollapse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useLocalStorage from "../hooks/useLocalStorage";

// Script 元件用於加載外部腳本
const Script = ({ src, onLoad }: { src: string; onLoad?: () => void }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    if (onLoad) script.onload = onLoad;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [src, onLoad]);

  return null;
};

// 定義項目介面
interface Item {
  id: string;
  text: string;
  children: Item[];
  expanded: boolean;
  itemType: string;
  notes: string;
}

type ItemState = Item[];

// 巢狀式項目管理器元件
const NestedItemManager = () => {
  // 初始項目資料
  const initialItems: ItemState = [
    {
      id: "1",
      text: "項目 1",
      children: [],
      expanded: true,
      itemType: "一般頁面",
      notes: "",
    },
  ];

  // 物件類型選項
  const itemTypeOptions = [
    "一般頁面",
    "產品頁面",
    "文章頁面",
    "聯絡表單",
    "關於我們",
  ];

  // 狀態管理
  const [items, setItems] = useLocalStorage<ItemState>(
    "nested-items-data",
    initialItems,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [textFormatDialogOpen, setTextFormatDialogOpen] = useState(false);
  const [formattedText, setFormattedText] = useState("");
  const [structureDialogOpen, setStructureDialogOpen] = useState(false);
  const [mermaidCode, setMermaidCode] = useState("");
  // 添加一個狀態來記錄是否全部展開
  const [isAllExpanded, setIsAllExpanded] = useState(true);
  // 拖曳狀態
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null); // 'before', 'after', 'inside'
  // 清除狀態
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  // 項目表單狀態
  const [itemFormData, setItemFormData] = useState({
    id: "",
    text: "",
    itemType: "一般頁面",
    notes: "",
    parentId: null as string | null,
    isEdit: false,
  });

  // 開啟新增項目對話框
  const openAddItemDialog = (parentId: string | null = null) => {
    setItemFormData({
      id: "",
      text: "",
      itemType: "一般頁面",
      notes: "",
      parentId,
      isEdit: false,
    });
    setDialogOpen(true);
  };

  // 開啟編輯項目對話框
  const openEditDialog = (item: Item) => {
    setItemFormData({
      id: item.id,
      text: item.text,
      itemType: item.itemType,
      notes: item.notes,
      parentId: null,
      isEdit: true,
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果按下 Enter 且沒有其他對話框開啟
      if (
        e.key === "Enter" &&
        !dialogOpen &&
        !deleteDialogOpen &&
        !textFormatDialogOpen &&
        !structureDialogOpen
      ) {
        // 檢查不是在輸入框中
        const activeElement = document.activeElement;
        const isInput =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement instanceof HTMLSelectElement;

        // 如果不是輸入框元素，打開新增項目視窗
        if (!isInput) {
          e.preventDefault();
          openAddItemDialog();
        }
      }
    };

    // 添加事件監聽器
    window.addEventListener("keydown", handleKeyDown);

    // 清理函數
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dialogOpen, deleteDialogOpen, textFormatDialogOpen, structureDialogOpen]);

  // 處理表單提交
  const handleItemFormSubmit = () => {
    if (!itemFormData.text.trim()) return;

    if (itemFormData.isEdit) {
      // 編輯現有項目
      const updateItem = (itemsArray: Item[]): Item[] => {
        return itemsArray.map((item) => {
          if (item.id === itemFormData.id) {
            return {
              ...item,
              text: itemFormData.text,
              itemType: itemFormData.itemType,
              notes: itemFormData.notes,
            };
          }
          if (item.children.length) {
            return { ...item, children: updateItem(item.children) };
          }
          return item;
        });
      };

      setItems(updateItem([...items]));
    } else {
      // 新增項目
      const newItem: Item = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // 添加隨機數以避免重複
        text: itemFormData.text,
        children: [],
        expanded: true,
        itemType: itemFormData.itemType,
        notes: itemFormData.notes,
      };

      if (itemFormData.parentId) {
        // 新增子項目
        const addChildToParent = (itemsArray: Item[]): Item[] => {
          return itemsArray.map((item) => {
            if (item.id === itemFormData.parentId) {
              return {
                ...item,
                children: [...item.children, newItem],
                expanded: true, // 自動展開父項目
              };
            }
            if (item.children.length) {
              return { ...item, children: addChildToParent(item.children) };
            }
            return item;
          });
        };

        setItems(addChildToParent([...items]));
      } else {
        // 新增根級項目
        setItems([...items, newItem]);
      }
    }

    setDialogOpen(false);
  };

  // 開啟刪除確認對話框
  const openDeleteDialog = (itemId: string) => {
    setDeleteItemId(itemId);
    setDeleteDialogOpen(true);
  };

  // 確認刪除項目
  const confirmDelete = () => {
    if (!deleteItemId) return;

    const deleteFromArray = (itemsArray: Item[]): Item[] => {
      return itemsArray.filter((item) => {
        if (item.id === deleteItemId) return false;
        if (item.children.length) {
          item.children = deleteFromArray(item.children);
        }
        return true;
      });
    };

    setItems(deleteFromArray([...items]));
    setDeleteDialogOpen(false);
    setDeleteItemId(null);
  };

  // 開啟清空所有項目確認對話框
  const confirmClearAll = () => {
    setItems([]);
    setClearAllDialogOpen(false);
  };

  // 真正生成唯一 ID 的函數
  const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 1000000);
    const uniquePart = Math.random().toString(36).substring(2, 10);
    return `item-${timestamp}-${randomPart}-${uniquePart}`;
  };

  // 添加複製項目功能
  // 此函數會創建一個項目的副本，並將其插入到相同的父項目下
  const handleCopyItem = (itemId: string) => {
    // 先找到要複製的項目
    const findItemById = (items: Item[], id: string): Item | null => {
      for (const item of items) {
        if (item.id === id) {
          return item;
        }
        if (item.children.length > 0) {
          const found = findItemById(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    // 找到原始項目
    const originalItem = findItemById(items, itemId);
    if (!originalItem) return;

    // 深度複製項目，確保每個層級都有新的 ID
    const deepCopyWithNewIds = (item: Item): Item => {
      return {
        ...item,
        id: generateUniqueId(), // 為每個項目生成新 ID
        text: `${item.text}`,
        children: item.children.map((child) => deepCopyWithNewIds(child)), // 遞迴處理所有子項目
      };
    };

    // 創建複製後的項目，每個層級都有新 ID
    const copiedItem = deepCopyWithNewIds(originalItem);

    // 在原始項目旁邊插入複製的項目
    const insertCopiedItem = (
      currentItems: Item[],
      targetId: string,
    ): Item[] => {
      const result = [...currentItems];

      // 查找目標項目的索引
      const index = result.findIndex((item) => item.id === targetId);

      // 如果在當前層級找到了目標項目
      if (index !== -1) {
        // 在目標項目後插入複製的項目
        result.splice(index + 1, 0, copiedItem);
        return result;
      }

      // 如果在當前層級沒找到，遞迴查找子項目
      for (let i = 0; i < result.length; i++) {
        if (result[i].children.length > 0) {
          const newChildren = insertCopiedItem(result[i].children, targetId);

          // 如果子項目數量變化了，說明找到了目標位置
          if (newChildren.length !== result[i].children.length) {
            result[i] = { ...result[i], children: newChildren };
            return result;
          }
        }
      }

      return result;
    };

    // 更新項目列表
    setItems(insertCopiedItem(items, itemId));
  };

  // 切換項目展開/折疊狀態
  const toggleExpanded = (itemId: string) => {
    const toggleItem = (itemsArray: Item[]): Item[] => {
      return itemsArray.map((item) => {
        if (item.id === itemId) {
          return { ...item, expanded: !item.expanded };
        }
        if (item.children.length) {
          return { ...item, children: toggleItem(item.children) };
        }
        return item;
      });
    };

    setItems(toggleItem([...items]));
  };

  // 切換全部展開/折疊的功能
  const toggleExpandAll = () => {
    // 反轉當前狀態
    const newExpandedState = !isAllExpanded;

    // 遞迴更新所有項目的展開狀態
    const updateItemsExpanded = (itemsArray: Item[]): Item[] => {
      return itemsArray.map((item) => {
        // 更新子項目
        const updatedChildren =
          item.children.length > 0 ? updateItemsExpanded(item.children) : [];

        // 返回更新後的項目
        return {
          ...item,
          expanded: newExpandedState, // 設置展開/折疊狀態
          children: updatedChildren,
        };
      });
    };

    // 更新項目狀態
    setItems(updateItemsExpanded([...items]));
    // 更新全部展開的狀態
    setIsAllExpanded(newExpandedState);
  };

  // 確定放置位置
  const getDragPosition = (e: React.DragEvent, itemRect: DOMRect) => {
    const mouseY = e.clientY;
    const itemTop = itemRect.top;
    const itemHeight = itemRect.height;
    const relativeY = mouseY - itemTop;

    // 使用比例更合理的判斷
    // 前25%為"before", 25%-75%為"inside", 後25%為"after"
    if (relativeY < itemHeight * 0.25) {
      return "before";
    } else if (relativeY > itemHeight * 0.75) {
      return "after";
    } else {
      return "inside";
    }
  };

  // 處理拖曳結束事件
  const handleDragEnd = () => {
    // 確保有有效的拖放目標
    if (!draggedItem || !dragOverItem || !dragOverPosition) {
      resetDragState();
      return;
    }

    // 避免將項目拖到自己身上
    if (draggedItem === dragOverItem) {
      resetDragState();
      return;
    }

    try {
      // 檢查是否是拖到自己的子項目中 - 更簡單的實現
      const isChildOf = (parent: string, child: string): boolean => {
        const findParentPath = (
          items: Item[],
          targetId: string,
          path: string[] = [],
        ): string[] | null => {
          for (const item of items) {
            // 當前路徑
            const currentPath = [...path, item.id];

            // 找到目標
            if (item.id === targetId) {
              return currentPath;
            }

            // 遞迴查找子項目
            if (item.children.length > 0) {
              const result = findParentPath(
                item.children,
                targetId,
                currentPath,
              );
              if (result) return result;
            }
          }
          return null;
        };

        const childPath = findParentPath(items, child);
        return childPath ? childPath.includes(parent) : false;
      };

      // 不允許拖到自己的子項目中
      if (isChildOf(draggedItem, dragOverItem)) {
        console.log("不能將項目拖到其子項目中");
        resetDragState();
        return;
      }

      // 1. 找到並深度複製被拖曳的項目
      let draggedItemData: Item | null = null;

      // 2. 使用遞迴函數來構建新的項目樹狀結構
      const buildNewItemsTree = (
        currentItems: Item[],
        isTopLevel: boolean = true,
      ): Item[] => {
        // 創建項目的副本，以避免直接修改原始項目
        const newItems = currentItems.map((item) => ({
          ...item,
          children: [...item.children], // 複製子項目數組
        }));

        // 首先，從樹中找到並移除被拖曳的項目
        const removeItem = (items: Item[]): [Item[], Item | null] => {
          let removed: Item | null = null;
          const result: Item[] = [];

          for (const item of items) {
            if (item.id === draggedItem) {
              removed = JSON.parse(JSON.stringify(item)); // 深度複製
            } else {
              const [newChildren, removedFromChildren] = removeItem(
                item.children,
              );

              if (removedFromChildren) {
                removed = removedFromChildren;
                result.push({ ...item, children: newChildren });
              } else {
                result.push(item);
              }
            }
          }

          return [result, removed];
        };

        const [itemsWithoutDragged, removed] = removeItem(newItems);

        if (removed) {
          draggedItemData = removed;
        }

        // 如果是拖曳到最上層
        if (isTopLevel && !dragOverItem && draggedItemData) {
          itemsWithoutDragged.push(draggedItemData);
          return itemsWithoutDragged;
        }

        // 接著，將被拖曳的項目插入到目標位置
        const insertItem = (items: Item[]): Item[] => {
          const result: Item[] = [];

          for (const item of items) {
            // 插入到目標項目前面
            if (
              item.id === dragOverItem &&
              dragOverPosition === "before" &&
              draggedItemData
            ) {
              result.push(draggedItemData);
              result.push(item);
            }
            // 插入到目標項目內部
            else if (
              item.id === dragOverItem &&
              dragOverPosition === "inside" &&
              draggedItemData
            ) {
              result.push({
                ...item,
                expanded: true, // 自動展開
                children: [...item.children, draggedItemData],
              });
            }
            // 插入到目標項目後面
            else if (
              item.id === dragOverItem &&
              dragOverPosition === "after" &&
              draggedItemData
            ) {
              result.push(item);
              result.push(draggedItemData);
            }
            // 遞迴處理子項目
            else {
              const newChildren = insertItem(item.children);
              result.push({
                ...item,
                children: newChildren,
              });
            }
          }

          return result;
        };

        return insertItem(itemsWithoutDragged);
      };

      // 3. 構建並設置新的項目樹
      const newItemsTree = buildNewItemsTree(items);

      if (draggedItemData) {
        setItems(newItemsTree);
      }
    } catch (error) {
      console.error("拖放過程中發生錯誤:", error);
    }

    // 重置拖放狀態
    resetDragState();
  };

  // 處理拖曳經過事件
  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();

    // 避免將項目拖到自己身上
    if (draggedItem === itemId) return;

    // 獲取項目的DOM元素
    const itemElement = e.currentTarget as HTMLElement;
    const rect = itemElement.getBoundingClientRect();

    // 確定拖曳位置，使用更精確的計算
    const position = getDragPosition(e, rect);

    // 更新狀態
    setDragOverItem(itemId);
    setDragOverPosition(position);
  };

  // 重置拖曳狀態
  const resetDragState = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    setDragOverPosition(null);
  };

  // 遞迴渲染項目列表
  const renderItems = (itemsList: Item[], depth = 0) => {
    return (
      <ul
        className={`pl-0 ${depth > 0 ? "pl-6" : ""} flex list-none flex-col gap-2`}
      >
        {itemsList.map((item) => (
          <li
            key={item.id}
            className={` ${draggedItem === item.id ? "opacity-50" : ""}`}
          >
            <div
              draggable
              onDragStart={() => setDraggedItem(item.id)}
              //
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, item.id)}
              className={`group flex h-full gap-2 rounded-md border ${
                dragOverItem === item.id && dragOverPosition === "inside"
                  ? "border-2 border-green-500 bg-green-50"
                  : dragOverItem === item.id
                    ? dragOverPosition === "before"
                      ? "border-t-4 border-t-blue-500"
                      : "border-b-4 border-b-blue-500"
                    : "border-gray-200"
              } relative bg-white p-2 shadow-sm`}
            >
              {/* 展開/折疊按鈕 */}
              <div className="flex w-8 items-center justify-center">
                {item.children.length > 0 && (
                  <Button
                    onClick={() => toggleExpanded(item.id)}
                    variant="ghost"
                    size="icon"
                    className="h-full w-8 rounded-sm p-0 text-gray-500 hover:text-gray-800 focus:outline-none"
                  >
                    {item.expanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </Button>
                )}
                {item.children.length === 0 && (
                  <GripVertical className="h-4 w-4 cursor-grab text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </div>

              {/* 項目內容 */}
              <p className="item-text w-full">
                <span>{item.text}</span>
                <br />
                <span className="text-xs text-gray-400">{item.itemType}</span>
                {item.notes && (
                  <>
                    <br />
                    <span className="text-xs text-gray-400">{item.notes}</span>
                  </>
                )}
              </p>

              {/* 操作按鈕組 */}
              <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                {/* 刪除按鈕 */}
                <Button
                  onClick={() => openDeleteDialog(item.id)}
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-8 w-8 p-0 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                {/* 複製按鈕 */}
                <Button
                  onClick={() => handleCopyItem(item.id)}
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-8 w-8 p-0 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                {/* 編輯按鈕 */}
                <Button
                  onClick={() => openEditDialog(item)}
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-8 w-8 p-0 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                {/* 新增子項目按鈕 */}
                <Button
                  onClick={() => openAddItemDialog(item.id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 text-gray-400 hover:bg-green-50 hover:text-green-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 子項目 */}
            {item.children.length > 0 && item.expanded && (
              <div
                className={`mt-2 ${dragOverItem === item.id && dragOverPosition === "inside" ? "opacity-50" : ""}`}
              >
                {renderItems(item.children, depth + 1)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  // 生成 Mermaid 流程圖代碼
  const generateMermaidDiagram = () => {
    let mermaidCode = "flowchart TD\n";

    const generateMermaidNodes = (
      itemsList: Item[],
      parentId: string | null = null,
    ) => {
      itemsList.forEach((item) => {
        // 清理文字，確保沒有特殊字符會影響 Mermaid 語法
        const cleanText = item.text.replace(/[^\w\s\u4e00-\u9fa5]/g, "_");

        // 添加節點定義
        mermaidCode += `  ${item.id}["${cleanText} (${item.itemType})"]\n`;

        // 如果有父節點，添加連接
        if (parentId) {
          mermaidCode += `  ${parentId} --> ${item.id}\n`;
        }

        // 處理子項目
        if (item.children.length > 0) {
          generateMermaidNodes(item.children, item.id);
        }
      });
    };

    generateMermaidNodes(items);
    setMermaidCode(mermaidCode);
    setStructureDialogOpen(true);
  };

  // 生成文字格式
  const generateTextFormat = () => {
    const buildTextTree = (itemsList: Item[], depth = 0): string => {
      let result = "";

      itemsList.forEach((item) => {
        // 添加縮排
        const indent = "  ".repeat(depth);
        // 構建項目文字
        result += `${indent}- ${item.text} (${item.itemType})${item.notes ? ` // ${item.notes}` : ""}\n`;

        // 遞迴處理子項目
        if (item.children.length > 0) {
          result += buildTextTree(item.children, depth + 1);
        }
      });

      return result;
    };

    const textTree = buildTextTree(items);
    setFormattedText(textTree);
    setTextFormatDialogOpen(true);
  };

  return (
    <div className="h-full w-full overflow-auto">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button
            onClick={() => openAddItemDialog()}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            新增項目
          </Button>

          <div className="flex items-center justify-between gap-2">
            <Button
              onClick={() => setClearAllDialogOpen(true)}
              variant="outline"
              className="flex items-center border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              清除全部
            </Button>

            <Button
              onClick={toggleExpandAll}
              variant="outline"
              className="flex items-center"
            >
              {isAllExpanded ? (
                <>
                  <ListCollapse className="h-4 w-4" />
                  全部折疊
                </>
              ) : (
                <>
                  <ListCollapse className="h-4 w-4" />
                  全部展開
                </>
              )}
            </Button>

            <Button
              onClick={generateTextFormat}
              variant="outline"
              className="flex items-center"
            >
              <FileText className="h-4 w-4" />
              輸出文字
            </Button>

            <Button
              onClick={generateMermaidDiagram}
              variant="outline"
              className="flex items-center"
            >
              <GitBranch className="h-4 w-4" />
              架構圖
            </Button>
          </div>
        </div>

        <div className="">{renderItems(items)}</div>

        {items.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-[120px] text-gray-800 opacity-45">
            <CircleHelp className="h-[60px] w-[60px]" strokeWidth={1.8} />
            <p>目前沒有任何項目</p>
          </div>
        )}

        {/* 項目表單對話框 (用於新增/編輯) */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {itemFormData.isEdit
                  ? "編輯項目"
                  : itemFormData.parentId
                    ? "新增子項目"
                    : "新增項目"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="itemName" className="text-sm font-medium">
                  標題
                </label>
                <Input
                  id="itemName"
                  value={itemFormData.text}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, text: e.target.value })
                  }
                  placeholder="輸入標題"
                  className="w-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && itemFormData.text.trim()) {
                      e.stopPropagation(); // 停止事件冒泡
                      handleItemFormSubmit();
                    }
                  }}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="itemType" className="text-sm font-medium">
                  類型
                </label>
                <Select
                  value={itemFormData.itemType}
                  onValueChange={(value) => {
                    setItemFormData({ ...itemFormData, itemType: value });
                  }}
                  className="w-full"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  備註
                </label>
                <textarea
                  id="notes"
                  value={itemFormData.notes}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, notes: e.target.value })
                  }
                  placeholder="輸入備註..."
                  className="min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <Button
                onClick={handleItemFormSubmit}
                type="submit"
                disabled={itemFormData.text.trim() === ""}
              >
                {itemFormData.isEdit ? "儲存" : "新增"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 刪除確認對話框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>確認刪除</AlertDialogTitle>
              <AlertDialogDescription>
                您確定要刪除此項目嗎？若項目包含子項目，所有子項目也將被刪除。此操作無法撤銷。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                確認刪除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 清除全部項目確認對話框 */}
        <AlertDialog
          open={clearAllDialogOpen}
          onOpenChange={setClearAllDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>確認清除全部項目</AlertDialogTitle>
              <AlertDialogDescription>
                您確定要清除所有項目嗎？此操作將刪除所有項目及其子項目，且無法撤銷。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmClearAll}
                className="bg-red-500 hover:bg-red-600"
              >
                清除全部
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 文字格式對話框 */}
        <Dialog
          open={textFormatDialogOpen}
          onOpenChange={setTextFormatDialogOpen}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>輸出文字</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <pre className="max-h-96 min-h-[200px] overflow-auto rounded-md border border-input bg-gray-100 p-4 text-sm">
                {formattedText}
              </pre>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(formattedText);
                }}
              >
                複製
              </Button>

              <DialogClose asChild>
                <Button>關閉</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 架構圖對話框 */}
        {structureDialogOpen && (
          <Script
            src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"
            onLoad={() => {
              // 腳本加載後初始化 Mermaid
              try {
                // @ts-expect-error - 類型定義不完整，需要忽略類型檢查
                if (window.mermaid) {
                  // @ts-expect-error - 第三方庫類型衝突
                  window.mermaid.initialize({
                    startOnLoad: true,
                    theme: "default",
                    flowchart: {
                      useMaxWidth: true,
                      htmlLabels: true,
                      curve: "linear", // 改為 linear 或移除這行以使用直線
                    },
                  });
                }
              } catch (error) {
                console.error("Error initializing mermaid:", error);
              }
            }}
          />
        )}

        <Dialog
          open={structureDialogOpen}
          onOpenChange={setStructureDialogOpen}
        >
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>項目架構圖</DialogTitle>
            </DialogHeader>
            <div
              className="overflow-auto rounded border"
              style={{ maxHeight: "70vh" }}
            >
              {/* 使用 iframe 顯示 Mermaid 圖表 */}
              <div className="flex w-full justify-center">
                <iframe
                  title="項目架構圖"
                  className="h-[50vh] min-h-[400px] w-full border-0"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
                       <script>
                        mermaid.initialize({
                          startOnLoad: true,
                          theme: 'default',
                          flowchart: { 
                            useMaxWidth: true,
                            htmlLabels: true,
                            curve: 'linear' // 改為 linear 以使用直線
                          }
                        });
                      </script>
                      <style>
                        body { 
                          font-family: Arial, sans-serif; 
                          margin: 0; 
                          padding: 10px;
                          height: 100vh;
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          overflow: auto;
                        }
                        .mermaid { 
                          text-align: center;
                          width: 100%;
                          height: 100%;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="mermaid">
                      ${mermaidCode}
                      </div>
                    </body>
                    </html>
                  `}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(mermaidCode);
                }}
              >
                複製 Mermaid 代碼
              </Button>
              <DialogClose asChild>
                <Button>關閉</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NestedItemManager;
