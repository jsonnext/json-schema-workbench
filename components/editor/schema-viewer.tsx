import dynamic from "next/dynamic"
import { useMainStore } from "@/store/main"
import { injectStyles } from "@stoplight/mosaic"
import { useTheme } from "next-themes"

const JsonSchemaViewer = dynamic(
  async () => (await import("@stoplight/json-schema-viewer")).JsonSchemaViewer,
  { ssr: false }
)

export const SchemaViewer = () => {
  const theme = useTheme()
  const schemaValue = useMainStore((state) => state.schema ?? {})
  injectStyles()

  return (
    <div
      className="w-full overflow-scroll p-4"
      data-theme={theme?.theme ?? "dark"}
    >
      <div>
        {schemaValue?.title ? (
          <h2 className="text-lg">{schemaValue.title as string}</h2>
        ) : null}
        {schemaValue?.description ? (
          <h2 className="text-sm text-muted-foreground">
            {schemaValue.description as string}
          </h2>
        ) : null}
        {/* {schemaInfo.description && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {schemaInfo.description}
          </p>
        )} */}
        {/* {schemaValue?.title && (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {schemaValue?.title ?? ""}
          </p>
        )} */}
        {/* {schemaInfo.fileMatch && (
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
        )} */}
      </div>
      <div className="p-4">
        <JsonSchemaViewer
          schema={schemaValue}
          emptyText="No schema defined"
          defaultExpandedDepth={1}
          skipTopLevelDescription={false}
        />
      </div>
    </div>
  )
}
