"use client"

import dynamic from "next/dynamic"
import { useSchemaContext } from "@/contexts/schema"

import { Icons } from "../icons"
import { Button } from "../ui/button"

const JSONEditor = dynamic(
  async () => (await import("./json-editor")).JSONEditor,
  { ssr: false }
)

export const JSONValueEditor = () => {
  const { schema } = useSchemaContext()
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Value</h3>
        <div>
          <Button variant="ghost">
            <Icons.Hamburger className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <JSONEditor
        value={"{ }"}
        // json schema spec v? allow spec selection
        schema={schema}
        className="flex-1 overflow-auto"
        height="100%"
      />
    </>
  )
}
