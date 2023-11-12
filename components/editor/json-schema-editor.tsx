"use client"

import { useEffect } from "react"
import { useMainStore } from "@/store/main"

import { EditorPane } from "./editor-pane"

export const JSONSchemaEditor = ({ url }: { url: string | null }) => {
  const schemaSpec = useMainStore((state) => state.schemaSpec)
  const loadIndex = useMainStore((state) => state.loadIndex)

  const setValueString = useMainStore((state) => state.setSchemaString)
  const value = useMainStore((state) => state.schemaString)
  const setSelectedSchema = useMainStore(
    (state) => state.setSelectedSchemaFromUrl
  )

  useEffect(() => {
    loadIndex()
  }, [loadIndex])

  useEffect(() => {
    if (url && url?.length && url.startsWith("http")) {
      setSelectedSchema(url)
    }
  }, [url])

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
