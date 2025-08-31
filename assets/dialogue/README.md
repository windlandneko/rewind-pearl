# 对话脚本编写指南

对话脚本采用 JSON 格式编写，描述一段角色对话，可以参考 `test_scene.json` 文件查看对话脚本示例。

## 整体结构

```json
{
    "events": [
        // 事件列表
    ]
}
```

## 交互节点与非交互节点

- **交互节点**：`dialogue`、`wait` - 需要玩家操作，或超过最长等待时间后才会继续
- **非交互节点**：`add`、`remove` - 效果会累积到下一个交互节点时一起执行

## 注意事项

- 每个角色的 `id` 可以随便写，但是在整个脚本中必须唯一
- 使用 `dialogue` 或 `remove` 时必须调用当前在场的角色
- `emotion` 表情名称需要与游戏素材对应
- 对话文本中使用 `\n` 换行
- 注意 JSON 语法要求，如不要出现尾随逗号

## 事件类型

### 1. add - 添加角色

用于在场景中添加新角色。

```json
{
    "type": "add",
    "id": "wy",
    "key": "wangyuan",
    "emotion": "normal",
    "position": "left"
}
```

**参数说明：**

- `type`: "add"
- `id`: 角色的唯一标识符（自定义，用于后续引用）
- `key`: 角色资源名称（需要对应游戏中的角色素材）
- `emotion`: 角色表情（如：normal, smile, angry, sweat, surprise）
- `position`: 角色位置（left：左侧，right：右侧）

### 2. dialogue - 对话

用于显示角色的对话内容。

```json
{
    "type": "dialogue",
    "id": "wy",
    "emotion": "smile",
    "text": "想不想知道我的\n秘密武器？"
}
```

**参数说明：**

- `type`: "dialogue"
- `id`: 说话角色的标识符（必须是已添加的角色）
- `emotion`: 说话时的表情（可选，不填保持表情不变）
- `text`: 对话内容，支持 \n 换行（可选，不填只改变表情）

### 3. remove - 移除角色

用于从场景中移除角色。

```json
{
    "type": "remove",
    "id": "lm"
}
```

**参数说明：**

- `type`: "remove"
- `id`: 要移除的角色标识符

### 4. wait - 等待

用于暂停一段时间，营造戏剧效果。暂停后自动

```json
{
    "type": "wait",
    "duration": 1000
}
```

**参数说明：**

- `type`: "wait"
- `duration`: 等待时间（毫秒，1000 = 1秒）
