"use client"

import {
  createContext,
  use,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react"

import { SchemaResponse, SchemaSelectorValue } from "./schema-selector"

type SchemaProviderProps = React.PropsWithChildren<{}>

const initialState = {
  schema: undefined,
  index: [],
}

export const SchemaContext = createContext<
  {
    setSelectedSchema: (option: SchemaSelectorValue) => void
    setSchema: (schema: Record<string, unknown>) => void
    clearSelectedSchema: () => void
  } & SchemaState
>({
  setSelectedSchema: async (option) => {},
  setSchema: (schema) => {},
  clearSelectedSchema: () => {},
  ...initialState,
})

export type SchemaState = {
  selectedSchema?: SchemaSelectorValue
  schema?: Record<string, unknown>
  schemaError?: string
  index: SchemaSelectorValue[]
  indexError?: string
}

enum SchemaActionType {
  setSelectedSchema = "setSelectedSchema",
  setSchema = "setSchema",
  clearSelectedSchema = "clearSelectedSchema",
  schemaError = "schemaError",
  setSelectedSchemasIndex = "setSelectedSchemasIndex",
  schemaErrorsIndex = "schemaErrorsIndex",
}

type SchemaAction =
  | {
      type: SchemaActionType.setSelectedSchemasIndex
      payload: SchemaResponse
    }
  | {
      type: SchemaActionType.setSelectedSchema
      payload: SchemaSelectorValue
    }
  | {
      type: SchemaActionType.clearSelectedSchema
    }
  | {
      type: SchemaActionType.setSchema
      payload: { schema: Record<string, unknown> }
    }
  | {
      type: SchemaActionType.schemaErrorsIndex | SchemaActionType.schemaError
      payload: { error: string }
    }

const schemaReducer = (
  state: SchemaState,
  action: SchemaAction
): SchemaState => {
  switch (action.type) {
    case "setSelectedSchema":
      return {
        ...state,
        selectedSchema: action.payload,
      }
    case "clearSelectedSchema":
      return {
        ...state,
        selectedSchema: undefined,
        schema: undefined,
      }
    case "setSchema": {
      return {
        ...state,
        schema: action.payload.schema,
        schemaError: undefined,
      }
    }
    case "schemaError":
      return {
        ...state,
        schemaError: action.payload.error,
      }
    case "schemaErrorsIndex":
      return {
        ...state,
        index: [],
        indexError: action.payload.error,
      }
    case "setSelectedSchemasIndex":
      return {
        ...state,
        index: action.payload.schemas.map((schema) => ({
          value: schema.url,
          label: schema.name,
          ...schema,
        })),
        indexError: undefined,
      }
    default:
      return state
  }
}

export const SchemaProvider = ({ children }: SchemaProviderProps) => {
  const [state, action] = useReducer(schemaReducer, initialState)
  useEffect(() => {
    fetch("/api/schemas")
      .then<SchemaResponse>((res) => res.json())
      .then((data) => {
        action({
          type: SchemaActionType.setSelectedSchemasIndex,
          payload: data,
        })
      })
      .catch((err) => {
        action({
          type: SchemaActionType.schemaErrorsIndex,
          payload: { error: err.message },
        })
      })
  }, [])


  // called via autocomplete, or perhaps eventually by custom URL input
  const setSelectedSchema = useCallback((option: SchemaSelectorValue) => {
    if (option) {
      action({
        type: SchemaActionType.setSelectedSchema,
        payload: option,
      })
      fetch(`/api/schema?${new URLSearchParams({ url: option.value })}`)
        .then((res) => res.json())
        .then((schema) => {
          action({
            type: SchemaActionType.setSchema,
            payload: { schema },
          })
        })
        .catch((err) => {
          action({
            type: SchemaActionType.schemaError,
            payload: { error: err.message },
          })
        })
    }
  }, [])

  const setSchema = (schema: Record<string, unknown>) => {
    action({
      type: SchemaActionType.setSchema,
      payload: { schema },
    })
  }

  const clearSelectedSchema = () => {
    action({
      type: SchemaActionType.clearSelectedSchema,
    })
  }

  return (
    <SchemaContext.Provider
      value={{
        ...state,
        setSelectedSchema,
        setSchema,
        clearSelectedSchema,
      }}
    >
      {children}
    </SchemaContext.Provider>
  )
}

export const useSchemaContext = () => {
  const context = useContext(SchemaContext)
  if (context === undefined) {
    throw new Error("useSchema must be used within a SchemaProvider")
  }
  return context
}
