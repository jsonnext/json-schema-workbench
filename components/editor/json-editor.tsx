"use client"

import { useEffect, useRef, useState } from "react"
import { autocompletion, closeBrackets } from "@codemirror/autocomplete"
import { history } from "@codemirror/commands"
import { bracketMatching, syntaxHighlighting } from "@codemirror/language"
import { lintGutter } from "@codemirror/lint"
import { EditorState } from "@codemirror/state"
import { oneDark, oneDarkHighlightStyle } from "@codemirror/theme-one-dark"
import { EditorView, gutter, lineNumbers } from "@codemirror/view"
import { basicSetup } from "codemirror"
import { jsonSchema } from "codemirror-json-schema"
import { JSONSchema7 } from "json-schema"
import { useSchema } from "../schema/schema-provider"

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
    valid?: boolean, 
    // TODO: learn how to check current document linter state
    // schemaValid?: boolean
}
) =>
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
        const docString = update.state.doc.toString()
        if(options.valid) {
           try {
            JSON.parse(docString)
            handler(docString)
           }
           catch {}
           return
        }
        handler(docString)
    }
  })

export const JSONEditor = ({
  value,
}: {
  value: string
  onValueChange?: (newValue: string) => void
}) => {
    const [schema, setSchema] = useSchema()
    const defaultExtensions = [commonExtensions, jsonSchema(schema)]
    const [isRendered, setIsRendered] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const state = EditorState.create({
    doc: value ?? jsonText,
    extensions: [commonExtensions, jsonSchema(schema)],
  })

  useEffect(() => {
    if (editorRef.current && !isRendered) {
      const view = new EditorView({
        state,
        parent: editorRef.current!,
      })

     setIsRendered(true)
    }
  }, [ isRendered, state])

  return (
    <div style={{ width: "100%", height: "max-content" }} ref={editorRef}></div>
  )
}
