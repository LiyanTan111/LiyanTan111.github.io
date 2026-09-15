# liyantan.github.io

Liyan Tan 的个人主页。基于 [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io)
（Jekyll + Minimal Mistakes，MIT 协议）。

## 改内容看这两个文件

- `_pages/about.md` —— 页面正文：自我介绍、Publications、Educations、Internships、Teaching、Honors
- `_config.yml` —— 姓名、头像、一句话 bio、邮箱、GitHub、Google Scholar 等

其他常用位置：

```
images/            头像 profile.jpg、论文缩略图 grzo.png / zoaf.png
images/papers/     论文原图（项目页备用）
_data/navigation.yml   顶部导航
_sass/ assets/     样式，改配色在这里
cv_liyan_tan.pdf   导航里 CV 指向的文件
cv/                简历 LaTeX 源文件与 Overleaf 上传包
paper-sources/     arXiv 源码包与全部配图预览（不进 git）
```

## 本地预览

```bash
bundle install
./run_server.sh        # http://127.0.0.1:4000
```

## 部署

仓库名必须是 `liyantan.github.io`，推到 `main` 后 GitHub Pages 自带的 Jekyll
会自动构建，不需要 Actions。首次推送后到仓库 Settings → Pages，Source 选
"Deploy from a branch"，分支 `main`、目录 `/ (root)`。

## 其他分支

- `astro-version` —— 之前用 Astro 写的版本，含每篇论文的独立项目页、
  JSON-LD、citation meta、llms.txt。换模版后暂时搁置，后续要做论文页可以回去取。

## 待办

见 PLAN.md。当前：真实头像还没换；论文项目页还没在这个模版里重建；
GitHub 仓库尚未创建。
