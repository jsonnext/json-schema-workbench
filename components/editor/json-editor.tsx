"use client"

import { useEffect, useRef } from "react"
import { SchemaState, useMainStore } from "@/store/main"
import { autocompletion } from "@codemirror/autocomplete"
import { history } from "@codemirror/commands"
import { syntaxHighlighting } from "@codemirror/language"
import { EditorState } from "@codemirror/state"
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import CodeMirror, {
  ReactCodeMirrorProps,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror"
import { jsonSchema, updateSchema } from "codemirror-json-schema"
// @ts-expect-error TODO: fix this in the lib!
import { json5Schema } from "codemirror-json-schema/json5"
import json5 from "json5"

// import { debounce } from "@/lib/utils"
import { jsonDark, jsonDarkTheme } from "./theme"
import { JSONModes } from "@/types/editor"


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
  editorKey: keyof SchemaState["editors"]
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
    const editorMode = state.editors[editorKey].mode ?? state.userSettings.mode
    return editorMode === JSONModes.JSON4
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
