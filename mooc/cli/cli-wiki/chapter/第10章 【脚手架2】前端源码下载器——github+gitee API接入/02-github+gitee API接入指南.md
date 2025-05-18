# github+gitee API接入指南

## github API

### 接入地址

> [文档地址](https://docs.github.com/en/rest)

### 创建token

> [文档地址](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

### 搜索API

#### 搜索仓库

调试方法：

```bash
curl \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>" \
  https://api.github.com/search/repositories?q=Q
```

> [文档地址](https://docs.github.com/en/rest/search#search-repositories)

接入案例：

```bash
curl \                          
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <Your-Token>" \
  https://api.github.com/search/repositories\?q\=vue+language:vue\&sort\=stars\&order\=desc\&per_page\=5\&page\=1
```

#### 搜索源码

接入案例：

```bash
curl \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>" \
  https://api.github.com/search/code?q=Q
```

[文档地址](https://docs.github.com/en/rest/search#search-code)

### Tags API

接入案例：

```bash
curl \                          sam@Sam-MacBookPro2018
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <Your-Token>" \
  https://api.github.com/repos/vuejs/vue/tags\?per_page\=100\&page\=1
```

### 仓库API

接入案例：

```bash
curl \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>" \
  https://api.github.com/repos/OWNER/REPO
```

> [文档地址](https://docs.github.com/en/rest/repos/repos)

## gitee API

### 接入地址

> [文档地址](https://gitee.com/api/v5/swagger#/getV5ReposOwnerRepoStargazers?ex=no)

### 创建token

> [文档地址](https://gitee.com/profile/personal_access_tokens)

### 搜索API

> [文档地址](https://gitee.com/api/v5/swagger#/getV5SearchRepositories)

### 仓库API

- 获取组织的仓库：[https://gitee.com/api/v5/swagger#/getV5OrgsOrgRepos](https://gitee.com/api/v5/swagger#/getV5OrgsOrgRepos)
- 获取用户的仓库：[https://gitee.com/api/v5/swagger#/getV5ReposOwnerRepo](https://gitee.com/api/v5/swagger#/getV5ReposOwnerRepo)
