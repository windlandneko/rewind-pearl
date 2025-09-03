# 对话脚本编写指南

对话脚本采用 JSON 格式编写，描述一段角色对话，可以参考 `test_scene.json` 文件查看对话脚本示例。

## 整体结构

```json
{
  "text_style": "modern",
  "auto_next_delay": null,
  "events": [
    // 事件列表
  ]
}
```

**根属性说明：**

- `text_style`: 文本显示样式，可选值："modern"（现代风格）、"touhou"（东方风格）
- `auto_next_delay`: 自动继续下一段对话的延迟时间（毫秒），设置为 `null` 则禁用自动继续
- `events`: 事件数组，按顺序执行

## 交互节点与非交互节点

- **交互节点**：包含 `text` 的对话事件、包含 `wait` 的等待事件 - 需要玩家操作，或超过最长等待时间后才会继续
- **非交互节点**：除了交互节点外的事件 - 效果会立即执行并自动继续到下一个事件

## 注意事项

- 每个角色的 `id` 可以随便写，但是在整个脚本中必须唯一
- 使用对话或 `remove` 时必须调用当前在场的角色
- `emotion` 表情名称需要与游戏素材对应：normal, smile, angry, sweat, surprise, sad
- 对话文本中使用 `\n` 换行
- 对话文本支持样式标记：`$<样式类名>:<文本内容>$`，如 `$wow:颠佬$`
- 注意 JSON 语法要求，如不要出现尾随逗号

## 事件类型

### 1. add - 添加角色

用于在场景中添加新角色。

```json
{
  "action": "add",
  "id": "wy",
  "title": "王源",
  "subtitle": "葬送的芙蓉王",
  "key": "wangyuan",
  "emotion": "normal",
  "position": "left"
}
```

**参数说明：**

- `action`: "add"
- `id`: 角色的唯一标识符（自定义，用于后续引用）
- `title`: 角色名称（显示在对话框中，可选）
- `subtitle`: 角色副标题（显示在对话框中，可选）
- `key`: 角色资源名称（需要对应 `assets/character/` 目录下的文件夹名）
- `emotion`: 角色初始表情（如：normal, smile, angry, sweat, surprise, sad）
- `position`: 角色位置（left：左侧，right：右侧）

### 2. dialogue - 对话

用于显示角色的对话内容。支持以下两种写法：

**简化写法（同一人物多段对话时使用）：**

```json
"Hi 我是$wow:颠佬$"
```

**简化写法（仅包含文本）：**

```json
{
  "id": "wy",
  "text": "想不想知道我的秘密武器？"
}
```

**完整写法：**

```json
{
  "action": "dialogue",
  "id": "wy",
  "title_color": "#ffcc00",
  "title": "王源",
  "subtitle": "葬送的芙蓉王",
  "emotion": "smile",
  "text": "想不想知道我的$wow:秘密武器$？"
}
```

**参数说明：**

- `action`: "dialogue"（可选，不写则默认为对话事件）
- `id`: 说话角色的标识符（必须是已添加的角色）
- `title_color`: 修改角色名称颜色（可选），之后的名称将使用该颜色
- `title`: 修改角色名称（可选），之后的对话将使用该名称
- `subtitle`: 修改角色副标题（可选），之后的对话将使用该副标题
- `emotion`: 说话时的表情（可选，不填保持表情不变）
- `text`: 对话内容，支持 \n 换行和样式标记（可选，设置为 `null` 可清空对话框）
- `wait`: 等待时间（可选，毫秒），会在显示文本后强制等待指定时间并自动继续

### 3. remove - 移除角色

用于从场景中移除角色。

```json
{
  "action": "remove",
  "id": "lm"
}
```

**参数说明：**

- `action`: "remove"
- `id`: 要移除的角色标识符

## 文本样式标记

对话文本支持样式标记，格式为：`$样式类名:文本内容$`

例如：`$wow:颠佬$` 会给"颠佬"这两个字应用 `wow` 样式类。

## 角色表情

可用的角色表情包括：

- `normal`: 普通表情
- `smile`: 微笑
- `angry`: 生气
- `sweat`: 流汗
- `surprise`: 惊讶
- `sad`: 悲伤

## 示例对话脚本

```json
{
  "text_style": "modern",
  "auto_next_delay": null,
  "events": [
    {
      "action": "add",
      "id": "reimu",
      "title": "博丽灵梦",
      "subtitle": "不可思议的巫女",
      "key": "reimu",
      "emotion": "normal",
      "position": "left"
    },
    {
      "id": "reimu",
      "text": "又有新的异变发生了..."
    },
    {
      "id": "reimu",
      "emotion": "surprise",
      "text": "看来我得去调查一下。"
    },
    {
      "action": "remove",
      "id": "reimu"
    }
  ]
}
```
