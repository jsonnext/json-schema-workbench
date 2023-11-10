"use client"
import dynamic from "next/dynamic"

import { useSchemaContext } from "../schema/schema-provider"
import { useEffect } from "react"

const JSONEditor = dynamic(
  async () => (await import("./json-editor")).JSONEditor,
  { ssr: false }
)

export const JSONSchemaEditor = () => {
  const { schema, setSchema } = useSchemaContext()
  console.log({ schema })
  return (
    <JSONEditor
      onValueChange={(val) => setSchema(JSON.parse(val))}
      value={JSON.stringify(schema, null, 2)}
      // json schema spec v? allow spec selection
      // schema={}
    />
  )
}
