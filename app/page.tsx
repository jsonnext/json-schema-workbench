import { JSONSchemaEditor } from "@/components/editor/json-schema-editor"
import { JSONValueEditor } from "@/components/editor/json-value-editor"
import { SchemaSelector } from "@/components/schema/schema-selector"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10 grid-cols-2">
      <div id="json-schema-editor" className="h-full">
        <SchemaSelector />
        <JSONSchemaEditor />
      </div>
      <div id="json-value-editor" className="h-full">
        <JSONValueEditor />
      </div>
    </section>
  )
}
