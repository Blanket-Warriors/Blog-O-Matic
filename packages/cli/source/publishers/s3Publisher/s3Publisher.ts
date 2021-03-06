const AWS = require("aws-sdk")
import { homedir, type } from "os"
import { IConfig } from "../../definitions"
import { compile, IUploadEntity } from "../../helpers"


export async function s3Publisher(cwd: string, config: IConfig) {
  if (!config.s3) throw new Error("Incorrect configuration")

  const { isNewContent, checkBucketContents, upload } = new S3(config)

  const files = await compile(cwd, config)

  console.log("Checking for pre-existing files...")
  await checkBucketContents()

  console.log("Uploading blog to S3...")
  await Promise.all(files
    .map(info => {
      // Paths start with /build
      const ignoreLength = config.out ? config.out.length : 6
      info.path = info.path.substring(ignoreLength)
      return info
    })
    .filter(isNewContent)
    .map(upload),
  )

  console.log("DONE uploading to S3!!!")
}

/**
 * Wrapper for S3, using blog config.
 */
class S3 {
  private readonly config: IConfig
  private readonly instance: any
  private existing: string[]

  constructor(config: IConfig) {
    this.config = config
    if (!this.config.s3) return
    const credsLocation = type() === "Darwin"
      ? this.config.s3.creds.replace("~", homedir())
      : this.config.s3.creds

    AWS.config.loadFromPath(credsLocation)
    this.instance = new AWS.S3()
  }

  public isNewContent = ({ path }: IUploadEntity): boolean => {
    const key = path.replace(/^\//, "")
    return this.existing.indexOf(key) === -1
  }

  public checkBucketContents = (): Promise<string[]> => {
    return new Promise(resolve => {
      if (!this.config.s3) throw new Error("s3 is not set up")
      this.instance.listObjects({
        Bucket: this.config.s3.bucket,
        Prefix: "images",
      }, (error: any, meta: any) => {
        if (error) throw new Error(error)
        this.existing = meta.Contents.map(({ Key }: any) => Key)
        resolve(this.existing)
      })
    })
  }

  public upload = ({ content, path }: IUploadEntity) => {
    const key = path.replace(/^\//, "")

    return new Promise(resolve => {
      if (!this.config.s3) throw new Error("s3 is not set up")
      return this.instance.putObject({
        ACL: "public-read",
        Body: content,
        Bucket: this.config.s3.bucket,
        Key: key,
      }, (error: any, meta: any) => {
        if (error) console.error(error)
        else resolve(meta)
      })
    })
  }
}
