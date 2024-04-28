"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { JSONSchemaEditor } from "@/components/editor/json-schema-editor"
import { JSONValueEditor } from "@/components/editor/json-value-editor"

export default function IndexPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1280 }

  // const { breakpoint } = useBreakpoint(BREAKPOINTS, "desktop")
  return (
    <div className="h-[92dvh] w-full ">
      <ResizablePanelGroup
        direction={"horizontal"}
        className="grid  w-full gap-2 pb-8 md:grid-cols-2"
      >
        <ResizablePanel
          id="json-schema-editor"
          className="full flex w-max flex-col overflow-scroll md:h-full md:w-[50vw] md:min-w-[300px]"
        >
          <JSONSchemaEditor url={searchParams.url} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          id="json-value-editor"
          className="flex h-[50hw] flex-col overflow-scroll md:h-full md:min-w-[300px]"
        >
          <JSONValueEditor />
        </ResizablePanel>
      </ResizablePanelGroup>
      
    </div>
  )
}
