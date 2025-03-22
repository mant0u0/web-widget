"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Edit,
  Trash2,
  Plus,
  Info,
  FileText,
  GitBranch,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
type FindResult = { item: Item; parent: Item | null; index: number } | null;

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
  const [items, setItems] = useState<ItemState>(initialItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [textFormatDialogOpen, setTextFormatDialogOpen] = useState(false);
  const [formattedText, setFormattedText] = useState("");
  const [structureDialogOpen, setStructureDialogOpen] = useState(false);
  const [mermaidCode, setMermaidCode] = useState("");

  // 拖曳狀態
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null); // 'before', 'after', 'inside'

  // 項目表單狀態
  const [itemFormData, setItemFormData] = useState({
    id: "",
    text: "",
    itemType: "一般頁面",
    notes: "",
    parentId: null as string | null,
    isEdit: false,
  });

  // 找到項目及其父項目
  const findItemAndParent = (
    itemId: string,
    itemsArray: Item[] = items,
    parent: Item | null = null,
  ): FindResult => {
    for (let i = 0; i < itemsArray.length; i++) {
      if (itemsArray[i].id === itemId) {
        return { item: itemsArray[i], parent, index: i };
      }

      if (itemsArray[i].children.length > 0) {
        const result = findItemAndParent(
          itemId,
          itemsArray[i].children,
          itemsArray[i],
        );
        if (result) return result;
      }
    }

    return null;
  };

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

  // 為所有項目及其子項目生成新的ID
  const generateNewIds = (item: Item): Item => {
    // 建立一個新的項目物件，而非修改原始物件
    const newItem = { ...item };

    // 為項目生成新 ID
    newItem.id = `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 遞迴處理子項目
    if (newItem.children && newItem.children.length > 0) {
      newItem.children = newItem.children.map((child) =>
        generateNewIds({ ...child }),
      );
    }

    return newItem;
  };

  // 處理拖曳結束事件
  // 處理拖曳結束事件
  const handleDragEnd = (e: React.DragEvent) => {
    // 確保只有在有拖曳和目標項目時才處理
    if (!draggedItem || !dragOverItem || !dragOverPosition) {
      resetDragState();
      return;
    }

    // 避免放置到自身
    if (draggedItem === dragOverItem) {
      resetDragState();
      return;
    }

    try {
      // 檢查是否拖到自己的子項目中 (避免形成循環引用)
      const isChildOf = (childId: string, parentId: string): boolean => {
        const parent = findItemAndParent(parentId);
        if (!parent) return false;

        const checkChildren = (children: Item[]): boolean => {
          for (const child of children) {
            if (child.id === childId) return true;
            if (child.children.length > 0 && checkChildren(child.children))
              return true;
          }
          return false;
        };

        return checkChildren(parent.item.children);
      };

      if (isChildOf(dragOverItem, draggedItem)) {
        console.log("Cannot drag to child item");
        resetDragState();
        return;
      }

      // 找到拖曳項目和目標項目
      const draggedItemInfo = findItemAndParent(draggedItem);
      const dropTargetInfo = findItemAndParent(dragOverItem);

      if (!draggedItemInfo || !dropTargetInfo) {
        console.log("Item not found");
        resetDragState();
        return;
      }

      // 顯示更詳細的日誌，幫助調試
      console.log(
        "Dragging item:",
        draggedItemInfo.item.text,
        "to",
        dropTargetInfo.item.text,
        "position:",
        dragOverPosition,
      );

      // 創建項目的完整深度複製
      const newItems = JSON.parse(JSON.stringify(items));

      // 1. 先找到原始項目並保存它的完整副本（包括所有子項目）
      const findAndExtractItem = (
        itemsArray: Item[],
        idToFind: string,
      ): [Item | null, Item[]] => {
        let extractedItem: Item | null = null;

        // 從陣列中找到並移除項目
        const remainingItems = itemsArray.filter((item) => {
          if (item.id === idToFind) {
            extractedItem = JSON.parse(JSON.stringify(item)); // 深度複製
            return false; // 從陣列中移除
          }
          return true;
        });

        // 如果在頂層沒找到，則在子項目中查找
        if (!extractedItem) {
          for (let i = 0; i < remainingItems.length; i++) {
            if (
              remainingItems[i].children &&
              remainingItems[i].children.length > 0
            ) {
              const [found, updatedChildren] = findAndExtractItem(
                remainingItems[i].children,
                idToFind,
              );

              if (found) {
                extractedItem = found;
                remainingItems[i] = {
                  ...remainingItems[i],
                  children: updatedChildren,
                };
                break;
              }
            }
          }
        }

        return [extractedItem, remainingItems];
      };

      // 提取被拖曳的項目並得到新的項目陣列
      const [draggedItemCopy, itemsWithoutDragged] = findAndExtractItem(
        newItems,
        draggedItem,
      );

      if (!draggedItemCopy) {
        console.error("Failed to extract dragged item");
        resetDragState();
        return;
      }

      // 2. 將項目插入到新位置
      const insertItem = (
        itemsArray: Item[],
        targetId: string,
        itemToInsert: Item,
        position: string,
      ): Item[] => {
        const result = [...itemsArray];

        // 處理為根級別項目的情況
        for (let i = 0; i < result.length; i++) {
          if (result[i].id === targetId) {
            if (position === "before") {
              // 在目標項目前插入
              result.splice(i, 0, itemToInsert);
              return result;
            } else if (position === "after") {
              // 在目標項目後插入
              result.splice(i + 1, 0, itemToInsert);
              return result;
            } else if (position === "inside") {
              // 作為目標項目的子項目插入
              result[i] = {
                ...result[i],
                children: [...result[i].children, itemToInsert],
                expanded: true, // 自動展開
              };
              return result;
            }
          }

          // 遞迴處理子項目
          if (result[i].children && result[i].children.length > 0) {
            const updatedChildren = insertItem(
              result[i].children,
              targetId,
              itemToInsert,
              position,
            );

            // 如果子項目有變化，更新當前項目
            if (updatedChildren !== result[i].children) {
              result[i] = {
                ...result[i],
                children: updatedChildren,
              };
              return result;
            }
          }
        }

        return result;
      };

      // 將拖曳項目插入到新位置
      const finalItems = insertItem(
        itemsWithoutDragged,
        dragOverItem,
        draggedItemCopy,
        dragOverPosition,
      );

      // 更新狀態
      setItems(finalItems);
    } catch (error) {
      console.error("Error during drag and drop:", error);
    }

    // 重置拖曳狀態
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
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, item.id)}
              className={`group flex items-center rounded-md border ${
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
              {item.children.length > 0 && (
                <Button
                  onClick={() => toggleExpanded(item.id)}
                  variant="ghost"
                  size="icon"
                  className="mr-1 h-6 w-6 p-0 text-gray-500 hover:text-gray-800 focus:outline-none"
                >
                  {item.expanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </Button>
              )}

              {/* 空白填充，讓沒有子項目的項目保持對齊 */}
              {item.children.length === 0 && <div className="mr-1 w-6" />}

              {/* 拖動把手 */}
              <div
                draggable
                onDragStart={() => setDraggedItem(item.id)}
                className="mr-2 cursor-move text-gray-400 hover:text-gray-600"
              >
                <GripVertical className="h-4 w-4" />
              </div>

              {/* 項目內容 */}
              <p className="item-text w-full">
                <span>{item.text}</span>
                <br />
                <span className="text-xs text-gray-400">{item.itemType}</span>
              </p>

              {/* 備註指示器 */}
              {item.notes && (
                <span
                  className="mx-1 cursor-help text-xs text-gray-400"
                  title={`備註: ${item.notes}`}
                >
                  <Info className="h-3 w-3" />
                </span>
              )}

              {/* 操作按鈕組 */}
              <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                {/* 新增子項目按鈕 */}
                <Button
                  onClick={() => openAddItemDialog(item.id)}
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-7 w-7 p-0 text-gray-400 hover:text-green-500"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                {/* 編輯按鈕 */}
                <Button
                  onClick={() => openEditDialog(item)}
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-7 w-7 p-0 text-gray-400 hover:text-blue-500"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                {/* 刪除按鈕 */}
                <Button
                  onClick={() => openDeleteDialog(item.id)}
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
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
    <div className="mx-auto max-w-4xl p-6">
      {/* <h1 className="mb-6 text-2xl font-bold">巢狀式項目管理器</h1> */}

      <div className="mb-2 flex items-center justify-between gap-2">
        <Button
          onClick={() => openAddItemDialog()}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          新增項目
        </Button>

        <div className="flex items-center justify-between gap-2">
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

      <Card>
        <CardContent className="p-2">{renderItems(items)}</CardContent>
      </Card>

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
              <select
                id="itemType"
                value={itemFormData.itemType}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, itemType: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {itemTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
            <Button onClick={handleItemFormSubmit} type="submit">
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
            <AlertDialogAction onClick={confirmDelete}>
              確認刪除
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
            <DialogTitle>項目結構文字格式</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-4 text-sm">
                {formattedText}
              </pre>
              <Button
                className="absolute right-2 top-2"
                size="sm"
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(formattedText);
                  // 可以加入複製成功的提示
                }}
              >
                複製
              </Button>
            </div>
          </div>
          <DialogFooter>
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
              // @ts-ignore
              if (window.mermaid) {
                // @ts-ignore
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

      <Dialog open={structureDialogOpen} onOpenChange={setStructureDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>項目架構圖</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div
              className="mb-4 overflow-auto rounded border p-4"
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
            <div className="mt-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(mermaidCode);
                }}
                className="mr-2"
              >
                複製 Mermaid 代碼
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>關閉</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NestedItemManager;
