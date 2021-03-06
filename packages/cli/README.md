Blog-o-Matic CLI
================
The Blog-o-Matic CLI tool is for syncing your blog to your computer's filesystem

## API
| Command | Description |
|---|---|
| `blog init` | Generate a blog |
| `blog post` | Generate a blog post |
| `blog preview` | Open a server for blog content |
| `blog publish` | Build blog, and push, depending on blog.config.yml settings |
| `blog publish --fs --s3` | Publish both via fs and s3 |

## Unimplemented
We should have publish settings:
```sh
blog publish ./resources/my-image-1.jpg   # Re-upload a file.
blog publish ./posts/my-post-1.md --force # Upload files related to a post
blog publish --force                      # Re-upload all files
```

We should be able to specify more in args:
```sh
blog init ./my-blog
blog post ./my-post
```

We should be able to convert a non-post markdown file into a post:
```sh
blog post ./my-post.md
```

## Publish Flow
### Generate Blog
The important thing to take note of is generation of blog.config.yml

### Compiler
This should be publisher-agnostic
Input: Local directory location
- Take note of all the locations of local files.
- Do all transformations.
Ouput: Array of upload objects (File data + Relative file location strings)

### Publisher
Input: Remote info, publish array
- Run validation on each upload object.
- Complete actual upload of file
