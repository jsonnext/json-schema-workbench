import React, { useState } from "react"
import { SchemaState, useMainStore } from "@/store/main"
import { DialogClose } from "@radix-ui/react-dialog"
import { load as parseYaml } from "js-yaml"
import json5 from "json5"
import { Check, CheckIcon, MoreVertical } from "lucide-react"

import { JSONModes } from "@/types/editor"
import { serialize } from "@/lib/json"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTrigger,
} from "../ui/dialog"

export interface EditorMenu {
  heading: string
  editorKey: keyof SchemaState["editors"]
  value?: string
  setValueString: (val: string) => void
  menuPrefix?: React.ReactNode
  menuSuffix?: React.ReactNode
  onOpenImportDialog?: () => void
  onFormat?: () => void
}

export const EditorMenu = ({
  editorKey,
  heading,
  setValueString,
  menuPrefix,
  menuSuffix,
  value,
  onOpenImportDialog,
  onFormat,
}: EditorMenu) => {
  const setEditorSetting = useMainStore((state) => state.setEditorSetting)

  const editorMode = useMainStore(
    (state) =>
      state.editors[editorKey as keyof SchemaState["editors"]].mode ??
      state.userSettings.mode
  )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none rounded-tr-lg"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          {menuPrefix && menuPrefix}
          <DropdownMenuGroup>
            <DropdownMenuRadioGroup
              value={editorMode}
              onValueChange={(val) => setEditorSetting(editorKey, "mode", val)}
            >
              <DropdownMenuRadioItem
                value={JSONModes.JSON4}
                className="cursor-pointer"
              >
                JSON4
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value={JSONModes.JSON5}
                className="cursor-pointer"
              >
                JSON5
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onOpenImportDialog} className='cursor-pointer'>Import</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onFormat?.()} className='cursor-pointer'>
              Format
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {menuSuffix && menuSuffix}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}
