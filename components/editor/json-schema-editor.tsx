"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

import { useSchemaContext } from "@/contexts/schema"

const JSONEditor = dynamic(
  async () => (await import("./json-editor")).JSONEditor,
  { ssr: false }
)

 const useSchemaEditor = () => {
  const { schema, setSchema, selectedSchema } = useSchemaContext()
  const [schemaSpec, setSchemaSpec] = useState()
  const [value, setValue] = useState(JSON.stringify(schema, null, 2))
  useEffect(() => {
    const schemaUrl =
      schema && schema["$schema"]
        ? (schema["$schema"] as string)
        : "https://json-schema.org/draft/2020-12/schema"

    fetch(schemaUrl)
      .then((res) => res.json())
      .then((res) => {
        setSchemaSpec(res)
        setValue(JSON.stringify(schema, null, 2))
        // setValue(JSON.stringify(res, null, 2))
      })
    // don't add value here on purpose. let cm6 state handle that
  }, [selectedSchema, setSchemaSpec])

  useEffect(() => {
    if (schema) {
      setValue(JSON.stringify(schema, null, 2))
    }
  }, [selectedSchema, setValue, schema])
  return { setSchema, value, schemaSpec }
}

export const JSONSchemaEditor = () => {

  const { setSchema, value, schemaSpec } = useSchemaEditor()
  return (
    <JSONEditor
      onValueChange={(val) => setSchema(JSON.parse(val))}
      value={value}
      // json schema spec v? allow spec selection
      schema={schemaSpec}
    />
  )
}
