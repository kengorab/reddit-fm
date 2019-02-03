require('dotenv').config()
const { promisify } = require('util')
const fs = require('fs')
const glob = promisify(require('glob'))
const mime = require('mime-types')
const path = require('path')
const AWS = require('aws-sdk')

const s3 = new AWS.S3()

const env = process.argv[2]
if (env !== 'dev' && env !== 'prod') {
  console.log(`Environment needs to be either 'dev' or 'prod', got ${env}`)
  process.exit(1)
}

const bucketName = env === 'dev'
  ? process.env.S3_BUCKET_NAME_DEV
  : process.env.S3_BUCKET_NAME_PROD

async function main() {
  const buckets = await s3.listBuckets().promise()
  const bucketExists = buckets.Buckets.some(bucket => bucket.Name === bucketName)

  if (!bucketExists) {
    console.log(`Creating bucket ${bucketName}`)
    try {
      await s3.createBucket({ Bucket: bucketName }).promise()
    } catch (e) {
      console.error(`Could not create bucket ${bucketName}: ${e}`)
      process.exit(1)
    }
  } else {
    console.log(`Bucket ${bucketName} exists, uploading files from build/`)
  }

  const buildPath = path.join(__dirname, '..', 'build')
  const stats = await promisify(fs.stat)(buildPath)
  if (!stats.isDirectory()) {
    console.log('build/ directory does not exist, make sure you run a build first')
    process.exit(1)
  }
  const files = await glob(`${buildPath}/**/*`)

  const promises = files.map(async file => {
    try {
      const stats = await promisify(fs.stat)(file)
      if (stats.isDirectory()) {
        return
      }

      const key = file.replace(`${buildPath}/`, '').replace('~', '\\~')
      console.log(`Uploading ${key}...`)
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: await promisify(fs.readFile)(file, { encoding: 'utf-8' }),
        ContentType: mime.lookup(key) || 'text/plain',
      }
      if (key === 'index.html') {
        params.CacheControl = 'max-age=0'
      }

      await s3.upload(params).promise()
      console.log(`Uploaded ${key}`)
    } catch (e) {
      console.error(`Error reading file ${file}: ${e}`)
    }
  })

  await Promise.all(promises)
}

main()
