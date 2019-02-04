import { promisify } from "@civility/utilities"
import * as fs from "fs"
import { prompt } from "inquirer"
import { dump, load } from "js-yaml"
import { join } from "path"
import { IPost } from "../../definitions"
import * as q from "../questions"
const writeFile = promisify(fs.writeFile)


export async function postGenerator() {
  console.log("\n😳 😳 🤖 😳  LET'S MAKE A BLOG POST! 😳 😳 🤖 😳 \n")

  const config = load(fs.readFileSync("./blog.config.yml", "utf8")) || {}

  const { author = "", title = "" } = await prompt([
    q.postTitle,
     { ...q.postAuthor, default: config.author || "" },
   ]) as IPost

  const id = title
    .replace(",", "")
    .replace(/[^a-zA-Z0-9_.@()-]/g, "-")
    .toLowerCase()

  const permalink = join("posts", `${id}.md`)
  const now = new Date()
  const postData = { author, id, permalink, title, created: now, updated: now }
  const frontmatter = `---\n${dump(postData)}---\n`
  await writeFile(permalink, frontmatter + `# ${title}\n`)

  console.log(`
    Congratulations! 🎉 🎉 🎉
    You generated a blog post!
  `)
}
