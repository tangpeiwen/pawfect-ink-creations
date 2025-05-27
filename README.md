# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5db8d6e5-7286-43d5-a8ac-365288537191

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5db8d6e5-7286-43d5-a8ac-365288537191) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5db8d6e5-7286-43d5-a8ac-365288537191) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## API服务

项目包含一个Node.js后端API服务，用于处理宠物贴纸生成请求。

### 开发环境运行

要在本地运行API服务：

```bash
# 安装依赖
npm install

# 启动API服务
node api/index.js

# 或使用nodemon进行开发（需安装nodemon）
npx nodemon api/index.js
```

API服务默认在3001端口运行，可以通过环境变量PORT更改。

### API端点

- `POST /api/generate-stickers`: 生成宠物贴纸
  - 请求体: FormData包含以下字段
    - `petImage`: 宠物图片文件
    - `stylePrompt`: 风格描述
    - `features`: 特征列表（JSON字符串）
    - `additionalElements`: 额外元素（JSON字符串）
  - 响应: `{ success: true, images: string[] }`

- `GET /api/health`: 健康检查
  - 响应: `{ status: 'ok', timestamp: Date }`

### 部署

API服务可以部署在Vercel上：

```bash
# 使用Vercel CLI部署
vercel --prod
```

或者通过GitHub仓库连接Vercel进行自动部署。
