import { useState } from "react"
import { SchemaState, useMainStore } from "@/store/main"
import { Check, ImportIcon } from "lucide-react"

import { JSONModes } from "@/types/editor"
import { parse, serialize } from "@/lib/json"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"

export const FileDialog = ({
  editorKey,
  setValueString
}: {
  editorKey: keyof SchemaState["editors"]
  setValueString: (val: string) => void
}) => {
  const [imported, setImported] = useState<
    Record<string, unknown> | undefined
  >()
//   const setValueString = useMainStore((state) =>
//     editorKey === "schema" ? state.setSchemaString : state.setTestValueString
//   )
//   const setDirectSelectedSchema = useMainStore((state) => state.setDirectSelectedSchema!)
  const editorMode = useMainStore(
    (state) => state.editors[editorKey].mode ?? state.userSettings.mode
  )
  return (
    <Dialog>
      <DialogTrigger>
        <ImportIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-lg">
          <div className="mb-2">Import {editorKey} File...</div>
          <Separator className="h-[1px] bg-ring" />
        </DialogHeader>
        <div>
          <Label htmlFor="importFile">From your device</Label>
          <Input
            name="importFile"
            type="file"
            accept=".json,.yml,.yaml,.json5,.jsonc,.json5c,.json-ld"
            // to undo the above stopPropogation() within this scope
            onClick={(e) => e.stopPropagation()}
            onChange={async (e) => {
              try {
                // TODO: move to zustand
                const file = e?.target?.files?.[0]
                if (file) {
                  const fileText = await file.text()
                  if (
                    file.type.includes(JSONModes.JSON5) ||
                    file.type.includes("jsonc") ||
                    file.type.includes("json5c")
                  ) {
                    setImported(parse(JSONModes.JSON5, fileText))
                  } else if (file.type.includes("json")) {
                    setImported(JSON.parse(fileText))
                  }

                  if (file.type.includes("yaml") || file.type.includes("yml")) {
                    setImported(parse(JSONModes.YAML, fileText))
                  }
                }
              } catch (err) {
                console.error(err)
              }
            }}
          />

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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={(e) => {
                // e.stopPropagation()
                setValueString(
                    serialize(editorMode, imported as Record<string, unknown>)
                  )
                // if (editorKey === "schema" && imported) {
                //     setDirectSelectedSchema(imported)
                // }
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
  )
}
