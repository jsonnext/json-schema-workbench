"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { SchemaState, useMainStore } from "@/store/main"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"


import { MoreVertical } from "lucide-react"

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog"
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

              <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                <Dialog>
                  <DialogTrigger>Import</DialogTrigger>
                  <DialogContent>
                    <DialogHeader  className="text-lg">Import {heading} File...</DialogHeader>
                    <Separator className="bg-ring h-[1px]" />
                    <Label>From your device</Label>
                    <Input
                      type="file"
                      multiple={false}
                      accept=".json,.json5,.cson,.yml,.yaml,.csv"
                      disabled={false}
                      onChange={(e) => {
                        console.log(e.target.files)
                      }}
                      autoFocus
                    />
                    <Label htmlFor={"fileImport"}>From a URL</Label>
                    <Input
                      id="fileImport"
                      name="fileImport"
                      type="url"
                      disabled={false}
                      placeholder="https://example.com/schema.json"
                      onChange={(e) => {
                        console.log(e.target.value)
                      }}
                    />
                    <div>
                        <Button>
                            Import
                        </Button>
                        <Button variant="ghost" className="mr-2">
                            Cancel
                        </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem>

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
