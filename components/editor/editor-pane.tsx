"use client"

import { Suspense } from "react"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { SchemaState, useMainStore } from "@/store/main"
import { useTheme } from "next-themes"

import { parse, serialize } from "@/lib/json"

import { JSONEditor } from "./json-editor"
import { JsonSchemaForm } from "./json-schema-form"
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

  const theme = useTheme()

  return (
    <>
      <div className="flex items-center justify-between rounded-lg overflow-x-auto overflow-y-hidden">
        <h3 className="text-md w-full pl-2 font-medium">{heading}</h3>
        <EditorMenu
          heading={heading}
          editorKey={editorKey}
          value={value}
          setValueString={setValueString}
        />
      </div>
      <div
        className="flex-1-1 flex h-full w-full overflow-auto"
        data-theme={theme.theme ?? 'dark'}
      >
        {value && editorKey === "schema" && editorView === "viewer" ? (
          <Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary
              errorComponent={(err) => <div>{JSON.stringify(err)}</div>}
            >
              <SchemaViewer />
            </ErrorBoundary>
          </Suspense>
        ) : null}
        {editorKey === "testValue" &&
        editorView === "viewer" &&
        schemaValue &&
        value ? (
          <Suspense fallback={<div>Loading...</div>}>
            <JsonSchemaForm editorKey={editorKey} />
          </Suspense>
        ) : null}

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
