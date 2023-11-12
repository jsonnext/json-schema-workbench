import { readFile } from "fs/promises"
import { join } from "path"
import { useParams, useSearchParams } from "next/navigation"

// TODO: perhaps add other schema sources later if we find them

async function getSchema(url: string) {
  const data = await (
    await fetch(url, { headers: { ContentType: "application/json" } })
  ).text()
  return data
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  try {
    const url = searchParams.get("url")
    if (!url) {
      return new Response("No schema key provided", {
        status: 400,
      })
    }
    const schema = await getSchema(url)
    return new Response(schema, {
      headers: {
        "content-type": "application/json",
        // "cache-control": "s-maxage=1440000",
      },
    })
  } catch (e) {
    return new Response(
      // @ts-expect-error handle error
      { error: e?.message ?? e.toString() },
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    )
  }
}
