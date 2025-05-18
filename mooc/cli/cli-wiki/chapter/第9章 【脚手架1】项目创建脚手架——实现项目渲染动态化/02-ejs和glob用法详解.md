# ejs和glob用法详解

## ejs用法

### ejs模板的三种用法

```js
let template = ejs.compile(str, options);
template(data);
// => 输出渲染后的 HTML 字符串

ejs.render(str, data, options);
// => 输出渲染后的 HTML 字符串

ejs.renderFile(filename, data, options, function(err, str){
    // str => 输出渲染后的 HTML 字符串
});
```

### 标签含义

```js
<% '脚本' 标签，用于流程控制，无输出。
<%_ 删除其前面的空格符
<%= 输出数据到模板（输出是转义 HTML 标签）
<%- 输出非转义的数据到模板
<%# 注释标签，不执行、不输出内容
<%% 输出字符串 '<%'
%> 一般结束标签
-%> 删除紧随其后的换行符
_%> 将结束标签后面的空格符删除
```

### 包含

```js
<%- include('header', { header: 'header' }); -%>
<h1>
  Title
</h1>
<p>
  My page
</p>
<%- include('footer', { footer: 'footer' }); -%>
```

### 自定义分隔符

```js
let ejs = require('ejs'),
    users = ['geddy', 'neil', 'alex'];

// 单个模板文件
ejs.render('<?= users.join(" | "); ?>', {users: users},
    {delimiter: '?'});
// => 'geddy | neil | alex'

// 全局
ejs.delimiter = '$';
ejs.render('<$= users.join(" | "); $>', {users: users});
// => 'geddy | neil | alex'
```

### 自定义文件加载器

```js
let ejs = require('ejs');
let myFileLoader = function (filePath) {
  return 'myFileLoader: ' + fs.readFileSync(filePath);
};

ejs.fileLoader = myFileLoad;
```


## glob用法

### glob简介

参考慕课手记：[https://www.imooc.com/article/4053](https://www.imooc.com/article/4053)

### glob用法

参考npm仓库：[https://www.npmjs.com/package/glob](https://www.npmjs.com/package/glob)
