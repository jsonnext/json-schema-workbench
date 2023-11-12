import { EditorView } from "codemirror"
import { JSONMode } from "codemirror-json-schema"
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

type JsonEditorState = {
  mode?: JSONModes
  theme?: string
  instance?: EditorView
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
  setEditorMode: (editor: keyof SchemaState["editors"], mode: JSONModes) => void
  setTestValueString: (testValue: string) => void
  getMode: (editorKey?: keyof SchemaState["editors"]) => JSONModes
  fetchSchema: (
    url: string
  ) => Promise<{ schemaString: string; schema: Record<string, unknown> }>
}

const persistOptions: PersistOptions<SchemaState & SchemaActions> = {
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
    schema: {},
    testValue: {},
  },
  schemas: {},
}

export const useMainStore = create<SchemaState & SchemaActions>()<
  [["zustand/persist", unknown], ["zustand/devtools", never]]
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
      // don't set pristine schema here to avoid triggering updates
      setSchema: (schema: Record<string, unknown>) => {
        set({
          schema,
          schemaError: undefined,
          schemaString: serialize(get().getMode("schema"), schema),
        })
      },
      setSchemaString: (schema: string) => {
        set({
          schema: parse(get().getMode("schema"), schema),
          schemaString: schema,
          schemaError: undefined,
        })
      },
      setTestValueString: (testValue) => {
        set({
          testValueString: testValue,
        })
      },
      setEditorSetting: (editor, setting, value) => {
        set((state) => ({
          editors: {
            ...state.editors,
            [editor]: {
              ...state.editors[editor],
              [setting]: value,
            },
          },
        }))
        if (setting === "mode") {
          const editorString = get()[`${editor}String`] ?? "{}"
          set({
            [`${editor}String`]:
              value === "json5"
                ? json5.stringify(JSON.parse(editorString), null, 2)
                : JSON.stringify(json5.parse(editorString), null, 2),
          })
        }
      },
      setEditorMode: (editor, mode) => {
        set((state) => ({
          editors: {
            ...state.editors,
            [editor]: {
              ...state.editors[editor],
              mode,
            },
          },
        }))
      },
      fetchSchema: async (url: string) => {
        const schemas = get().schemas
        // serialize them to the json4/5 the schema editor is configured for
        const mode = get().getMode("schema")
        if (schemas[url]) {
          const schema = schemas[url]!
          return {
            schemaString: serialize(mode, schema),
            schema,
          }
        }
        const data = await (
          await fetch(
            `/api/schema?${new URLSearchParams({
              url,
            })}`
          )
        ).text()
        const parsed = parse(mode, data)
        schemas[url] = parsed
        return { schemaString: data, schema: parsed }
      },
      setSelectedSchema: async (selectedSchema) => {
        try {
          let selected = selectedSchema
          const { schemaString: data, schema } = await get().fetchSchema(
            selectedSchema.value
          )
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
          const { schema: schemaSpec } = await get().fetchSchema(schemaUrl)
          set({ schemaSpec })
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
