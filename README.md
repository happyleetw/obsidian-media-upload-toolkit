# 📸 Obsidian Media Upload Toolkit

> Seamlessly upload and manage images and videos for your Obsidian notes across multiple cloud platforms

## 🚀 Overview

This plugin automatically uploads local images and videos embedded in your markdown files to your preferred remote storage service, then exports the markdown with updated media URLs to your clipboard. The original markdown files in your vault remain unchanged, preserving your local media references.

New in this version:
- Video Support: You can now upload videos (mp4, mov, avi, webm, mkv, etc.) in addition to images.
- Smart {path} Variable: Use {path} in your target path to automatically organize uploads by the top-level folder of your current note (e.g., /Diary/2025/06/ → {path} = Diary).

### Supported Media Stores

- [Imgur](https://imgur.com) - Simple, free image hosting (images only, no video support)
- [AliYun OSS](https://www.alibabacloud.com/product/object-storage-service) - Alibaba Cloud Object Storage
- [Imagekit](https://imagekit.io) - Media CDN and optimization
- [Amazon S3](https://aws.amazon.com/s3/) - Scalable cloud storage
- [TencentCloud COS](https://cloud.tencent.com/product/cos) - Cloud Object Storage
- [Qiniu Kodo](https://www.qiniu.com/products/kodo) - Object storage service
- [GitHub Repository](https://github.com) - Git-based storage
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) - S3-compatible storage

Perfect for publishing to static sites like [GitHub Pages](https://pages.github.com) or any platform that requires externally hosted media files.

## ✨ Features

- **One-Click Upload** - Upload all local images and videos with a single command
- **Multiple Storage Options** - Choose from 8 different cloud storage providers
- **Clipboard Ready** - Updated markdown copied directly to clipboard
- **Preservation** - Keep your original notes unchanged in your vault
- **Smart Path Organization** - Use dynamic path variables including `{path}` for top-level folder organization
- **Customizable Paths** - Configure target paths for your uploaded media files
- **Optional In-Place Replacement** - Option to update original files directly if preferred
- **Flexible Attachment Locations** – Choose where attachments are saved:
  - Vault folder: Adds the attachment to the root of your vault.
  - In the folder specified below: Adds the attachment to a specified folder.
  - Same folder as current file: Adds the attachment to the same folder as the note you added it to.
  - In subfolder under current folder: Adds attachments to a specified folder next to the note you added the attachment to. If it doesn't exist, Obsidian creates it when you add an attachment.

## 🔍 Usage

1. Open command palette (Ctrl/Cmd + P)
2. Type "publish page" and select the command
3. All local images and videos will be uploaded to your configured remote storage
4. The markdown with updated media URLs will be copied to your clipboard with a notification

### Supported Media Formats

**Images**: PNG, JPG, JPEG, GIF, SVG, WebP, Excalidraw
**Videos**: MP4, AVI, MOV, WMV, FLV, WebM, MKV, M4V, 3GP, OGV

### Path Variables

The plugin supports dynamic path variables for organizing your uploaded media:

- `{year}` - Current year (e.g., 2025)
- `{mon}` - Current month with leading zero (e.g., 06)
- `{day}` - Current day with leading zero (e.g., 15)
- `{random}` - Random string for unique naming
- `{filename}` - Original file name
- `{path}` - **Top-level folder name** of the current note

**Example**: If your note is located at `Diary/2025/06/my-note.md` and you use the path template `/{path}/{year}/{mon}/{day}/{filename}`, the uploaded file will be stored as `/Diary/2025/06/15/my-media.jpg`.

![screenshot](https://github.com/user-attachments/assets/d20abcac-78a3-4275-b391-818ad781c219)

## 🛠️ Configuration

Each media store requires specific configuration in the plugin settings. Detailed setup guides are available in the [Appendix](#appendix) section below.

### Path Configuration

When configuring your storage service, you can use the **Target Path** setting to organize your uploaded media files. The plugin supports several variables that will be automatically replaced:

- **Basic Variables**: `{year}`, `{mon}`, `{day}`, `{filename}`, `{random}`
- **Smart Organization**: `{path}` - Automatically uses the top-level folder name of your current note

**Recommended Path Templates**:
- `/{path}/{year}/{mon}/{day}/{filename}` - Organize by note category, then by date
- `/{year}/{mon}/{day}/{path}/{filename}` - Organize by date, then by note category
- `/{path}/{filename}` - Simple organization by note category only

## 📋 Roadmap

- [ ] support uploading media to more storages
  - [x] Imgur
  - [x] Aliyun Oss
  - [x] ImageKit
  - [x] Amazon S3
  - [x] TencentCloud COS
  - [x] Qiniu Kodo
  - [x] GitHub Repository
  - [x] Cloudflare R2
  - [ ] more...
- [x] setting for replacing media embedded in origin markdown directly
- [x] support for video file uploads
- [x] smart path organization with `{path}` variable

## 👥 Contributing

Contributions to enhance this plugin are welcome! Here's how to get started:

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Setup

1. Clone the repository
2. Install dependencies:

```shell
npm install
```

### Development Workflow

Start a development build with hot-reload enabled:

```shell
npm run dev
```

> **Note**: If you haven't already installed the hot-reload-plugin, you'll be prompted to. Enable that plugin in your Obsidian vault before hot-reloading will start. You might need to refresh your plugin list for it to show up.

### Building for Release

Generate a production build:

```shell
npm run build
```

### Testing

Before submitting a pull request, please test your changes thoroughly and ensure they work across different platforms if possible.

---

## 🙏 Acknowledgements

This plugin was inspired by the powerful markdown editor [MWeb Pro](https://www.mweb.im) and builds upon the work of several exceptional projects:

- [obsidian-imgur-plugin](https://github.com/gavvvr/obsidian-imgur-plugin) - Reference implementation for Imgur upload functionality
- [obsidian-image-auto-upload-plugin](https://github.com/renmu123/obsidian-image-auto-upload-plugin) - Inspiration for additional features and media support
- [create-obsidian-plugin](https://www.npmjs.com/package/create-obsidian-plugin) - Tooling for plugin development

---

## Appendix

### Imgur Users: Obtaining your own Imgur Client ID

Imgur service usually has a daily [upload limits](https://apidocs.imgur.com/#rate-limits) and supports images only (no video uploads). To overcome the limits, create and use your own Client ID. This is generally easy, by following the steps below :

1. If you do not have an imgur.com account, [create one](https://imgur.com/register) first.

2. Visit [https://api.imgur.com/oauth2/addclient](https://api.imgur.com/oauth2/addclient) and generate **Client ID** for Obsidian with following settings:

   - provide any application name, i.e. "Obsidian"
   - choose "OAuth 2 authorization without a callback URL" (**important**)
   - Add your E-Mail

3. Copy the Client ID. (Note: You only need the **Client ID**. The Client secret is confidential information not required by this plugin. Keep it secure.)
4. Paste this Client ID in the plugin settings.

### 🌩️ Cloudflare R2 Setup Guide

To configure Cloudflare R2 as your media storage solution:

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up) if you don't already have one.
2. Enable R2 storage in your Cloudflare dashboard.
3. Create an R2 bucket to store your media files.
4. Generate API credentials for your R2 bucket:
   - Navigate to `R2 > Overview > Manage R2 API Tokens`
   - Create a new API token with read and write permissions
   - Copy your Access Key ID and Secret Access Key
5. In the plugin settings, select "Cloudflare R2" as your media store and configure:
   - **Access Key ID and Secret Access Key** from step 4
   - **Endpoint**: Your R2 endpoint URL (typically `https://<account-id>.r2.cloudflarestorage.com`)
   - **Bucket Name**: The name of your bucket created in step 3
   - **Target Path**: Optional path template for organizing your uploaded media (supports `{year}`, `{mon}`, `{day}`, `{filename}`, `{random}`, `{path}` variables)
   - **Custom Domain Name**: Choose either:
     - Your own custom domain (if configured for your bucket)
     - The free R2.dev URL (format: `https://<random-id>.<account-id>.r2.dev`) provided by Cloudflare for public assets

### 🐙 GitHub Repository Setup

To use GitHub as your media hosting solution:

1. Create a personal access token:
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Create a new token with `repo` scope
   - Copy your token
2. In the plugin settings, select "GitHub Repository" as your media store and configure:
   - **GitHub Token**: The personal access token from step 1
   - **Repository Owner**: Your GitHub username or organization name
   - **Repository Name**: Name of the repository to store media
   - **Branch Name**: Branch to upload media to (default is `main`)
   - **Target Path**: Path within the repository for storing media (supports `{year}`, `{mon}`, `{day}`, `{filename}`, `{random}`, `{path}` variables)
   - **Custom Domain**: Optional custom domain if you're using GitHub Pages with a custom domain

### ☁️ Amazon S3 Setup

To configure Amazon S3 for media hosting:

1. Create an [AWS account](https://aws.amazon.com) if you don't have one
2. Create an S3 bucket with appropriate permissions:
   - Go to [S3 Console](https://console.aws.amazon.com/s3/)
   - Create a new bucket with public read access (if you want media to be publicly accessible)
3. Create IAM credentials:
   - Navigate to [IAM Console](https://console.aws.amazon.com/iam/)
   - Create a new user with programmatic access
   - Attach S3 permissions policies
   - Copy the Access Key ID and Secret Access Key
4. In the plugin settings, select "Amazon S3" as your media store and configure:
   - **Access Key ID and Secret Access Key**: Credentials from step 3
   - **Region**: AWS region where your bucket is located
   - **Bucket Name**: Name of your S3 bucket
   - **Target Path**: Optional folder path for your media (supports `{year}`, `{mon}`, `{day}`, `{filename}`, `{random}`, `{path}` variables)
   - **Custom Domain**: Optional CDN domain if you've set one up for your bucket

### 🌐 AliYun OSS Setup

To use Alibaba Cloud Object Storage Service for media hosting:

1. Create an [Alibaba Cloud account](https://www.alibabacloud.com) if needed
2. Create an OSS bucket:
   - Go to the [OSS console](https://oss.console.aliyun.com)
   - Create a new bucket with appropriate access settings for media storage
3. Generate access credentials:
   - Go to [AccessKey Management](https://ram.console.aliyun.com/manage/ak)
   - Create a new access key pair
   - Copy your AccessKey ID and AccessKey Secret
4. In the plugin settings, select "Aliyun OSS" as your media store and configure:
   - **Access Key ID and Secret**: From step 3
   - **Region**: OSS region (e.g., `oss-cn-hangzhou`)
   - **Bucket Name**: Your OSS bucket name
   - **Target Path**: Optional directory for media (supports `{year}`, `{mon}`, `{day}`, `{filename}`, `{random}`, `{path}` variables)
   - **Custom Domain**: Optional CDN domain if configured

### 🖼️ ImageKit Setup

To use ImageKit for media optimization and delivery:

1. Create an [ImageKit account](https://imagekit.io/registration/) if needed
2. From your ImageKit dashboard:
   - Get your private API key from Account > Developer Options
   - Note your ImageKit URL endpoint
3. In the plugin settings, select "ImageKit" as your media store and configure:
   - **Public Key**: Your ImageKit public key
   - **Private Key**: Your ImageKit private API key
   - **URL Endpoint**: Your ImageKit URL endpoint (e.g., `https://ik.imagekit.io/yourusername`)
   - **Target Path**: Optional folder structure for organizing uploads (supports `{year}`, `{mon}`, `{day}`, `{filename}`, `{random}`, `{path}` variables)

### ☁️ TencentCloud COS Setup

To use Tencent Cloud Object Storage for media hosting:

1. Create a [Tencent Cloud account](https://cloud.tencent.com) if needed
2. Create a COS bucket:
   - Go to the [COS console](https://console.cloud.tencent.com/cos)
   - Create a new bucket with appropriate permissions for media storage
3. Generate API credentials:
   - Go to [CAM console](https://console.cloud.tencent.com/cam/capi)
   - Create a new SecretId and SecretKey
4. In the plugin settings, select "TencentCloud COS" as your media store and configure:
   - **Secret ID and Secret Key**: From step 3
   - **Region**: COS region (e.g., `ap-guangzhou`)
   - **Bucket Name**: Your COS bucket name
   - **Target Path**: Optional folder for organizing media (supports `{year}`, `{mon}`, `{day}`, `{filename}`, `{random}`, `{path}` variables)
   - **Custom Domain**: Optional CDN domain if configured

### 🗄️ Qiniu Kodo Setup

To use Qiniu Kodo object storage for media hosting:

1. Create a [Qiniu Cloud account](https://www.qiniu.com) if needed
2. Create a Kodo bucket:
   - Go to the Kodo console
   - Create a new bucket for media storage
3. Generate access credentials:
   - Go to Key Management and create a new key pair
   - Copy your Access Key and Secret Key
4. In the plugin settings, select "Qiniu Kodo" as your media store and configure:
   - **Access Key and Secret Key**: From step 3
   - **Bucket Name**: Your Kodo bucket name
   - **Domain Name**: The domain bound to your bucket for access
   - **Target Path**: Optional folder for organizing media (supports `{year}`, `{mon}`, `{day}`, `{filename}`, `{random}`, `{path}` variables)
