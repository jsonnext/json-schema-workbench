"use client"

import { useMainStore } from "@/store/main"

import { EditorPane } from "./editor-pane"

export const JSONValueEditor = () => {
  const schema = useMainStore((state) => state.schema)
  const setValueString = useMainStore((state) => state.setTestValueString)
  const value = useMainStore((state) => state.testValueString)

  return (
    <EditorPane
      editorKey="testValue"
      heading={"Test Value"}
      schema={schema}
      setValueString={setValueString}
      value={value}
    />
  )
}
