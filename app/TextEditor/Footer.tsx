// Footer.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, CircleCheck, Undo, Redo, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FooterProps {
  text: string;
  copyStatus: boolean;
  currentIndex: number;
  historyLength: number;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onClear: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  text,
  copyStatus,
  currentIndex,
  historyLength,
  onUndo,
  onRedo,
  onCopy,
  onClear,
}) => {
  return (
    <div className="flex justify-between border-t border-gray-200 p-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash className="mr-1 h-5 w-[24px]" />
            刪除
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除文字嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作將刪除所有已輸入的文字內容，且無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={onClear}
            >
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onUndo}
          disabled={currentIndex <= 0}
          className="flex items-center"
        >
          <Undo className="mr-1 h-5 w-[24px]" />
          還原
        </Button>
        <Button
          variant="outline"
          onClick={onRedo}
          disabled={currentIndex >= historyLength - 1}
          className="flex items-center"
        >
          <Redo className="mr-1 h-5 w-[24px]" />
          取消
        </Button>
        <Button
          onClick={onCopy}
          variant="outline"
          disabled={copyStatus || !text}
        >
          {copyStatus ? (
            <CircleCheck className="mr-1 h-5 w-[24px]" />
          ) : (
            <Copy className="mr-1 h-5 w-[24px]" />
          )}
          {copyStatus ? "成功" : "複製"}
        </Button>
      </div>
    </div>
  );
};
