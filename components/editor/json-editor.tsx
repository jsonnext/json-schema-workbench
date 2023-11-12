"use client"

import { json } from "stream/consumers"
import { use, useEffect, useRef, useState } from "react"
import { SchemaState, useMainStore } from "@/store/main"
import { autocompletion, closeBrackets } from "@codemirror/autocomplete"
import { history } from "@codemirror/commands"
import { bracketMatching, syntaxHighlighting } from "@codemirror/language"
import { lintGutter } from "@codemirror/lint"
import { EditorState } from "@codemirror/state"
import { oneDark, oneDarkHighlightStyle } from "@codemirror/theme-one-dark"
import { EditorView, ViewUpdate, gutter, lineNumbers } from "@codemirror/view"
import CodeMirror, {
  ReactCodeMirrorProps,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror"
import { basicSetup } from "codemirror"
import { jsonSchema, updateSchema } from "codemirror-json-schema"
// @ts-expect-error TODO: fix this in the lib!
import { json5Schema } from "codemirror-json-schema/json5"
import json5 from "json5"

import { JSONModes } from "@/types/editor"

// import { debounce } from "@/lib/utils"
import { jsonDark, jsonDarkTheme } from "./theme"

const jsonText = `{ 
}`

/**
 * none of these are required for json4 or 5
 * but they will improve the DX
 */
const commonExtensions = [
  history(),
  autocompletion(),
  jsonDark,
  EditorView.lineWrapping,
  EditorState.tabSize.of(2),
  syntaxHighlighting(oneDarkHighlightStyle),
]

const languageExtensions = {
  json4: jsonSchema,
  json5: json5Schema,
}

export interface JSONEditorProps extends Omit<ReactCodeMirrorProps, "value"> {
  value?: Record<string, unknown>
  onValueChange?: (newValue: string) => void
  schema?: Record<string, unknown>
  editorKey?: string
}
export const JSONEditor = ({
  value,
  schema,
  onValueChange = () => {},
  editorKey,
  ...rest
}: JSONEditorProps) => {
  const editorMode = useMainStore(
    (state) =>
      state.editors[editorKey as keyof SchemaState["editors"]].mode ??
      state.userSettings.mode
  )
  const languageExtension = languageExtensions[editorMode](schema)
  const editorRef = useRef<ReactCodeMirrorRef>(null)

  useEffect(() => {
    if (!schema || !editorRef?.current?.view) {
      return
    }
    updateSchema(editorRef?.current.view, schema)
  }, [schema])

  const stringValue = useMainStore((state) => {
    const editorMode = state.editors.schema.mode ?? state.userSettings.mode
    return editorMode === "json4"
      ? JSON.stringify(value, null, 2)
      : json5.stringify(value, null, 2)
  })
  return (
    <CodeMirror
      value={stringValue}
      extensions={[...commonExtensions, languageExtension]}
      onChange={onValueChange}
      theme={jsonDarkTheme}
      ref={editorRef}
      contextMenu="true"
      {...rest}
    />
  )
}
