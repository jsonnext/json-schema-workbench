"use client"

import { SchemaState, useMainStore } from "@/store/main"

// import { JsonForms } from "@jsonforms/react"
// import { vanillaCells, vanillaRenderers, vanillaStyles } from "@jsonforms/vanilla-renderers"

import { JSONModes } from "@/types/editor"
import { parse, serialize } from "@/lib/json"

import { JSONEditor } from "./json-editor"
import { EditorMenu } from "./menu"
// const SchemaViewer = dynamic(
//   async () => (await import("./schema-viewer")).SchemaViewer,
//   { ssr: false }
// )

import { SchemaViewer } from "./schema-viewer"

// const JSONEditor = dynamic(
//   async () => (await import("./json-editor")).JSONEditor,
//   { ssr: false }
// )

export interface EditorPane {
  heading: string
  editorKey: keyof SchemaState["editors"]
  schema?: Record<string, unknown>
  value?: string
  setValueString: (val: string) => void
}

export const EditorPane = ({
  // schema,
  editorKey,
  heading,
  value,
  setValueString,
  // mode,
  ...props
}: EditorPane) => {
  const editorView = useMainStore(
    (state) => state.editors[editorKey].view ?? "editor"
  )

  const schemaValue = useMainStore((state) => state.schema)
  return (
    <>
      <div className="flex items-center justify-between rounded-lg">
        <h3 className="text-md w-full pl-2 font-medium">{heading}</h3>
        <EditorMenu
          heading={heading}
          editorKey={editorKey}
          value={value}
          setValueString={setValueString}
        />
      </div>
      <div className="flex-1-1 flex h-full w-full overflow-auto">
        {value && editorKey === "schema" && editorView === "viewer" ? (
          <SchemaViewer />
        ) : null}
        {/* {editorKey === "testValue" && editorView === "viewer" ? (
          <JsonForms
            schema={schemaValue}
            data={parsedEditorValue}
            renderers={vanillaRenderers}
            cells={vanillaCells}
           onChange={({ data, _errors }) => setValueString(serialize(editorMode,data))}
          />
        ) : null} */}

        {editorView === "editor" && (
          <JSONEditor
            onValueChange={setValueString}
            // value={editorValue}
            // json schema spec v? allow spec selection
            schema={schemaValue}
            editorKey={editorKey}
            className="flex-1-1 flex h-full w-full"
            height="100%"
            width="100%"
            value={value}
            {...props}
          />
        )}
      </div>
    </>
  )
}
