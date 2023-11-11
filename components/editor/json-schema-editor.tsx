"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useSchemaContext } from "@/contexts/schema"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"

import { Icons } from "../icons"
import { Button } from "../ui/button"

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
  }, [selectedSchema, setSchemaSpec, schema])

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
    <>
      <div className='flex items-center justify-between'>
        <h3 className="text-lg font-semibold">Schema</h3>
        <div>

        <Button variant="ghost">
          <Icons.Hamburger className="h-5 w-5" />
        </Button>
        </div>
      </div>
      <JSONEditor
        onValueChange={(val) => setSchema(JSON.parse(val))}
        value={value}
        // json schema spec v? allow spec selection
        schema={schemaSpec}
        className='flex-1 overflow-auto'
        height='100%'
      />
    </>
  )
}
