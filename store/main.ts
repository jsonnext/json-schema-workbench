'use client'

import { EditorView } from "codemirror"
import json5 from "json5"
import { UseBoundStore, create } from "zustand"
import {
  PersistOptions,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware"

import { JSONModes } from "@/types/editor"
import { parse, serialize } from "@/lib/json"
import { toast } from "@/components/ui/use-toast"
import {
  SchemaResponse,
  SchemaSelectorValue,
} from "@/components/schema/schema-selector"

  
import { storage } from "./idb-store"
import dynamic from "next/dynamic"

type EditorViewMode = "editor" | "viewer" | "form"

type JsonEditorState = {
  mode?: JSONModes
  theme?: string
  instance?: EditorView
  view?: EditorViewMode
}

export type SchemaState = {
  // metadata about the selected schema, formatted for autocomplete component
  selectedSchema?: SchemaSelectorValue
  // the actual schema object
  schema?: Record<string, unknown>
  schemaString?: string

  testValueString?: string
  // the initial schema value on change for the editor to set
  // pristineSchema?: Record<string, unknown>
  schemaError?: string
  // an index of available schemas from SchemaStore.org
  index: SchemaSelectorValue[]
  indexError?: string
  // the base $schema spec for the current `schema`
  schemaSpec?: Record<string, unknown>
  // user settings
  userSettings: {
    mode: JSONModes
  }
  // editors state
  editors: {
    schema: JsonEditorState
    testValue: JsonEditorState
  }
  schemas: Record<string, Record<string, unknown>>
}

export type SchemaActions = {
  setSelectedSchema: (
    selectedSchema: Partial<SchemaSelectorValue> & { value: string }
  ) => Promise<void>
  setSelectedSchemaFromUrl: (url: string) => Promise<void>
  setSchema: (schema: Record<string, unknown>) => void
  setSchemaString: (schema: string) => void
  clearSelectedSchema: () => void
  loadIndex: () => Promise<void>
  setEditorSetting: <T = string>(
    editor: keyof SchemaState["editors"],
    setting: keyof JsonEditorState,
    value: T
  ) => void
  fakeValue: () => void
  formatEditor: (editor: keyof SchemaState["editors"]) => void
  setTestValueString: (testValue: string) => void
  getMode: (editorKey?: keyof SchemaState["editors"]) => JSONModes
  fetchSchema: (
    url: string
  ) => Promise<
    { schemaString: string; schema: Record<string, unknown> } | undefined
  >
}

let persistOptions: {
  name: string
  storage?: PersistOptions<SchemaState>["storage"]
} = {
  name: "jsonWorkBench",
  storage: createJSONStorage(() => storage),
}

const initialState = {
  userSettings: {
    // theme: "system",
    mode: JSONModes.JSON4,

    // "editor.theme": "one-dark",
    // "editor.keymap": "default",
    // "editor.tabSize": 2,
    // "editor.indentWithTabs": false,
  },
  editors: {
    schema: {
      view: "editor" as EditorViewMode,
    },
    testValue: {
      view: "editor" as EditorViewMode,
    },
  },
  schemas: {},
}

export const useMainStore = create<SchemaState & SchemaActions>()<
  [["zustand/persist", SchemaState], ["zustand/devtools", never]]
>(
  persist(
    devtools((set, get) => ({
      ...initialState,
      index: [],
      clearSelectedSchema: () => {
        set({
          selectedSchema: undefined,
          schema: undefined,
          schemaError: undefined,
        })
      },
      getMode: (editorKey?: keyof SchemaState["editors"]) => {
        if (editorKey) {
          return get().editors[editorKey].mode ?? get().userSettings.mode
        }
        return get().userSettings.mode
      },
      fakeValue: async () => {
        try {
          const { JSONSchemaFaker } = await import("json-schema-faker")
          JSONSchemaFaker.option({
            useExamplesValue: true,
            useDefaultValue: true,
            sortProperties: true,
            replaceEmptyByRandomValue: true,
            reuseProperties: true,
            optionalsProbability: 0.9,
            failOnInvalidFormat: false,
            failOnInvalidTypes: false,
            renderDescription: true,
            renderComment: true,
            fillProperties: true,
          })
          const value = await JSONSchemaFaker.resolve(get().schema!)
          if (value) {
            set({
              testValueString: serialize(
                get().getMode("testValue"),
                value as Record<string, unknown>
              ),
            })
            toast({
              title: "Fake data generated",
              description: "Fake data generated successfully",
              variant: "secondary",
            })
          }
        } catch (err) {
          // @ts-expect-error
          const errMessage = err?.message || err
          set({ schemaError: errMessage })
          toast({
            title: "Error generating fake data",
            description: errMessage,
            variant: "destructive",
          })
        }
      },
      // don't set pristine schema here to avoid triggering updates
      setSchema: (schema: Record<string, unknown>) => {
        try {
          set({
            schema,
            schemaError: undefined,
            schemaString: serialize(get().getMode("schema"), schema),
          })
        } catch (e) {
          toast({
            title: "Error setting schema",
            // @ts-expect-error
            description: e.message,
            variant: "destructive",
          })
          // @ts-expect-error
          set({ schemaError: e.message })
        }
      },
      setSchemaString: (schema: string) => {
        try {
          const schemaMode = get().getMode("schema")
          const parsedSchema = parse(schemaMode, schema)
          return set({
            schema: parsedSchema,
            schemaString: serialize(schemaMode, parsedSchema),
            schemaError: undefined,
          })
        } catch (e) {
          toast({
            title: "Error parsing schema",
            // @ts-expect-error
            description: e.message,
            variant: "destructive",
          })
          // @ts-expect-error
          set({ schemaError: e!.message })
        }
      },
      setTestValueString: (testValue) => {
        set({
          testValueString: testValue,
        })
      },
      setEditorViewMode: (
        editor: "schema" | "testValue",
        view: EditorViewMode
      ) => {
        set((state) => ({
          editors: {
            ...state.editors,
            [editor]: {
              ...state.editors[editor],
              view,
            },
          },
        }))
      },
      setEditorSetting: (editor, setting, value) => {
        if (setting === "mode") {
          console.log("setting mode", value)
          set((prev) => {
            const prevMode = prev.editors[editor].mode
            const nextMode = value as JSONModes
            console.log({ prevMode, nextMode })
            if (prevMode === nextMode || !nextMode) {
              return {}
            }
            try {
              return {
                [`${editor}String`]: serialize(
                  nextMode,
                  parse(
                    prevMode ?? JSONModes.JSON4,
                    prev[`${editor}String`] ?? "{}"
                  )
                ),
                editors: {
                  ...prev.editors,
                  [editor]: {
                    ...prev.editors[editor],
                    [setting]: value,
                  },
                },
              }
            } catch (e) {
              // if there is a parsing or serialization error, do not update state
              toast({
                title: "Error changing mode",
                // @ts-expect-error
                description: e.message,
                variant: "destructive",
              })
              return {}
            }
          })
        } else {
          set((prev) => ({
            editors: {
              ...prev.editors,
              [editor]: {
                ...prev.editors[editor],
                [setting]: value,
              },
            },
          }))
        }
      },
      formatEditor: (editor) => {
        set((state) => {
          const mode = state.editors[editor].mode
          const value = state[`${editor}String`]
          try {
            return {
              [`${editor}String`]: serialize(mode, parse(mode, value)),
            }
          } catch (e) {
            toast({
              title: "Error formatting editor",
              // @ts-expect-error
              description: e.message,
              variant: "destructive",
            })
            return {}
          }
        })
      },
      fetchSchema: async (url: string) => {
        const schemas = get().schemas
        // serialize them to the json4/5 the schema editor is configured for
        const mode = get().getMode("schema")
        if (schemas[url]) {
          try {
            const schema = schemas[url]!
            return {
              schemaString: serialize(mode, schema),
              schema,
              schemaError: undefined,
            }
          } catch (e) {
            toast({
              title: "Error fetching schema",
              // @ts-expect-error
              description: e.message,
              variant: "destructive",
            })

            return {
              schemaString: "",
              schema: {},
              // @ts-expect-error
              schemaError: e.message,
            }
          }
        }
        try {
          const data = await (
            await fetch(
              `/api/schema?${new URLSearchParams({
                url,
              })}`
            )
          ).text()
          const parsed = parse(mode, data)
          schemas[url] = parsed
          return {
            schemaString: serialize(mode, parsed),
            schema: parsed,
            schemas,
          }
        } catch (e) {
          toast({
            title: "Error fetching schema",
            // @ts-expect-error
            description: e.message,
            variant: "destructive",
          })
          // @ts-expect-error
          set({ schemaError: e.message })
        }
      },

      setSelectedSchema: async (selectedSchema) => {
        try {
          let selected = selectedSchema
          const result = await get().fetchSchema(selectedSchema.value)
          if (!result) {
            return void toast({
              title: "Error loading schema",
              description: "No schema found",
              variant: "destructive",
            })
          }
          const { schema, schemaString: data } = result
          if (!selectedSchema.label) {
            selected = {
              label:
                schema.title ??
                schema.description ??
                (selectedSchema.value as string),
              value: selectedSchema.value,
              description: schema.title
                ? (schema.description as string)
                : undefined,
            } as SchemaSelectorValue
          }
          set({
            selectedSchema: selected as SchemaSelectorValue,
            schemaError: undefined,
          })
          if (typeof window !== "undefined" && selectedSchema.value) {
            // @ts-expect-error
            const url = new URL(window.location)
            url.searchParams.set("url", selectedSchema.value)
            window.history.pushState({}, "", url)
          }

          // though it appears we are setting schema state twice,
          // pristineSchema only changes on selecting a new schema
          set({
            schema: schema,
            schemaString: data,
            schemaError: undefined,
          })

          toast({
            title: "Schema loaded",
            description: selectedSchema.label,
            variant: "accent",
          })
        } catch (err) {
          // @ts-expect-error
          const errMessage = err?.message || err
          set({ schemaError: errMessage })
          toast({
            title: "Error loading schema",
            description: errMessage,
            variant: "destructive",
            className: "bottom-4 right-4",
          })
        }
        try {
          const schema = get().schema
          const schemaUrl =
            schema && schema["$schema"]
              ? (schema["$schema"] as string)
              : "https://json-schema.org/draft/2020-12/schema"
          const result = await get().fetchSchema(schemaUrl)
          if (result) {
            set({ schemaSpec: result.schema })
          }
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
      setSelectedSchemaFromUrl: async (url) => {
        const index = get().index
        if (index) {
          const selectedSchema = index.find((schema) => schema?.value === url)
          if (selectedSchema) {
            await get().setSelectedSchema(selectedSchema)
          } else {
            await get().setSelectedSchema({ value: url })
          }
        }
      },
      // this should only need to be called on render
      loadIndex: async () => {
        try {
          if (!get().index?.length) {
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
          }
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
    })),
    persistOptions
  )
)
