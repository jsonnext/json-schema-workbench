"use client"

import { useCallback } from "react"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { SchemaState, useMainStore } from "@/store/main"
import { JsonForms } from "@jsonforms/react"
import {
  JsonFormsStyleContext,
  vanillaCells,
  vanillaRenderers,
} from "@jsonforms/vanilla-renderers"
import { useTheme } from "next-themes"
import { useDebouncedCallback } from "use-debounce"

import { parse, serialize } from "@/lib/json"
import { debounce } from "@/lib/utils"

import { SelectControl, SelectTester } from "./select"

// const JSONEditor = dynamic(
//   async () => (await import("./json-editor")).JSONEditor,
//   { ssr: false }
// )

export interface EditorPane {
  heading: string
  editorKey: keyof SchemaState["editors"]
  schema?: Record<string, unknown>
  value?: string
  setValueString: (val: string) => void
}

const renderers = [
  ...vanillaRenderers,
  //register custom renderers
  { tester: SelectTester, renderer: SelectControl },
  // { tester: groupTester, renderer: Group },
]

const styleContextValue = {
  styles: [
    {
      name: "control",
      classNames: "my-5 flex flex-row gap-4 items-center",
    },
    {
      name: "control.input",
      classNames:
        "w-full bg-gray-100 dark:bg-gray-900 rounded border border-gray-500 focus:border-indigo-500 text-base outline-none text-slate-700 dark:text-slate-200 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out font-sans text-sm font-normal",
    },
    {
      name: "control.select",
      classNames:
        "w-full bg-gray-100 dark:bg-gray-900 rounded border border-gray-500 focus:border-indigo-500 text-base outline-none text-slate-700 dark:text-slate-200 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out appearance-none text-sm font-normal",
    },
    {
      name: "control.label",
      classNames:
        "flex tracking-wide text-slate-800 dark:text-slate-300 text-sm pb-4 pt-4 max-w-[200px] min-w-[200px] justify-end text-right",
    },
    {
      name: "array.button",
      classNames: "border border-gray-300 rounded-md p-2 m-2",
    },
    {
        name: "array.child.controls",
        classNames: "ml-[200px]",
    },
    {
      name: "array.child.controls.up",
      classNames:
        "border border-gray-300 rounded-md p-2 m-2 bg-accent icon-plus",
    },
    {
      name: "array.child.controls.down",
      classNames: "border border-gray-300 rounded-md p-2 m-2 bg-accent",
    },
    {
      name: "array.control.label",
      classNames: "inline-block text-lg max-w-[200px] min-w-[200px] text-right justify-end",
    },
    {
      name: "array.child.controls.delete",
      classNames:
        "border border-gray-300 rounded-md p-2 m-2 bg-destructive border-destructive text-destructive-foreground",
    },

    {
      name: "array.control.add",
      classNames:
        "border border-gray-300 rounded-md p-2 m-2 bg-accent font-bold",
    },
    {
      name: "array.table",
      classNames: "w-full",
    },
    {
      name: "array.table.table",
      classNames: "w-full text-center m-2 ml-[200px]",
    },
    {
        name: "array.table.table.thead",
        classNames: "p-2 text-left",
      },
    {
      name: "array.table.label",
      classNames: "inline-block text-slate-900 dark:text-slate-300 text-lg max-w-[200px] min-w-[200px] text-right",
    },
    {
      name: "array.table.button",
      classNames:
        "border border-gray-300 rounded-md p-2 m-2 bg-accent font-bold",
    },
    {
      name: "control.validation",
      classNames: "font-normal mt-2 text-xs p-2 rounded",
    },
    {
      name: "control.validation.error",
      classNames: "bg-destructive text-destructive-foreground",
    },
    {
      name: "vertical.layout",
      classNames:
        "block  tracking-wide text-slate-900 dark:text-slate-300 text-sm mb-2 w-full",
    },
    {
      name: "vertical.layout.item",
      classNames: "w-full p-2",
    },
    {
        name: "vertical.layout.item.group",
        classNames: "w-full text-center p-2",
      },
      
    {
      name: "group.layout",
      classNames: "accordion-item bg-white ml-10",
    },
    {
      name: "group.label",
      classNames:
        "accordion-button relative flex w-full py-4 transition focus:outline-none block tracking-wide text-slate-900 dark:text-slate-300 text-lg pb-4 pt-4 min-w-[200px] max-w-[200px] flex justify-end text-right",
    },
  ],
}
export const JsonSchemaForm = ({
  editorKey,
}: {
  editorKey: keyof SchemaState["editors"]
}) => {
  const editorMode = useMainStore(
    (state) => state.editors[editorKey].mode ?? state.userSettings.mode
  )
  const parsedEditorValue = useMainStore((state) =>
    parse(editorMode, state.testValueString)
  )
  const setValueString = useMainStore((state) => state.setTestValueString)

  const schemaValue = useMainStore((state) => state.schema)
//   const debouncedChange = useDebouncedCallback(
//     ({ data, _errors }) => data && setValueString(serialize(editorMode, data)),
//     1000
//   )
  if(!schemaValue) return <div>Loading...</div>
  

  return (
    <ErrorBoundary
      errorComponent={(err) => <div>{JSON.stringify(err, null, 2)}</div>}
    >
      {/* @ts-expect-error */}
      <JsonFormsStyleContext.Provider value={styleContextValue}>
        <div className="flex-1-1 flex h-full w-full flex-col px-3">
          <JsonForms
            schema={schemaValue}
            data={parsedEditorValue}
            renderers={renderers}
            cells={vanillaCells}
            validationMode="NoValidation"
            config={{ showUnfocusedDescription: true, showUnfocusedDescriptionRoot: true}}
            // onChange={debouncedChange}
            // readonly={true}
          />
        </div>
      </JsonFormsStyleContext.Provider>
    </ErrorBoundary>
  )
}
