import { readFile } from "fs/promises";
import { join } from "path";

// TODO: perhaps add other schema sources later if we find them

export async function getSchemas() {
  const data = await readFile(join(process.cwd(), 'app/api/data/indexes/schemastore.json'))
 return data
}

export async function GET(request: Request) {
    return new Response(await getSchemas(), {
        headers: { "content-type": "application/json" },
    });
}
