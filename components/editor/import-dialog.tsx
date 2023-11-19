import { useState } from 'react'
import { Button } from "../ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPortal,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import { JSONModes } from '@/types/editor'
import json5 from 'json5'
import { load as parseYaml } from "js-yaml"
import { Check } from 'lucide-react'
import { serialize } from '@/lib/json'
import { SchemaState, useMainStore } from '@/store/main'
import { useDebounce } from '@/app/hooks/use-debounce'
import { isValidUrl } from '@/lib/utils'

export interface ImportDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  heading: string
  editorKey: keyof SchemaState["editors"]
  setValueString: (val: string) => void
}
export const ImportDialog = ({ open, onOpenChange, heading, editorKey, setValueString }: ImportDialogProps) => {
  const [imported, setImported] = useState<unknown>(undefined)
  const [importUrl, setImportUrl] = useState('');

  const editorMode = useMainStore(
    (state) =>
      state.editors[editorKey].mode ??
      state.userSettings.mode
  )

  const debouncedImportUrlRequest = useDebounce(() => {
    console.log('fetch import url', importUrl);
    if (isValidUrl(importUrl)) {
      fetch(importUrl)
        .then((res) => res.text())
        .then((text) => {
          if (importUrl.includes(JSONModes.JSON5)) {
            setImported(json5.parse(text))
          } else if (importUrl.includes("json")) {
            setImported(JSON.parse(text))
          }

          if (importUrl.includes("yaml")) {
            setImported(parseYaml(text))
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent>
          <DialogHeader className="text-lg">
            <div className="mb-2">Import {heading} File...</div>
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
                // TODO: move to zustand
                const file = e?.target?.files?.[0]
                if (file) {
                  const fileText = await file.text()
                  if (file.type.includes(JSONModes.JSON5)) {
                    setImported(json5.parse(fileText))
                  } else if (file.type.includes("json")) {
                    setImported(JSON.parse(fileText))
                  }

                  if (file.type.includes("yaml")) {
                    setImported(parseYaml(fileText))
                  }
                }
              }}
            />

            <Label htmlFor={"urlImport"}>From a URL</Label>
            <Input
              id="urlImport"
              name="urlImport"
              type="url"
              placeholder="https://example.com/schema.json"
              onChange={(e) => {
                console.log(e.target.value)
                setImportUrl(e.target.value)
                debouncedImportUrlRequest()
              }}
              value={importUrl}
            />
            {imported ? (
              <div className="flex items-center">
                <Check className="mr-2 h-5 w-5 text-green-500" />
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
      </DialogPortal>
    </Dialog>
  )
}
