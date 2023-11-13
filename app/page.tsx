import { JSONSchemaEditor } from "@/components/editor/json-schema-editor"
import { JSONValueEditor } from "@/components/editor/json-value-editor"

export default function IndexPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  return (
    <section className="grid h-[92vh] w-full grid-cols-2 gap-2 pb-8">
      <div
        id="json-schema-editor"
        className="flex h-full flex-col overflow-scroll "
      >
        <JSONSchemaEditor url={searchParams.url} />
      </div>
      <div
        id="json-value-editor"
        className="flex h-full flex-col overflow-scroll "
      >
        <JSONValueEditor />
      </div>
    </section>
  )
}
