Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  口译训练网页 - 公网部署 (Vercel)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "首次运行会打开浏览器，请用 GitHub/邮箱免费登录 Vercel（约30秒）。" -ForegroundColor Yellow
Write-Host "登录成功后自动部署，将获得 https://xxx.vercel.app 公网链接。" -ForegroundColor Yellow
Write-Host ""

npx --yes vercel deploy --prod

Write-Host ""
Write-Host "部署完成！请复制上方 Production 链接，任何电脑均可访问。" -ForegroundColor Green
Write-Host ""
