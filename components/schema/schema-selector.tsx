"use client"

import { useMainStore } from "@/store/main"
import { Check } from "lucide-react"

import { AutoComplete } from "@/components/ui/autocomplete"

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
  const index = useMainStore((state) => state.index)
  const setSelectedSchema = useMainStore((state) => state.setSelectedSchema)
  return (
    <AutoComplete<SchemaDetails>
      emptyMessage="SchemaStore.org schemas loading..."
      options={index ?? []}
      placeholder="choose a schema..."
      onValueChange={setSelectedSchema}
      Results={({ option, selected }) => (
        <div className="flex w-full items-center justify-between">
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
                  <code
                    className="mr-1 rounded-sm bg-slate-200 p-0.5 text-xs dark:bg-slate-900"
                    key={f}
                  >
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
