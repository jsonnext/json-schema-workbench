"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { SchemaState, useMainStore } from "@/store/main"
import json5 from "json5"
import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandInput } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Input } from "../ui/input"
import { JSONEditorProps } from "./json-editor"

export interface EditorPane extends Omit<Omit<JSONEditorProps, "value">, "on"> {
  heading: string
  editorKey: keyof SchemaState["editors"]
  value?: Record<string, unknown>
}

const JSONEditor = dynamic(
  async () => (await import("./json-editor")).JSONEditor,
  { ssr: false }
)

export const EditorPane = ({
  onValueChange,
  value,
  schema,
  editorKey,
  heading,
  ...props
}: EditorPane) => {
  const [editorValue, setEditorValue] = useState(value)
  const editorMode = useMainStore(
    (state) => state.editors[editorKey].mode ?? state.userSettings.mode
  )
  const setEditorSetting = useMainStore((state) => state.setEditorSetting)

  return (
    <>
      <div className="flex items-center justify-between border">
        <h3 className="text-md pl-2 font-medium">{heading}</h3>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-none border-l">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuRadioGroup
                  value={editorMode}
                  onValueChange={(val) =>
                    setEditorSetting(editorKey, "mode", val)
                  }
                >
                  <DropdownMenuRadioItem value={"json4"}>
                    JSON4
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={"json5"}>
                    JSON5
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {/* <UserPlus className="mr-2 h-4 w-4" /> */}
                  <span>Import</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>
                      {/* <Mail className="mr-2 h-4 w-4" /> */}
                      <div className="mr-2">From File</div>
                      <div>
                        <Input
                          type="file"
                          multiple={false}
                          id="fromFile"
                          accept=".json,.json5,,yaml,.yml,.csv"
                          onSelect={() => {
                            const file = document.getElementById("fromFile")
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (e) => {
                                if (!e.target?.result) return
                                if (isArrayBuffer(e.target.result)) {
                                  const contents = new TextDecoder(
                                    "utf-8"
                                  ).decode(e.target.result)
                                  if (contents) {
                                    setEditorValue(JSON.parse(contents))
                                  }
                                  return
                                }

                                reader.readAsText(file.files[0])
                              }
                            }
                          }}
                        />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {/* <MessageSquare className="mr-2 h-4 w-4" /> */}
                      <span>From URL</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem>Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <JSONEditor
        onValueChange={onValueChange}
        value={editorValue}
        // json schema spec v? allow spec selection
        schema={schema}
        editorKey={editorKey}
        className="flex-1 overflow-auto"
        height="100%"
        {...props}
      />
    </>
  )
}
