"use client"

import { useEffect, useRef, useState } from "react"
import { autocompletion, closeBrackets } from "@codemirror/autocomplete"
import { history } from "@codemirror/commands"
import { bracketMatching, syntaxHighlighting } from "@codemirror/language"
import { lintGutter } from "@codemirror/lint"
import { EditorState } from "@codemirror/state"
import { oneDark, oneDarkHighlightStyle } from "@codemirror/theme-one-dark"
import { EditorView, ViewUpdate, gutter, lineNumbers } from "@codemirror/view"
import CodeMirror, { ReactCodeMirrorProps, ReactCodeMirrorRef } from "@uiw/react-codemirror"
import { basicSetup } from "codemirror"
import { jsonSchema, updateSchema } from "codemirror-json-schema"
// @ts-expect-error TODO: fix this in the lib!
import { json5Schema } from "codemirror-json-schema/json5"

// import { debounce } from "@/lib/utils"
import { jsonDark, jsonDarkTheme } from "./theme"

const jsonText = `{ 
  "example": true
}`

/**
 * none of these are required for json4 or 5
 * but they will improve the DX
 */
const commonExtensions = [
  bracketMatching(),
  closeBrackets(),
  history(),
  autocompletion(),
  lineNumbers(),
  lintGutter(),
  jsonDark,
  EditorView.lineWrapping,
  EditorState.tabSize.of(2),
  syntaxHighlighting(oneDarkHighlightStyle),
]

interface JSONEditorProps extends ReactCodeMirrorProps {
  value: string;
  onValueChange?: (newValue: string) => void;
  schema?: Record<string, unknown>;
  mode?: "json5" | "json4";
}
export const JSONEditor = ({
  value,
  schema,
  onValueChange = () => {},
  mode = "json4",
  ...rest
}: JSONEditorProps) => {
  const isJson5 = mode === "json5"
  const defaultExtensions = [
    ...commonExtensions,
    isJson5 ? json5Schema(schema) : jsonSchema(schema),
  ]
  const editorRef = useRef<ReactCodeMirrorRef>(null)

  useEffect(() => {
    if (!schema || !editorRef?.current?.view) {
      return
    }
    updateSchema(editorRef?.current.view, schema)
  }, [schema])

  return (
    <CodeMirror
      value={value ?? "{}"}
      extensions={defaultExtensions}
      onChange={onValueChange}
      theme={jsonDarkTheme}
      ref={editorRef}
      {...rest}
    />
  )
}
