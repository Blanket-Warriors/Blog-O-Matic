/**
 * Dev Server
 * This serves and reacts to the dev build of the blog.
 * It's not really meant for use in production, which is
 * why it's in the editor, rather than express.
 */

import { promisify } from "@civility/utilities"
import * as express from "express"
import * as fs from "fs"
import { resolve } from "path"

const opn = require("opn")
const readdir = promisify(fs.readdir)

export function startServer(previewDir: string) {
  const PORT = 3000
  const server = express()
  server.use("/blog", express.static(resolve(previewDir, "posts")))
  server.get("/posts", async (req, res) => {
    const body = await readdir(resolve(previewDir, "posts"))
    res.charset = "utf-8"
    res.set("Content-Type", "application/json")
    res.send(JSON.stringify(body))
  })
  server.use(express.static(resolve(previewDir)))
  server.use(express.static(resolve(__dirname, "../dist/client/build")))

  server.get("*", (req: { [key: string]: any }, res: { [key: string]: any }) => {
    res.sendFile(resolve(__dirname, "../dist/client/build/index.html"))
  })

  server.listen(PORT, () => {
    console.log("listening on port", PORT)
    opn(`http://localhost:${PORT}`)
  })
}
