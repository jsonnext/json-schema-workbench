"use client"

import { Check } from "lucide-react"

import { AutoComplete } from "@/components/ui/autocomplete"
import { useSchemaContext } from "@/contexts/schema"
import { Separator } from "@/components/ui/separator"

export type SchemaDetails = {
  description: string
  fileMatch?: string[]
}

export type SchemaItem = {
  url: string
  name: string
} & SchemaDetails

export type SchemaSelectorValue = {
  value: string
  label: string
} & SchemaDetails

export type SchemaResponse = {
  schemas: SchemaItem[]
}

export const SchemaSelector = () => {
  const { setSelectedSchema, index, schema } = useSchemaContext()
  return (
    <AutoComplete<SchemaDetails>
      emptyMessage="SchemaStore.org schemas loading..."
      options={index ?? []}
      placeholder="choose a schema..."
      onValueChange={setSelectedSchema}
      
      Results={({ option, selected }) => (
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col ">
            <span className="font-medium">{option.label}</span>
            {option.description && (
              <span className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {option.description}
              </span>
            )}
            {option.fileMatch && (
     
              <span className="mt-1 whitespace-break-spaces text-xs text-slate-600 dark:text-slate-300">
                {option.fileMatch.map((f) => (
                  <code className="rounded-sm mr-1 dark:bg-slate-900 p-0.5 bg-slate-200 text-xs" key={f}>
                    {f}
                  </code>
                ))}
              </span>
              
            )}
          </div>
          {selected && <Check className="h-5 w-5 text-green-500" />}
        </div>
      )}
    />
  )
}
