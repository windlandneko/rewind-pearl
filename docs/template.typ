// ============================================================================
// rewind-pearl 项目文档通用模板
// 用于生成统一风格的模块 API 文档
// ============================================================================

/*
使用示例：

#import "template.typ": *

#show: initialize-document

#title-page(
  title: "Module.js",
  subtitle: "模块说明",
  authors: ("作者1", "作者2"),
  date: "2025年10月8日",
)

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

#let initialize-document(
  title: "",
  subtitle: "",
  project: "rewind-pearl",
  authors: (),
  date: datetime.today().display("[year]年[month]月[day]日"),
) = body => {
  set page(
    paper: "a4",
    margin: (left: 1.5cm, right: 1.5cm, top: 2cm, bottom: 2cm),
  )

  set text(
    font: "HarmonyOS Sans SC",
    size: 12pt,
    lang: "zh",
    top-edge: "ascender",
    bottom-edge: "descender",
  )

  set par(
    justify: true,
    leading: 0.4em,
    first-line-indent: 0em,
  )

  set heading(numbering: "1.1")

  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    v(1em)
    block(
      width: 100%,
    )[
      #text(font: ("New Computer Modern", "HarmonyOS Sans SC"), size: 22pt)[#it]
      #v(-0.5em)
      #line(length: 100%, stroke: 1pt + black)
    ]
    v(0.8em)
  }

  show heading.where(level: 2): it => {
    v(-0.2em)
    align(center)[
      #text(size: 15pt, fill: rgb("#2c5aa0"), it.body)
    ]
  }

  show heading.where(level: 3): it => {
    text(size: 12pt, fill: rgb("#4a90e2"), it.body)
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
      text(font: ("JetBrains Mono", "Consolas", "HarmonyOS Sans SC"), size: 9.5pt, fill: rgb("#d73a49"), it),
    )
  }

  align(center)[
    #v(5cm)

    // 标题
    #text(size: 36pt, weight: "bold", fill: rgb("#1a1a1a"))[#title]
    #v(-2em)

    #text(size: 18pt, fill: rgb("#666666"), style: "italic")[#subtitle]

    #v(8cm)

    // 底部信息
    #v(1em)
    #line(length: 50%, stroke: 0.5pt + rgb("#acacac"))
    #v(0.2em)

    #grid(
      columns: (auto, auto),
      column-gutter: 3em,
      [
        #text(size: 11pt, fill: rgb("#999999"))[贡献者]

        #text(size: 13pt, font: ("JetBrains Mono", "Consolas", "HarmonyOS Sans SC"), weight: "bold")[
          #authors.join(" · ")
        ]
      ],
      [
        #text(size: 11pt, fill: rgb("#999999"))[项目]

        #text(size: 13pt, font: ("JetBrains Mono", "Consolas", "HarmonyOS Sans SC"), weight: "bold")[
          #project
        ]
      ],
    )

    #v(1.5em)
    #text(size: 11pt, fill: rgb("#999999"))[
      #if date != none [ 文档生成于#date ]
    ]

    #v(0.2em)
    #line(length: 50%, stroke: 0.5pt + rgb("#acacac"))
  ]

  set page(
    numbering: none,
    header: none,

    footer: [
      #line(length: 100%, stroke: 1pt + black)
      #v(-1em)
      #title
      #h(1fr)
      #context counter(page).display(
        "第1页，共1页",
        both: true,
      )
    ],
  )

  counter(page).update(1)

  pagebreak()

  heading("目录", numbering: none)
  columns(2)[
    #outline(title: none, indent: auto)
  ]

  body
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
  name_as_title: false,
) = {
  block(
    width: 100%,
    fill: rgb("#f9fcff71"),
    inset: 1.2em,
    radius: 6pt,
    stroke: 1pt + rgb("#64a5ea"),
    breakable: true,
  )[
    // 函数名
    #text(size: 13pt, weight: "bold", font: ("JetBrains Mono", "HarmonyOS Sans SC"))[
      #if name_as_title [== #name ] else [#name]
    ]

    // 描述
    #if description != "" [
      #text(size: 11pt, fill: rgb("#333333"))[#description]
    ]

    // 参数列表
    #if parameters.len() > 0 [
      #line(length: 100%, stroke: 1pt + rgb("#cfddec"))
      #v(-0.3em)

      #for param in parameters [
        #box(width: 100%)[
          #h(0.5em)
          #text(font: ("JetBrains Mono", "HarmonyOS Sans SC"), weight: 500)[#param.name]
          #h(0.3em)
          #text(font: ("Fira Code", "HarmonyOS Sans SC"), weight: 300, fill: rgb("#6a737d"))[#param.type
            #if param.at("optional", default: false) [ #text(fill: rgb("#999999"))[(可选)] ]
          ]

          #v(-0.4em)
          #h(2em)
          #text(size: 10pt, fill: rgb("#5c5c5c"))[#param.description]
          #v(0.3em)
        ]
      ]
    ]

    // 返回值
    #if returns != none [
      #h(0.5em)
      #text(font: ("JetBrains Mono", "HarmonyOS Sans SC"), fill: rgb("#0c7fd2"), weight: 500)[返回值]
      #h(0.3em)
      #text(font: ("Fira Code", "HarmonyOS Sans SC"), weight: 300, fill: rgb("#6a737d"))[#returns.type]

      #v(-0.6em)
      #h(2em)
      #text(size: 10pt, fill: rgb("#5c5c5c"))[#returns.description]

      #v(-0.3em)
      #line(length: 100%, stroke: 1pt + rgb("#dee2e6"))
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
        #text(size: 9pt, weight: "bold", fill: rgb("#996600"))[💡 注意]

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
  content,
  title: none,
  type: "info", // info, warning, success, error
) = {
  let colors = (
    tip: (bg: rgb("#f0f8ff"), border: rgb("#91caff"), icon: "💡"),
    info: (bg: rgb("#e7f3ff"), border: rgb("#b9e0ff"), icon: "ℹ️"),
    warning: (bg: rgb("#fff9e6"), border: rgb("#ff9800"), icon: "⚠️"),
    success: (bg: rgb("#e8f5e9"), border: rgb("#4caf50"), icon: "✅"),
    error: (bg: rgb("#ffebee"), border: rgb("#f44336"), icon: "❌"),
  )

  let title = if title != none [#title] else [#(
      tip: "提示",
      info: "信息",
      warning: "警告",
      success: "成功",
      error: "错误",
    ).at(type, default: "信息")
  ]

  let color = colors.at(type, default: colors.info)

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
      (bottom: 0.8pt + rgb("#77777757"))
    } else {
      (bottom: 0.5pt + rgb("#e0e0e0"))
    },
    fill: (x, y) => if y == 0 {
      rgb("#f3f3f3")
    } else if calc.rem(y, 2) == 0 {
      rgb("#fafafa")
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
      #line(length: 100%, stroke: 0.5pt + rgb("#dee2e6"))
      #text(size: 9.5pt, fill: rgb("#666666"))[#explanation]
    ]
  ]
  v(0.6em)
}
