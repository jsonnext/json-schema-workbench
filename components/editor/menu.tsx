import React, { useState } from "react"
import { SchemaState, useMainStore } from "@/store/main"
import { DialogClose } from "@radix-ui/react-dialog"
import { load as parseYaml } from "js-yaml"
import json5 from "json5"
import { Check, CheckIcon, MoreVertical } from "lucide-react"

import { JSONModes } from "@/types/editor"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
  DialogTrigger,
} from "../ui/dialog"
import { serialize } from "@/lib/json"

export interface EditorMenu {
  heading: string
  editorKey: keyof SchemaState["editors"]
  value?: string
  setValueString: (val: string) => void
  menuPrefix?: React.ReactNode
  menuSuffix?: React.ReactNode
}

export const EditorMenu = ({
  editorKey,
  heading,
  setValueString,
  menuPrefix,
  menuSuffix,
  value
}: EditorMenu) => {
  const [imported, setImported] = useState<unknown>(undefined)

  const setEditorSetting = useMainStore((state) => state.setEditorSetting)

  const editorMode = useMainStore(
    (state) =>
      state.editors[editorKey as keyof SchemaState["editors"]].mode ??
      state.userSettings.mode
  )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-none">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {menuPrefix && menuPrefix}
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={editorMode}
            onValueChange={(val) => setEditorSetting(editorKey, "mode", val)}
          >
            <DropdownMenuRadioItem value={JSONModes.JSON4} className="cursor-pointer">
              JSON4
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={JSONModes.JSON5} className="cursor-pointer">
              JSON5
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(e) => e.preventDefault()}>
            <Dialog>
              <DialogTrigger className="w-full text-left">
                <span>Import</span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader className="text-lg">
                  Import {heading} File...
                </DialogHeader>
                <div>
                  <Separator className="h-[1px] bg-ring" />
                  <Label htmlFor="importFile">From your device</Label>
                  <Input
                    name="importFile"
                    type="file"
                    accept=".json,.yml,.yaml,.json5,.jsonc,.json5c,.json-ld"
                    // to undo the above stopPropogation() within this scope
                    onClick={(e) => e.stopPropagation()}
                    onChange={async (e) => {
                      // TODO: move to zustand
                      const file = e?.target?.files?.[0]
                      if (file) {
                        const fileText = await file.text()
                        if (file.type.includes(JSONModes.JSON5)) {
                          setImported(json5.parse(fileText))
                        } else if (file.type.includes(JSONModes.JSON4)) {
                          setImported(JSON.parse(fileText))
                        }

                        if (file.type.includes("yaml")) {
                          setImported(parseYaml(fileText))
                        }
                      }
                    }}
                  />
                </div>
                <Label htmlFor={"urlImport"}>From a URL</Label>
                <Input
                  id="urlImport"
                  name="urlImport"
                  type="url"
                  disabled={false}
                  placeholder="https://example.com/schema.json"
                //   onChange={(e) => {
                //     console.log(e.target.value)
                //   }}
                />
                {imported ? (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    This file can be imported{" "}
                  </div>
                ) : null}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      onClick={(e) => {
                        // e.stopPropagation()
                        setValueString(serialize(editorMode, imported as Record<string, unknown>))
                        setImported(undefined)
                      }}
                      type="submit"
                      disabled={!imported}
                    >
                      Import
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      className="mr-2"
                      onClick={() => setImported(undefined)}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>

          <DropdownMenuItem>Export</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => value && setValueString(value)}>Format</DropdownMenuItem>
        </DropdownMenuGroup>
        {menuSuffix && menuSuffix}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
