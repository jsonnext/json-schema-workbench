"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

import { useSchemaContext } from "../schema/schema-provider"

const JSONEditor = dynamic(
  async () => (await import("./json-editor")).JSONEditor,
  { ssr: false }
)

export const JSONSchemaEditor = () => {
  const { schema, setSchema } = useSchemaContext()
  const [schemaSpec, setSchemaSpec] = useState()
  // load the spec schema on change based on incoming spec, or use the latest
  useEffect(() => {
    const schemaUrl =
      schema && schema["$schema"]
        ? (schema["$schema"] as string)
        : "https://json-schema.org/draft/2020-12/schema"

    fetch(schemaUrl)
      .then((res) => res.json())
      .then((res) => setSchemaSpec(res))
  }, [schema])
  return (
    <JSONEditor
      onValueChange={(val) => setSchema(JSON.parse(val))}
      value={JSON.stringify(schema, null, 2)}
      // json schema spec v? allow spec selection
      schema={schemaSpec}
    />
  )
}
