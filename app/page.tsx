import { JSONSchemaEditor } from "@/components/editor/json-schema-editor"
import { JSONValueEditor } from "@/components/editor/json-value-editor"

export default function IndexPage() {
  return (
    <section className="w-full grid items-center gap-2 pb-8 grid-cols-2 h-[90vh]">
      <div id="json-schema-editor" className="h-full overflow-scroll">
        <JSONSchemaEditor />
      </div>
      <div id="json-value-editor" className="h-full overflow-scroll">
        <JSONValueEditor />
      </div>
    </section>
  )
}
