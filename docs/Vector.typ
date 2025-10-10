// ============================================================================
// Vector.js 模块文档
// rewind-pearl 游戏引擎 - 2D 向量数学库
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "Vector.js 文档",
  subtitle: "2D 向量数学库",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`Vector.js` 提供了 2D 向量的基础数学运算实现，是游戏引擎物理系统和几何计算的基础。该模块实现了向量的加减乘除、归一化、点积、旋转等常用操作，支持链式调用和就地修改两种模式。

== 核心特性

- *基础运算*：加法、减法、标量乘法
- *几何计算*：长度、归一化、点积、旋转
- *灵活调用*：支持向量参数和坐标参数两种重载形式
- *不可变性*：大部分方法返回新向量，保持原向量不变
- *就地修改*：提供 `addTo`/`subTo` 等方法直接修改当前向量

= API 参考

== 构造函数

#api(
  name: "new Vec2(x, y)",
  description: "创建一个新的 2D 向量。",
  parameters: (
    (name: "x", type: "number", optional: true, description: "X 分量（默认 0）"),
    (name: "y", type: "number", optional: true, description: "Y 分量（默认 0）"),
  ),
  returns: (type: "Vec2", description: "新的向量实例"),
  example: ```js
  const v1 = new Vec2(3, 4)
  const v2 = new Vec2()  // (0, 0)
  ```,
)

== 基础运算

#api(
  name: "add(x, y) / add(vector)",
  description: "向量加法，返回新向量。支持向量参数或坐标参数。",
  parameters: (
    (name: "x", type: "number | Vec2", description: "X 分量或向量对象"),
    (name: "y", type: "number", optional: true, description: "Y 分量（仅当第一个参数为数字时）"),
  ),
  returns: (type: "Vec2", description: "新的向量"),
  example: ```js
  const v1 = new Vec2(1, 2)
  const v2 = v1.add(3, 4)      // Vec2(4, 6)
  const v3 = v1.add(new Vec2(5, 6))  // Vec2(6, 8)
  ```,
)

#api(
  name: "addTo(x, y) / addTo(vector)",
  description: "就地向量加法，直接修改当前向量。",
  parameters: (
    (name: "x", type: "number | Vec2", description: "X 分量或向量对象"),
    (name: "y", type: "number", optional: true, description: "Y 分量"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  const v = new Vec2(1, 2)
  v.addTo(3, 4)  // v 现在是 (4, 6)
  ```,
)

#api(
  name: "sub(x, y) / sub(vector)",
  description: "向量减法，返回新向量。",
  parameters: (
    (name: "x", type: "number | Vec2", description: "X 分量或向量对象"),
    (name: "y", type: "number", optional: true, description: "Y 分量"),
  ),
  returns: (type: "Vec2", description: "新的向量"),
  example: ```js
  const v1 = new Vec2(5, 6)
  const v2 = v1.sub(2, 3)  // Vec2(3, 3)
  ```,
)

#api(
  name: "mul(k)",
  description: "标量乘法，返回新向量。",
  parameters: (
    (name: "k", type: "number", description: "标量值"),
  ),
  returns: (type: "Vec2", description: "新的向量"),
  example: ```js
  const v = new Vec2(2, 3).mul(2)  // Vec2(4, 6)
  ```,
)

== 几何运算

#api(
  name: "len()",
  description: "计算向量的长度（模）。",
  parameters: (),
  returns: (type: "number", description: "向量长度"),
  example: ```js
  const v = new Vec2(3, 4)
  console.log(v.len())  // 5
  ```,
)

#api(
  name: "norm()",
  description: "归一化向量，返回相同方向的单位向量。",
  parameters: (),
  returns: (type: "Vec2", description: "单位向量"),
  example: ```js
  const v = new Vec2(3, 4).norm()  // Vec2(0.6, 0.8)
  ```,
  notes: "零向量归一化返回零向量。",
)

#api(
  name: "dot(v)",
  description: "计算与另一个向量的点积。",
  parameters: (
    (name: "v", type: "Vec2", description: "另一个向量"),
  ),
  returns: (type: "number", description: "点积结果"),
  example: ```js
  const v1 = new Vec2(1, 2)
  const v2 = new Vec2(3, 4)
  console.log(v1.dot(v2))  // 11
  ```,
)

#api(
  name: "rotate(angle)",
  description: "旋转向量，返回新向量。",
  parameters: (
    (name: "angle", type: "number", description: "旋转角度（弧度）"),
  ),
  returns: (type: "Vec2", description: "旋转后的向量"),
  example: ```js
  const v = new Vec2(1, 0).rotate(Math.PI / 2)
  // 约为 Vec2(0, 1)
  ```,
)

#api(
  name: "clone()",
  description: "创建向量的副本。",
  parameters: (),
  returns: (type: "Vec2", description: "新的向量实例"),
  example: ```js
  const v1 = new Vec2(3, 4)
  const v2 = v1.clone()
  v2.addTo(1, 1)  // 不影响 v1
  ```,
)

= 使用场景

== 场景 1：玩家移动

```js
class Player {
  update(dt) {
    const velocity = new Vec2(0, 0)

    if (Keyboard.isActive('A')) velocity.addTo(-5, 0)
    if (Keyboard.isActive('D')) velocity.addTo(5, 0)

    this.r.addTo(velocity.mul(dt))
  }
}
```

== 场景 2：碰撞检测

```js
function checkCollision(obj1, obj2) {
  const center1 = obj1.r.add(obj1.width / 2, obj1.height / 2)
  const center2 = obj2.r.add(obj2.width / 2, obj2.height / 2)
  const distance = center1.sub(center2).len()
  return distance < (obj1.radius + obj2.radius)
}
```

== 场景 3：相机跟随

```js
class Camera {
  update(dt) {
    const target = this.#target.r.add(
      this.#target.width / 2,
      this.#target.height / 2
    )
    const delta = target.sub(this.position)
    this.position.addTo(delta.mul(this.#lerpFactor))
  }
}
```

= 技术细节

#info-box(
  type: "info",
)[
  大部分方法返回新向量而不修改原向量。如需就地修改，使用 `addTo`/`subTo` 等方法。
]

#info-box(
  type: "warning",
)[
  对零向量调用 `norm()` 会返回零向量，不会抛出异常。在使用归一化结果前注意检查。
]

Vec2 是一个轻量级的值对象，不依赖其他模块。被以下模块使用：
- `Camera.js`：相机位置和偏移计算
- `Player.js`：玩家位置和速度
- 所有游戏对象：位置属性 `r` 均为 Vec2 类型
