"use client"

import { useEffect } from "react"
import { useMainStore } from "@/store/main"


import { EditorPane } from "./editor-pane"

export const JSONSchemaEditor = () => {
  const schemaSpec = useMainStore((state) => state.schemaSpec)
  const loadIndex = useMainStore((state) => state.loadIndex)

  const setValueString = useMainStore((state) => state.setSchemaString)
  const value = useMainStore((state) => state.schemaString)

  useEffect(() => {
    loadIndex()
  }, [loadIndex])

  return (
    <EditorPane
      editorKey="schema"
      heading="Schema"
      // json schema spec v? allow spec selection
      schema={schemaSpec}
      setValueString={setValueString}
      value={value}
    />
  )
}
