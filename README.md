

推荐使用vite创建react项目
npm create vite@latest my-react-app -- --template react

### nvm 使用技巧

#### 解决 nvm 在国内网络环境下的访问问题

当遇到 `nvm install` 或 `nvm ls-remote` 无法访问或速度慢的问题时，可以使用国内镜像源：

```bash
# 设置 Node.js 镜像源为淘宝镜像
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/

# 然后执行 nvm 命令
nvm ls-remote  # 列出所有可用的 Node.js 版本
nvm install 20  # 安装 Node.js v20
```

这样可以显著提高下载速度并解决网络访问问题。

#### 持久化配置

可以将镜像设置添加到你的 shell 配置文件中（如 ~/.bashrc、~/.zshrc 等）：

```bash
echo 'export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/' >> ~/.zshrc
source ~/.zshrc
```

