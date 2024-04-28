import { useMainStore } from "@/store/main"
import { JsonSchemaViewer } from "@stoplight/json-schema-viewer"
import { injectStyles } from "@stoplight/mosaic"
import { useTheme } from "next-themes"

export const SchemaViewer = () => {
  const theme = useTheme()
  const schemaInfo = useMainStore((state) => state.selectedSchema!)
  const schemaValue = useMainStore((state) => state.schema)
  injectStyles()

  return (
    <div className="overflow-scroll p-4" data-theme={theme.theme}>
      <div>
        {schemaInfo.label && (
          <h2 className="text-lg dark:text-slate-300">{schemaInfo.label}</h2>
        )}
        {schemaInfo.description && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {schemaInfo.description}
          </p>
        )}
        {/* {schemaValue?.title && (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {schemaValue?.title ?? ""}
          </p>
        )} */}
        {schemaInfo.fileMatch && (
          <p className="mt-1 whitespace-break-spaces text-sm text-slate-600 dark:text-slate-300">
            {schemaInfo.fileMatch.map((f) => (
              <code
                className="mr-1 rounded-sm bg-slate-200 p-0.5 text-xs dark:bg-slate-900"
                key={f}
              >
                {f}
              </code>
            ))}
          </p>
        )}
      </div>
      <div className="p-4">
        <JsonSchemaViewer
          schema={schemaValue ?? {}}
          emptyText="No schema defined"
          defaultExpandedDepth={1}
          skipTopLevelDescription={false}
        />
      </div>
    </div>
  )
}
