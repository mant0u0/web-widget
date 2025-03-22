"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Edit,
  Trash2,
  Plus,
  Info,
  FileText,
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

// 定義項目介面
interface Item {
  id: string;
  text: string;
  children: Item[];
  expanded: boolean;
  pageType: string;
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
      pageType: "一般頁面",
      notes: "",
    },
  ];

  // 頁面類型選項
  const pageTypeOptions = [
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

  // 拖曳狀態
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null); // 'before', 'after', 'inside'

  // 項目表單狀態
  const [itemFormData, setItemFormData] = useState({
    id: "",
    text: "",
    pageType: "一般頁面",
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
      pageType: "一般頁面",
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
      pageType: item.pageType,
      notes: item.notes,
      parentId: null,
      isEdit: true,
    });
    setDialogOpen(true);
  };

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
              pageType: itemFormData.pageType,
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
        id: `item-${Date.now()}`,
        text: itemFormData.text,
        children: [],
        expanded: true,
        pageType: itemFormData.pageType,
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

    // 項目的上三分之一部分
    if (relativeY < itemHeight / 3) {
      return "before";
    }
    // 項目的下三分之一部分
    else if (relativeY > (itemHeight / 3) * 2) {
      return "after";
    }
    // 項目的中間三分之一部分
    else {
      return "inside";
    }
  };

  // 處理拖曳結束事件
  const handleDragEnd = (e: React.DragEvent) => {
    if (!draggedItem || !dragOverItem || !dragOverPosition) {
      resetDragState();
      return;
    }

    // 避免放置到自身或子項目
    if (draggedItem === dragOverItem) {
      resetDragState();
      return;
    }

    // 檢查是否拖到自己的子項目中
    const isChildOf = (childId: string, parentId: string) => {
      const parent = findItemAndParent(parentId);
      if (!parent) return false;

      const checkChildren = (children: Item[]) => {
        for (const child of children) {
          if (child.id === childId) return true;
          if (child.children.length && checkChildren(child.children))
            return true;
        }
        return false;
      };

      return checkChildren(parent.item.children);
    };

    if (isChildOf(dragOverItem, draggedItem)) {
      resetDragState();
      return;
    }

    // 找到拖曳項目和目標項目
    const draggedItemInfo = findItemAndParent(draggedItem);
    const dropTargetInfo = findItemAndParent(dragOverItem);

    if (!draggedItemInfo || !dropTargetInfo) {
      resetDragState();
      return;
    }

    // 創建拖曳項目的複本
    const draggedItemCopy = { ...draggedItemInfo.item };

    // 從原始位置移除項目
    let newItems = [...items];

    // 如果拖曳項目位於根級別
    if (draggedItemInfo.parent === null) {
      newItems.splice(draggedItemInfo.index, 1);
    } else {
      const parentIndex = newItems.findIndex(
        (item) => item.id === draggedItemInfo.parent!.id,
      );
      if (parentIndex !== -1) {
        newItems[parentIndex].children.splice(draggedItemInfo.index, 1);
      }
    }

    // 根據放置位置插入項目
    if (dragOverPosition === "inside") {
      // 作為子項目
      const targetIndex =
        dropTargetInfo.parent === null
          ? newItems.findIndex((item) => item.id === dropTargetInfo.item.id)
          : newItems.findIndex((item) => item.id === dropTargetInfo.parent!.id);

      if (targetIndex !== -1) {
        if (dropTargetInfo.parent === null) {
          // 目標是根級別項目
          newItems[targetIndex].children.push(draggedItemCopy);
          newItems[targetIndex].expanded = true; // 自動展開父項目
        } else {
          // 目標是子項目
          const childIndex = newItems[targetIndex].children.findIndex(
            (child) => child.id === dropTargetInfo.item.id,
          );
          if (childIndex !== -1) {
            newItems[targetIndex].children[childIndex].children.push(
              draggedItemCopy,
            );
            newItems[targetIndex].children[childIndex].expanded = true; // 自動展開父項目
          }
        }
      }
    } else {
      // 作為同級項目 (before或after)
      if (dropTargetInfo.parent === null) {
        // 目標是根級別項目
        const insertIndex =
          dropTargetInfo.index + (dragOverPosition === "after" ? 1 : 0);
        newItems.splice(insertIndex, 0, draggedItemCopy);
      } else {
        // 目標是子項目
        const parentIndex = newItems.findIndex(
          (item) =>
            dropTargetInfo.parent && item.id === dropTargetInfo.parent.id,
        );
        if (parentIndex !== -1) {
          const insertIndex =
            dropTargetInfo.index + (dragOverPosition === "after" ? 1 : 0);
          newItems[parentIndex].children.splice(
            insertIndex,
            0,
            draggedItemCopy,
          );
        }
      }
    }

    setItems(newItems);
    resetDragState();
  };

  // 處理拖曳經過事件
  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (draggedItem === itemId) return;

    // 獲取項目的DOM元素
    const itemElement = e.currentTarget as HTMLElement;
    const rect = itemElement.getBoundingClientRect();

    // 確定拖曳位置
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
      <ul className={`pl-0 ${depth > 0 ? "pl-6" : ""} list-none`}>
        {itemsList.map((item) => (
          <li
            key={item.id}
            className={`mb-2 ${draggedItem === item.id ? "opacity-50" : ""}`}
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
                <span className="text-xs text-gray-400">{item.pageType}</span>
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

  // 生成文字格式
  const generateTextFormat = () => {
    const buildTextTree = (itemsList: Item[], depth = 0): string => {
      let result = "";

      itemsList.forEach((item) => {
        // 添加縮排
        const indent = "  ".repeat(depth);
        // 構建項目文字
        result += `${indent}- ${item.text} (${item.pageType})${item.notes ? ` // ${item.notes}` : ""}\n`;

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
      <h1 className="mb-6 text-2xl font-bold">巢狀式項目管理器</h1>

      <div className="mb-6 flex gap-2">
        <Button
          onClick={() => openAddItemDialog()}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          新增項目
        </Button>

        <Button
          onClick={generateTextFormat}
          variant="outline"
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          顯示文字格式
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">{renderItems(items)}</CardContent>
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
                項目名稱
              </label>
              <Input
                id="itemName"
                value={itemFormData.text}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, text: e.target.value })
                }
                placeholder="輸入項目名稱"
                className="w-full"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleItemFormSubmit()}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="pageType" className="text-sm font-medium">
                頁面類型
              </label>
              <select
                id="pageType"
                value={itemFormData.pageType}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, pageType: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {pageTypeOptions.map((option) => (
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
    </div>
  );
};

export default NestedItemManager;
