import { readFile } from "fs/promises"
import { join } from "path"

// TODO: perhaps add other schema sources later if we find them

async function getSchemas() {
  const data = await readFile(
    // TODO: this is not ideal, but works locally and on vercel for now
    join(process.cwd(), "app/api/data/indexes/schemastore.json")
  )
  return data
}

export async function GET(request: Request) {
  return new Response(await getSchemas(), {
    headers: {
      "content-type": "application/json",
      // "cache-control": "s-maxage=1440000",
    },
  })
}
