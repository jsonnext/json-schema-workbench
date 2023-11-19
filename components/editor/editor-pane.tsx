import { useState } from "react"
import dynamic from "next/dynamic"
import { SchemaState } from "@/store/main"

import { ImportDialog } from "./import-dialog"
import { EditorMenu } from "./menu"

export interface EditorPane {
  heading: string
  editorKey: keyof SchemaState["editors"]
  schema?: Record<string, unknown>
  value?: string
  setValueString: (val: string) => void
}

const JSONEditor = dynamic(
  async () => (await import("./json-editor")).JSONEditor,
  { ssr: false }
)

export const EditorPane = ({
  schema,
  editorKey,
  heading,
  value,
  setValueString,
  ...props
}: EditorPane) => {
  const [openImportDialog, setOpenImportDialog] = useState(false)
  return (
    <>
      <div className="flex items-center justify-between rounded-lg">
        <h3 className="text-md w-full pl-2 font-medium">{heading}</h3>
        <EditorMenu
          heading={heading}
          editorKey={editorKey}
          value={value}
          setValueString={setValueString}
          onOpenImportDialog={() => setOpenImportDialog(true)}
        />
      </div>
      <JSONEditor
        onValueChange={setValueString}
        // value={editorValue}
        // json schema spec v? allow spec selection
        schema={schema}
        editorKey={editorKey}
        className="flex-1 overflow-auto"
        height="100%"
        value={value}
        {...props}
      />
      <ImportDialog
        heading={heading}
        setValueString={setValueString}
        editorKey={editorKey}
        open={openImportDialog}
        onOpenChange={setOpenImportDialog}
      />
    </>
  )
}
