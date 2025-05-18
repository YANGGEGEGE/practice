# 脚手架5：【脚手架5】云发布脚手架——实现github actions自动化发布

## 1.为什么要实现自动发布？
优势：
- 减少发布过程中的手动操作成本，大幅提升CI/CD效率，快速实现项目发布上线

局限：
- 存在较高的技术门槛
- 需要租用额外的服务，会产生技术成本

## 2.如何实现自动发布？
- 方案1：完全自主实现自动发布逻辑
- 方案2：使用 github actions
- 方案3：使用 jenkins

## 3.Github Actions简介
Github Actions 是 Github 官方推出的 CI/CD 解决方案
> [https://docs.github.com/en/actions](https://docs.github.com/en/actions)

下图展示了 Github Actions 的工作原理：
![img](https://img.mukewang.com/wiki/61de37bc09ef07c026171783.jpg)
- Workflow 是一个可配置的自动化流程，可以包含多个 jobs。通过在 .github/workflows 添加 .yml 配置文件实现 1 个 workflow，一个工程可以包含多个 workflow。
> - [https://docs.github.com/cn/actions/learn-github-actions/understanding-github-actions#workflows](https://docs.github.com/cn/actions/learn-github-actions/understanding-github-actions#workflows)
> - YAML （YAML Ain’t a Markup Language）是一种标记语言，可读性较好，适合编写配置文件，Java Spring 框架也采用了 YAML 来写配置文件。

- Event 是触发 workflow 的特殊事件，比如 pull request，push 或者 issue，也可以完全自定义，完整列表请看：[https://docs.github.com/cn/actions/learn-github-actions/events-that-trigger-workflows](https://docs.github.com/cn/actions/learn-github-actions/events-that-trigger-workflows)

- Job 是 Workflow 当中一系列的可执行步骤，每个 Job 是在同一个 runner 中进行的（Runner 是指处于 github 的一台特殊的虚拟机，支持各种操作系统），每个步骤或者是一个 shell 脚本，抑或是一个可执行的 action，每个步骤是按顺序执行，并且互相依赖的。

- Action 是 github actions 中的一个自定义应用，它可以运行一系列复杂的并且常用的任务，使用 action 可以帮我们减少在 workflow 中写重复代码，Github 提供了非常多常用的 action，可以在这里查阅：[https://github.com/marketplace?type=actions](https://github.com/marketplace?type=actions) 同时我们也可以写自己的 action。
