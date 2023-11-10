"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { autocompletion, closeBrackets } from "@codemirror/autocomplete"
import { history } from "@codemirror/commands"
import { bracketMatching, syntaxHighlighting } from "@codemirror/language"
import { lintGutter } from "@codemirror/lint"
import { EditorState } from "@codemirror/state"
import { oneDark, oneDarkHighlightStyle } from "@codemirror/theme-one-dark"
import { EditorView, gutter, lineNumbers } from "@codemirror/view"
import { basicSetup } from "codemirror"
import { jsonSchema, updateSchema } from "codemirror-json-schema"
import { JSONSchema7 } from "json-schema"

import { useSchemaContext } from "../schema/schema-provider"

const jsonText = `{ 
  "example": true
}`

/**
 * none of these are required for json4 or 5
 * but they will improve the DX
 */
const commonExtensions = [
  gutter({ class: "CodeMirror-lint-markers" }),
  bracketMatching(),
  basicSetup,
  closeBrackets(),
  history(),
  autocompletion(),
  lineNumbers(),
  lintGutter(),
  oneDark,
  EditorView.lineWrapping,
  EditorState.tabSize.of(2),
  syntaxHighlighting(oneDarkHighlightStyle),
]

const updateListenerExtension = (
  handler: (state: string) => void,
  options: {
    valid?: boolean
    // TODO: learn how to check current document linter state
    // schemaValid?: boolean
  }
) =>
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const docString = update.state.doc.toString()
      if (options.valid) {
        try {
          JSON.parse(docString)
          handler(docString)
        } catch {}
        return
      }
      handler(docString)
    }
  })

export const JSONEditor = ({
  value,
  schema,
}: {
  value: string
  onValueChange?: (newValue: string) => void
  schema?: Record<string, unknown>
}) => {
  const defaultExtensions = [commonExtensions, jsonSchema(schema)]
  const [isRendered, setIsRendered] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView>()

  const state = EditorState.create({
    doc: value ?? jsonText,
    extensions: [...defaultExtensions],
  })
  useEffect(() => {
    if (editorRef.current && !isRendered && !viewRef.current ) {
      viewRef.current = new EditorView({
        state,
        parent: editorRef.current!,
      })

      setIsRendered(true)
    }
  }, [isRendered, state])
  useEffect(() => {
    if (!value) {
      return
    }
    viewRef?.current?.dispatch({
      changes: { from: 0, to: viewRef?.current.state.doc.length, insert: value },
    })
  }, [value])

  useEffect(() => {
    if (!schema || !viewRef?.current) {
      return
    }
    updateSchema(viewRef?.current, schema)
  }, [schema])

  return (
    <div style={{ width: "100%", height: "max-content" }} ref={editorRef}></div>
  )
}
