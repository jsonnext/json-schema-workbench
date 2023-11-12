"use client"

import { useMainStore } from "@/store/main"


import { EditorPane } from "./editor-pane"


export const JSONValueEditor = () => {
  const schema = useMainStore((state) => state.schema)
  return (
    <EditorPane
      editorKey="value"
      heading={"Value"}
      value={{}}
      schema={schema}
    />
  )
}
