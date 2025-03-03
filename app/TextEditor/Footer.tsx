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
    <div className="flex w-full justify-between border-gray-200 p-2 !pt-0 md:p-3">
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
        <div className="flex h-[36px] overflow-hidden rounded-md border border-input shadow-sm">
          <Button
            variant="outline"
            onClick={onUndo}
            disabled={currentIndex <= 0}
            className="flex w-[40px] items-center rounded-none border-none md:w-auto"
            title="還原"
          >
            <Undo className="h-5 w-[24px]" />
            <p className="hidden md:block">還原</p>
          </Button>
          <Button
            variant="outline"
            onClick={onRedo}
            disabled={currentIndex >= historyLength - 1}
            className="flex w-[40px] items-center rounded-none border-b-0 border-r-0 border-t-0 md:w-auto"
            title="取消還原"
          >
            <Redo className="h-5" />
            <p className="hidden md:block">取消</p>
          </Button>
        </div>
        <Button
          onClick={onCopy}
          // variant="outline"
          disabled={copyStatus || !text}
          className=""
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
