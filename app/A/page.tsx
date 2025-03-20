"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  X,
  Edit,
  Trash2,
  Plus,
  Info,
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

// 巢狀式項目管理器元件
const NestedItemManager = () => {
  // 初始項目資料
  const initialItems = [
    {
      id: "1",
      text: "項目 1",
      children: [],
      expanded: true,
      pageTitle: "", // 網頁標題
      pageType: "一般頁面", // 頁面類型
      notes: "", // 備註
    },
  ];

  // 項目資料狀態
  const [items, setItems] = useState<ItemState>(initialItems);
  // 新項目輸入框內容
  const [newItemText, setNewItemText] = useState("");
  // 編輯對話框狀態
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editItemText, setEditItemText] = useState("");
  const [editPageTitle, setEditPageTitle] = useState("");
  const [editPageType, setEditPageType] = useState("一般頁面");
  const [editNotes, setEditNotes] = useState("");
  // 頁面類型選項
  const pageTypeOptions = [
    "一般頁面",
    "產品頁面",
    "文章頁面",
    "聯絡表單",
    "關於我們",
  ];
  // 刪除確認對話框狀態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  // 拖曳狀態
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [dragOverPosition, setDragOverPosition] = useState(null); // 'before', 'after', 'inside'
  // 新增子項目對話框狀態
  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false);
  const [newChildText, setNewChildText] = useState("");
  const [parentItemId, setParentItemId] = useState(null);

  // 找到項目及其父項目
  interface Item {
    id: string;
    text: string;
    children: Item[];
    expanded: boolean;
    pageTitle: string;
    pageType: string;
    notes: string;
  }

  type ItemState = Item[];
  type FindResult = { item: Item; parent: Item | null; index: number } | null;

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
        (item) => item.id === draggedItemInfo.parent.id,
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
          : newItems.findIndex((item) => item.id === dropTargetInfo.parent.id);

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

  // 重置拖曳狀態
  const resetDragState = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    setDragOverPosition(null);
  };

  // 添加新項目
  const addItem = () => {
    if (newItemText.trim()) {
      const newItem = {
        id: `item-${Date.now()}`,
        text: newItemText,
        children: [],
        expanded: true,
        pageTitle: "",
        pageType: "一般頁面",
        notes: "",
      };

      setItems([...items, newItem]);
      setNewItemText("");
    }
  };

  // 添加子項目
  const addChildItem = () => {
    if (!parentItemId || !newChildText.trim()) return;

    const newChild = {
      id: `item-${Date.now()}`,
      text: newChildText,
      children: [],
      expanded: true,
      pageTitle: "",
      pageType: "一般頁面",
      notes: "",
    };

    const addChildToParent = (itemsArray) => {
      return itemsArray.map((item) => {
        if (item.id === parentItemId) {
          return {
            ...item,
            children: [...item.children, newChild],
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
    setAddChildDialogOpen(false);
    setParentItemId(null);
    setNewChildText("");
  };

  // 打開編輯對話框
  const openEditDialog = (item: Item) => {
    setEditItem(item);
    setEditItemText(item.text);
    setEditPageTitle(item.pageTitle || "");
    setEditPageType(item.pageType || "一般頁面");
    setEditNotes(item.notes || "");
    setEditDialogOpen(true);
  };

  // 保存編輯
  const saveEdit = () => {
    if (!editItem || !editItemText.trim()) return;

    const updateItem = (itemsArray) => {
      return itemsArray.map((item) => {
        if (item.id === editItem.id) {
          return {
            ...item,
            text: editItemText,
            pageTitle: editPageTitle,
            pageType: editPageType,
            notes: editNotes,
          };
        }
        if (item.children.length) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };

    setItems(updateItem([...items]));
    setEditDialogOpen(false);
    setEditItem(null);
    setEditItemText("");
    setEditPageTitle("");
    setEditPageType("一般頁面");
    setEditNotes("");
  };

  // 打開刪除確認對話框
  const openDeleteDialog = (itemId) => {
    setDeleteItemId(itemId);
    setDeleteDialogOpen(true);
  };

  // 確認刪除項目
  const confirmDelete = () => {
    if (!deleteItemId) return;

    const deleteFromArray = (itemsArray: Item[]) => {
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
    const toggleItem = (itemsArray) => {
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

  // 處理拖曳經過事件
  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (draggedItem === itemId) return;

    // 獲取項目的DOM元素
    const itemElement = e.currentTarget;
    const rect = itemElement.getBoundingClientRect();

    // 確定拖曳位置
    const position = getDragPosition(e, rect);

    // 更新狀態
    setDragOverItem(itemId);
    setDragOverPosition(position);
  };

  // 打開新增子項目對話框
  const openAddChildDialog = (itemId: string) => {
    setParentItemId(itemId);
    setNewChildText("");
    setAddChildDialogOpen(true);
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
                <span className="text-gray-400">{item.pageType}</span>
              </p>

              {/* 屬性指示器 */}
              {(item.pageTitle || item.notes) && (
                <span
                  className="mx-1 cursor-help text-xs text-gray-400"
                  title={`${item.pageTitle ? "標題: " + item.pageTitle + " | " : ""}${item.pageType ? "類型: " + item.pageType + " | " : ""}${item.notes ? "備註: " + item.notes : ""}`}
                >
                  <Info className="h-3 w-3" />
                </span>
              )}

              {/* 新增子項目按鈕 */}
              <Button
                onClick={() => openAddChildDialog(item.id)}
                variant="ghost"
                size="icon"
                className="ml-1 h-7 w-7 p-0 text-gray-400 opacity-0 transition-opacity hover:text-green-500 group-hover:opacity-100"
              >
                <Plus className="h-4 w-4" />
              </Button>

              {/* 編輯按鈕 */}
              <Button
                onClick={() => openEditDialog(item)}
                variant="ghost"
                size="icon"
                className="ml-1 h-7 w-7 p-0 text-gray-400 opacity-0 transition-opacity hover:text-blue-500 group-hover:opacity-100"
              >
                <Edit className="h-4 w-4" />
              </Button>

              {/* 刪除按鈕 */}
              <Button
                onClick={() => openDeleteDialog(item.id)}
                variant="ghost"
                size="icon"
                className="ml-1 h-7 w-7 p-0 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">巢狀式項目管理器</h1>

      <div className="mb-6 flex">
        <Input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="輸入新項目..."
          className="rounded-r-none bg-white"
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <Button onClick={addItem} className="rounded-l-none">
          <Plus className="mr-2 h-4 w-4" />
          新增項目
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">{renderItems(items)}</CardContent>
      </Card>

      {/* 編輯對話框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>編輯項目</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="itemName" className="text-sm font-medium">
                項目名稱
              </label>
              <Input
                id="itemName"
                value={editItemText}
                onChange={(e) => setEditItemText(e.target.value)}
                placeholder="輸入項目名稱"
                className="w-full"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="pageTitle" className="text-sm font-medium">
                網頁標題
              </label>
              <Input
                id="pageTitle"
                value={editPageTitle}
                onChange={(e) => setEditPageTitle(e.target.value)}
                placeholder="輸入網頁標題"
                className="w-full"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="pageType" className="text-sm font-medium">
                頁面類型
              </label>
              <select
                id="pageType"
                value={editPageType}
                onChange={(e) => setEditPageType(e.target.value)}
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
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="輸入備註..."
                className="min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button onClick={saveEdit} type="submit">
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增子項目對話框 */}
      <Dialog open={addChildDialogOpen} onOpenChange={setAddChildDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增子項目</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newChildText}
              onChange={(e) => setNewChildText(e.target.value)}
              placeholder="輸入子項目名稱"
              className="w-full"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && addChildItem()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button onClick={addChildItem} type="submit">
              新增
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
    </div>
  );
};

export default NestedItemManager;
