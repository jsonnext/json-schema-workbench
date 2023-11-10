
import { SchemaSelector } from "@/components/schema/schema-selector"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div id="json-schema-editor" className="h-full w-1/2 p-1">
      <SchemaSelector/>

      </div>
      <div id="json-value-editor" className="h-full w-1/2"></div>
    </section>
  )
}
