# 公网部署指南

本项目是纯静态网页，部署后任何电脑、手机均可通过 HTTPS 链接访问。

## 方式一：Vercel 一键部署（推荐，永久免费）

1. 在项目目录打开 PowerShell
2. 运行：

```powershell
cd e:\firstcc
.\deploy.ps1
```

3. 首次会提示登录 Vercel（可用 GitHub 免费注册，约 30 秒）
4. 部署成功后终端会显示 `Production: https://xxxx.vercel.app`
5. 将该链接发给任何人即可访问

## 方式二：Netlify 拖拽部署（无需命令行）

1. 打开 https://app.netlify.com/drop
2. 将整个 `public` 文件夹拖入页面（或拖入 `public-site.zip` 解压后的内容）
3. 立即获得 `https://随机名.netlify.app` 链接
4. 建议注册 Netlify 免费账号以保留站点

## 方式三：本地运行（仅本机或同一 Wi-Fi）

```powershell
cd e:\firstcc
npm start
```

- 本机：http://localhost:3000
- 同 Wi-Fi 其他设备：http://你的局域网IP:3000

---

## 为什么之前别的电脑打不开？

之前只在你的电脑上运行了本地服务器（localhost），没有上传到公网，所以外网和其他网络无法访问。部署到 Vercel/Netlify 后即可全球访问。

## 更新网页后如何重新部署

修改代码后再次运行 `.\deploy.ps1` 即可更新公网版本。
