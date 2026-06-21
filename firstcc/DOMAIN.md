# 获取 .com 域名 + 公网访问指南

## 重要说明

**免费部署**（Vercel / Netlify）默认给你的是：
- `https://xxx.vercel.app`
- `https://xxx.netlify.app`

**不是 `.com`**。要获得 `https://你的名称.com`，需要：

1. **购买域名**（约 50–80 元/年，阿里云、腾讯云、Namecheap 等）
2. **免费托管网页**（Vercel 或 Netlify）
3. **在托管平台绑定你买的 .com 域名**

---

## 第一步：先部署到公网（免费）

### 方法 A — Vercel（推荐）

PowerShell 运行：

```powershell
cd e:\firstcc
.\deploy.ps1
```

浏览器登录 Vercel 后，会得到：`https://xxxx.vercel.app`（全球可访问）

### 方法 B — Netlify 拖拽

1. 打开 `e:\firstcc\public` 文件夹
2. **Ctrl+A 全选**内部所有文件（index.html、css、js、data）
3. 拖到 https://app.netlify.com/drop
4. 得到：`https://xxxx.netlify.app`

---

## 第二步：购买 .com 域名

国内常用：

| 平台 | 地址 |
|------|------|
| 阿里云 | https://wanwang.aliyun.com |
| 腾讯云 | https://dnspod.cloud.tencent.com |
| Namecheap | https://www.namecheap.com |

搜索并购买例如：`kouyi-training.com`、`interpret-trainer.com` 等未被注册的名称。

---

## 第三步：绑定 .com 到 Vercel

1. 登录 https://vercel.com → 进入你的项目
2. **Settings → Domains**
3. 输入你购买的域名，如 `kouyi-training.com`
4. 按提示在域名服务商处添加 DNS 记录（通常是 CNAME 到 `cname.vercel-dns.com`）
5. 等待 10 分钟–24 小时生效
6. 访问 `https://kouyi-training.com` 即可

### Netlify 绑定同理

**Site settings → Domain management → Add custom domain**

---

## 当前待完成：Vercel 登录

若终端正在等待认证，请浏览器打开：

https://vercel.com/oauth/device

输入设备码：**SFJM-PCCT**（若已过期，重新运行 `.\deploy.ps1` 获取新码）

登录完成后部署自动完成，终端会显示 Production 链接。

---

## 总结

| 目标 | 是否需要付费 | 结果 |
|------|-------------|------|
| 任何电脑都能打开 | 否 | `xxx.vercel.app` 或 `xxx.netlify.app` |
| 以 .com 结尾 | 是（域名费） | `你的域名.com` |

免费方案已足够全球访问；`.com` 只是域名外观不同，功能相同。
