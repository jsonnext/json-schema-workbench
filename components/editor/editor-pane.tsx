"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { SchemaState } from "@/store/main"

import { JSONEditorProps } from "./json-editor"
import { EditorMenu } from "./menu"

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
  // TODO: move both value states to store
  const [editorValue, setEditorValue] = useState(value)

  useEffect(() => {
    setEditorValue(value)
  }, [value])
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-md pl-2 font-medium w-full">{heading}</h3>
        <EditorMenu
          heading={heading}
          editorKey={editorKey}
          value={value}
          setValue={setEditorValue}
        />
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
