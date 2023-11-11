import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { JSONSchemaEditor } from "@/components/editor/json-schema-editor"
import { JSONValueEditor } from "@/components/editor/json-value-editor"

export default function IndexPage() {
  return (
    <section className="grid h-[90vh] w-full grid-cols-2 gap-2 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>JSON Schema</CardTitle>
          <CardDescription>
            Specify the schema for your JSON data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JSONSchemaEditor />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>JSON Value</CardTitle>
          <CardDescription>Enter your JSON data</CardDescription>
        </CardHeader>
        <CardContent>
          <JSONValueEditor />
        </CardContent>
      </Card>
    </section>
  )
}
