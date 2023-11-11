import { UseBoundStore, create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

import { toast } from "@/components/ui/use-toast"
import {
  SchemaResponse,
  SchemaSelectorValue,
} from "@/components/schema/schema-selector"

import { storage } from "./idb-store"

export type SchemaState = {
  // metadata about the selected schema, formatted for autocomplete component
  selectedSchema?: SchemaSelectorValue
  // the actual schema object
  schema?: Record<string, unknown>
  // the initial schema value on change for the editor to set
  pristineSchema?: Record<string, unknown>
  schemaError?: string
  // an index of available schemas from SchemaStore.org
  index: SchemaSelectorValue[]
  indexError?: string
  // the base $schema spec for the current `schema`
  schemaSpec?: Record<string, unknown>
}

export type SchemaActions = {
  setIndex: (indexPayload: SchemaResponse) => void
  setSelectedSchema: (selectedSchema: SchemaSelectorValue) => void
  setSchema: (schema: Record<string, unknown>) => void
  clearSelectedSchema: () => void
  loadIndex: () => void
}
// TODO; throws ts error
const middlewares = (f: any) =>
  devtools(
    persist(f, {
      name: "jsonWorkbench",
      storage: createJSONStorage(() => storage),
    })
  )

export const useMainStore = create<SchemaState & SchemaActions>()(
  (set, get) => ({
    index: [],
    setIndex: (indexPayload: SchemaResponse) => {
      set({
        index: indexPayload.schemas.map((schema) => ({
          value: schema.url,
          label: schema.name,
          ...schema,
        })),
      })
    },
    clearSelectedSchema: () => {
      set({
        selectedSchema: undefined,
        schema: undefined,
        schemaError: undefined,
        pristineSchema: undefined,
      })
    },
    setSchema: (schema: Record<string, unknown>) => {
      set({ schema })
    },
    setSelectedSchema: async (selectedSchema: SchemaSelectorValue) => {
      try {
        set({ selectedSchema, schemaError: undefined })
        const data = await (
          await fetch(
            `/api/schema?${new URLSearchParams({ url: selectedSchema.value })}`
          )
        ).json()
        // though it appears we are setting schema state twice,
        // pristineSchema only changes on selecting a new schema
        set({
          schema: data,
          schemaError: data.error,
          pristineSchema: data,
        })
        toast({
          title: "Schema loaded",
          description: selectedSchema.label,
        })
      } catch (err) {
        // @ts-expect-error
        const errMessage = err?.message || err
        set({ schemaError: errMessage })
        toast({
          title: "Error loading schema",
          description: errMessage,
          variant: "destructive",
        })
      }
      try {
        const schema = get().schema
        const schemaUrl =
          schema && schema["$schema"]
            ? (schema["$schema"] as string)
            : "https://json-schema.org/draft/2020-12/schema"
        const data = await (await fetch(schemaUrl)).json()
        set({ schemaSpec: data })
      } catch (err) {
        // @ts-expect-error
        const errMessage = err?.message || err
        set({ schemaError: errMessage })
        toast({
          title: "Error loading schema spec",
          description: errMessage,
          variant: "destructive",
        })
      }
    },
    // this should only need to be called on render, and ideally be persisted
    loadIndex: async () => {
      try {
        const indexPayload: SchemaResponse = await (
          await fetch("/api/schemas")
        ).json()

        set({
          indexError: undefined,
          index: indexPayload.schemas.map((schema) => ({
            value: schema.url,
            label: schema.name,
            ...schema,
          })),
        })
      } catch (err) {
        // @ts-expect-error
        const errMessage = err?.message || err
        set({ indexError: errMessage })
        toast({
          title: "Error loading schema index",
          description: errMessage,
          variant: "destructive",
        })
      }
    },
  })
)
