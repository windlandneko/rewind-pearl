// ============================================================================
// rewind-pearl 项目文档通用模板
// 用于生成统一风格的模块 API 文档
// ============================================================================

/*
使用示例：

#import "template.typ": *

#show: initialize-document

#title-page(
  title: "Module.js 文档",
  subtitle: "模块说明",
  authors: ("作者1", "作者2"),
  date: "2025年10月8日",
)

#outline(title: "目录", indent: auto)

= 模块介绍

这是模块介绍...

= API 参考

#api-function(
  name: "functionName(param1, param2)",
  description: "函数描述",
  parameters: (
    (name: "param1", type: "string", description: "参数1说明"),
    (name: "param2", type: "number", optional: true, description: "参数2说明"),
  ),
  returns: (type: "boolean", description: "返回值说明"),
  example: ```js
  const result = functionName("test", 123)
  ```,
  notes: "这里是注意事项",
)

#info-box(
  type: "warning",
)[
  这是一个警告信息框
]

#styled-table(
  columns: (1fr, 2fr, 2fr),
  headers: ([列1], [列2], [列3]),
  rows: (
    ([值1], [值2], [值3]),
    ([值4], [值5], [值6]),
  ),
  caption: [表格标题],
)

#best-practice(
  bad: ```js
  // 不好的写法
  ```,
  good: ```js
  // 好的写法
  ```,
  explanation: "解释为什么这样更好",
)
*/


// ============================================================================
// 1. 页面与排版设置
// ============================================================================

#let initialize-document(body) = {
  set page(
    paper: "a4",
    margin: (left: 2cm, right: 2cm, top: 2cm, bottom: 2cm),
    numbering: "1",
    number-align: center,
  )

  set text(
    font: "HarmonyOS Sans SC",
    size: 11pt,
    lang: "zh",
    top-edge: "ascender",
    bottom-edge: "descender",
  )

  set par(
    justify: true,
    leading: 0.65em,
    first-line-indent: 0em,
  )

  set heading(numbering: "1.1")

  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    v(1em)
    block(
      width: 100%,
    )[
      #text(size: 20pt)[#it]
      #v(-0.5em)
      #line(length: 100%, stroke: 1pt + black)
    ]
    v(0.8em)
  }

  show heading.where(level: 2): it => {
    align(center)[
      #text(size: 14pt, weight: "bold", fill: rgb("#2c5aa0"), it.body)
    ]
  }

  show heading.where(level: 3): it => {
    v(1em)
    text(size: 12pt, weight: "bold", fill: rgb("#4a90e2"), it.body)
    v(0.4em)
  }

  show link: underline

  show raw.where(block: true): it => {
    block(
      width: 100%,
      fill: rgb("#fbfbfb"),
      inset: 1em,
      radius: 3pt,
      stroke: 1pt + rgb("#cfcfcf"),
      text(font: ("JetBrains Mono", "Consolas", "HarmonyOS Sans SC"), size: 9.5pt, it),
    )
  }

  show raw.where(block: false): it => {
    box(
      fill: rgb("#f0f0f0"),
      inset: (x: 4pt, y: 1.5pt),
      radius: 2pt,
      baseline: 3pt,
      text(font: ("JetBrains Mono", "Consolas"), size: 9.5pt, fill: rgb("#d73a49"), it),
    )
  }

  body
}

// ============================================================================
// 2. 封面组件
// ============================================================================

#let metadata(
  title: "",
  subtitle: "",
  project: "rewind-pearl",
  authors: (),
  date: datetime.today().display("[year]年[month]月[day]日"),
) = {
  set page(numbering: none)

  align(center)[
    #v(3cm)
    #text(size: 28pt, weight: "bold", fill: rgb("#1a1a1a"))[#title]
    #v(0.5em)
    #text(size: 14pt, fill: rgb("#666666"))[#subtitle]

    #v(4cm)



    #align(center + bottom)[

      #if authors.len() > 0 [
        #text(size: 15pt, weight: "bold")[Contributors]
        #v(-0.6em)
        #text(size: 12pt, font: ("JetBrains Mono", "Consolas", "HarmonyOS Sans SC"))[#authors.join(", ")]
        #v(8em)
      ]

      #text(size: 14pt, fill: rgb("#999999"), font: ("JetBrains Mono", "Consolas", "HarmonyOS Sans SC"))[#project]

      #text(size: 12pt, fill: rgb("#999999"))[
        #if date != none [ 文档生成时间：#date ]
      ]
    ]
  ]

  pagebreak()
}

// ============================================================================
// 3. API 函数/方法文档块
// ============================================================================

#let api(
  name: "",
  description: "",
  parameters: (),
  returns: none,
  example: none,
  notes: none,
) = {
  block(
    width: 100%,
    fill: rgb("#f9fcff"),
    inset: 1.2em,
    radius: 4pt,
    stroke: 1pt + rgb("#64a5ea"),
    breakable: true,
  )[
    // 函数名
    #text(size: 14pt, weight: "bold", font: ("JetBrains Mono", "HarmonyOS Sans SC"))[
      #name
    ]

    // 描述
    #if description != "" [
      #text(size: 11pt, fill: rgb("#333333"))[#description]
    ]

    #v(0.5em)

    // 参数列表
    #if parameters.len() > 0 [
      #for param in parameters [
        #box(width: 100%)[
          #text(font: ("JetBrains Mono", "HarmonyOS Sans SC"), weight: "bold", fill: rgb("#0c7fd2"))[#param.name]
          #h(0.3em)
          #text(font: ("LXGW WenKai Mono", "HarmonyOS Sans SC"), weight: 300, fill: rgb("#6a737d"))[#param.type]
          #if param.at("optional", default: false) [ #text(fill: rgb("#999999"))[（可选）] ]

          #v(-0.6em)
          #h(1em)
          #text(size: 10pt, fill: rgb("#5c5c5c"))[#param.description]
        ]
      ]
    ]

    // 返回值
    #if returns != none [
      #text(font: ("JetBrains Mono", "HarmonyOS Sans SC"), fill: rgb("#0c7fd2"))[返回值]
      #h(0.3em)
      #text(font: ("LXGW WenKai Mono", "HarmonyOS Sans SC"), weight: 300, fill: rgb("#6a737d"))[#returns.type]

      #v(-0.6em)
      #h(1em)
      #text(size: 10pt, fill: rgb("#5c5c5c"))[#returns.description]
    ]

    // 示例代码
    #example

    // 注意事项
    #if notes != none [
      #v(0.5em)
      #block(
        width: 100%,
        fill: rgb("#fff9e6"),
        inset: 0.8em,
        radius: 4pt,
        stroke: 1pt + rgb("#ffe066"),
      )[
        #text(size: 9pt, weight: "bold", fill: rgb("#996600"))[💡 注意：]
        #text(size: 9pt, fill: rgb("#666600"))[#notes]
      ]
    ]
  ]

  v(0.2em)
}

// ============================================================================
// 4. 信息框组件
// ============================================================================

#let info-box(
  title: "信息",
  content,
  type: "info", // info, warning, success, error
) = {
  let colors = (
    info: (bg: rgb("#e7f3ff"), border: rgb("#b9e0ff"), icon: "ℹ️"),
    warning: (bg: rgb("#fff9e6"), border: rgb("#ff9800"), icon: "⚠️"),
    success: (bg: rgb("#e8f5e9"), border: rgb("#4caf50"), icon: "✅"),
    error: (bg: rgb("#ffebee"), border: rgb("#f44336"), icon: "❌"),
  )

  let color = colors.at(type)

  block(
    width: 100%,
    fill: color.bg,
    inset: 1em,
    radius: 4pt,
    stroke: 1.5pt + color.border,
    breakable: true,
  )[
    #text(size: 14pt)[#color.icon]
    #text(size: 11pt, weight: "bold")[#title]
    #v(0.4em)
    #content
  ]
  v(0.6em)
}

// ============================================================================
// 5. 表格样式
// ============================================================================

#let styled-table(
  columns: (),
  headers: (),
  rows: (),
  caption: none,
) = {
  set table(
    stroke: (x, y) => if y == 0 {
      (bottom: 1.5pt + rgb("#2c5aa0"))
    } else {
      (bottom: 0.5pt + rgb("#e0e0e0"))
    },
    fill: (x, y) => if y == 0 {
      rgb("#e8f4f8")
    } else if calc.rem(y, 2) == 0 {
      rgb("#f9f9f9")
    } else {
      white
    },
    inset: 8pt,
  )

  show table.cell.where(y: 0): strong

  figure(
    table(
      columns: columns,
      ..headers,
      ..rows.flatten(),
    ),
    caption: caption,
  )
  v(0.8em)
}

// ============================================================================
// 6. 代码场景块
// ============================================================================

#let code-scenario(
  title: "",
  description: "",
  code,
) = {
  v(0.5em)

  text(size: 11pt, weight: "bold", fill: rgb("#2c5aa0"))[
    #title
  ]

  v(0.3em)

  if description != "" [
    text(size: 10pt, fill: rgb("#666666"))[#description]
    v(0.4em)
  ]

  code

  v(1em)
}

// ============================================================================
// 7. 最佳实践块
// ============================================================================

#let best-practice(
  good: none,
  bad: none,
  explanation: "",
) = {
  block(
    width: 100%,
    fill: rgb("#f8f9fa"),
    inset: 1em,
    radius: 4pt,
    stroke: 1pt + rgb("#dee2e6"),
  )[
    #grid(
      columns: if bad != none { (1fr, 1fr) } else { 1fr },
      column-gutter: 1em,

      if bad != none [
        #text(size: 10pt, fill: rgb("#dc3545"))[❌ *不推荐*]
        #bad
      ],

      if good != none [
        #text(size: 10pt, fill: rgb("#28a745"))[✅ *推荐*]
        #good
      ],
    )

    #if explanation != "" [
      #v(0.6em)
      #line(length: 100%, stroke: 0.5pt + rgb("#dee2e6"))
      #text(size: 9.5pt, fill: rgb("#666666"))[#explanation]
    ]
  ]
  v(0.6em)
}
