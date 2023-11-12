"use client"

import { useMainStore } from "@/store/main"

import { EditorPane } from "./editor-pane"

export const JSONValueEditor = () => {
  const schema = useMainStore((state) => state.schema)
  const testValue = useMainStore((state) => state.testValue)
  const setTestValue = useMainStore((state) => state.setTestValue)
  return (
    <EditorPane
      editorKey="testValue"
      heading={"Test Value"}
      value={testValue ?? {}}
      schema={schema}
      onValueChange={setTestValue}
    />
  )
}
