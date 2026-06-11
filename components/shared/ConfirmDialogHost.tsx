"use client";

import { useSyncExternalStore } from "react";
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
import {
  finishConfirm,
  getConfirmSnapshot,
  subscribeConfirm,
} from "@/lib/ui/confirm-store";

export function ConfirmDialogHost() {
  const request = useSyncExternalStore(
    subscribeConfirm,
    getConfirmSnapshot,
    () => null
  );

  return (
    <AlertDialog
      open={request != null}
      onOpenChange={(open) => {
        if (!open) finishConfirm(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{request?.title ?? ""}</AlertDialogTitle>
          <AlertDialogDescription>{request?.message ?? ""}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => finishConfirm(false)}>
            {request?.cancelLabel ?? "Batal"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => finishConfirm(true)}
            className={
              request?.destructive
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : undefined
            }
          >
            {request?.confirmLabel ?? "Ya"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
