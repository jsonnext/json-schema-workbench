"use client"

import { useEffect } from "react"
import { useMainStore } from "@/store/main"
import json5 from "json5"

import { EditorPane } from "./editor-pane"

export const JSONSchemaEditor = () => {
  const schemaSpec = useMainStore((state) => state.schemaSpec)
  const pristineSchema = useMainStore((state) => state.pristineSchema)
  const [loadIndex, setSchema] = useMainStore((state) => [
    state.loadIndex,
    state.setSchema,
  ])
  const editorMode = useMainStore(
    (state) => state.editors.schema.mode ?? state.userSettings.mode
  )

  useEffect(() => {
    loadIndex()
  }, [loadIndex])

  return (
    <EditorPane
      editorKey="schema"
      heading="Schema"
      onValueChange={(val) => {
        setSchema(json5.parse(val))
      }}
      value={pristineSchema ?? {}}
      // json schema spec v? allow spec selection
      schema={schemaSpec}
    />
  )
}
