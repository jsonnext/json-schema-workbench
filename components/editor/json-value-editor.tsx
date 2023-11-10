"use client"

import dynamic from "next/dynamic"

import { useSchemaContext } from "../schema/schema-provider"

const JSONEditor = dynamic(
  async () => (await import("./json-editor")).JSONEditor,
  { ssr: false }
)

export const JSONValueEditor = () => {
  const { schema } = useSchemaContext()
  return (
    <JSONEditor
      value={"{ }"}
      // json schema spec v? allow spec selection
      schema={schema}
    />
  )
}
