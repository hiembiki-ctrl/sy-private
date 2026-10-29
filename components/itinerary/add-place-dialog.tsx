"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { ItineraryItem, ItineraryKind } from "@/lib/cities";

const CUSTOM_SUMMARY = "직접 추가한 장소입니다.";

type AddPlaceDialogProps = {
  /** 열려 있는 일차. null이면 닫힌다. */
  day: number | null;
  /** 지금 일정에 없는 이 도시의 다른 장소. */
  candidates: ItineraryItem[];
  /** 일정에 이미 있는 장소 이름. 직접 입력한 이름이 겹치는지 확인한다. */
  existingNames: string[];
  onAdd: (item: ItineraryItem) => void;
  onClose: () => void;
};

export function AddPlaceDialog({ day, candidates, existingNames, onAdd, onClose }: AddPlaceDialogProps) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ItineraryKind>("명소");

  const trimmed = name.trim();
  const duplicate = existingNames.includes(trimmed);

  function close() {
    setName("");
    setKind("명소");
    onClose();
  }

  function addCustom() {
    if (!trimmed || duplicate) return;
    onAdd({ name: trimmed, summary: CUSTOM_SUMMARY, kind });
    close();
  }

  return (
    <Dialog open={day !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{day}일차에 장소 추가</DialogTitle>
          <DialogDescription>
            이 도시의 다른 장소를 고르거나 직접 입력해요. 저장하기 전에는 이 화면에만 적용돼요.
          </DialogDescription>
        </DialogHeader>

        {candidates.length > 0 && (
          <ul aria-label="추가할 수 있는 장소" className="flex max-h-56 flex-col gap-2 overflow-y-auto">
            {candidates.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{item.name}</span>
                  <Badge variant={item.kind === "명소" ? "secondary" : "outline"}>{item.kind}</Badge>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-label={`${item.name} 추가`}
                  onClick={() => {
                    onAdd(item);
                    close();
                  }}
                >
                  추가
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addCustom();
          }}
        >
          <label htmlFor="custom-place-name" className="text-sm font-medium">
            직접 입력
          </label>
          <div className="flex gap-2">
            <Input
              id="custom-place-name"
              value={name}
              placeholder="장소 이름"
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
            />
            <NativeSelect
              aria-label="장소 종류"
              value={kind}
              onChange={(e) => setKind(e.target.value as ItineraryKind)}
            >
              <NativeSelectOption value="명소">명소</NativeSelectOption>
              <NativeSelectOption value="액티비티">액티비티</NativeSelectOption>
            </NativeSelect>
          </div>
          {duplicate && (
            <p className="text-xs text-destructive">이미 일정에 있는 장소예요.</p>
          )}
          <Button type="submit" size="sm" disabled={!trimmed || duplicate}>
            직접 입력한 장소 추가
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
