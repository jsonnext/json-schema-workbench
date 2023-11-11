"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useMainStore } from "@/store/main"

import { Icons } from "../icons"
import { Button } from "../ui/button"

const JSONEditor = dynamic(
  async () => (await import("./json-editor")).JSONEditor,
  { ssr: false }
)

export const JSONSchemaEditor = () => {
  const schemaSpec = useMainStore((state) => state.schemaSpec)
  const pristineSchema = useMainStore((state) => state.pristineSchema)
  const [loadIndex, setSchema] = useMainStore((state) => [
    state.loadIndex,
    state.setSchema,
  ])

  console.log({ pristineSchema })

  useEffect(() => {
    loadIndex()
  }, [loadIndex])
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Schema</h3>
        <div>
          <Button variant="ghost">
            <Icons.Hamburger className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <JSONEditor
        onValueChange={(val) => setSchema(JSON.parse(val))}
        value={JSON.stringify(pristineSchema, null, 2)}
        // json schema spec v? allow spec selection
        schema={schemaSpec}
      />
    </>
  )
}
