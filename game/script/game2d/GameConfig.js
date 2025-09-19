// 逻辑帧更新间隔时间（毫秒）
const UPDATE_PER_SECOND = 120
export const UPDATE_INTERVAL = 1000 / UPDATE_PER_SECOND

// 最大时间回溯记录（秒）
export const MAX_SNAPSHOTS_COUNT = UPDATE_PER_SECOND * 60
// 时间回溯充能时间（毫秒）
export const TIME_TRAVEL_CHARGE_TIME = 1 * UPDATE_PER_SECOND

// 渲染配置
export const GRID_SIZE = 8
export const TILE_SIZE = 8

// 动画配置
export const TRANSITION_DURATION = 500 // 切换关卡黑屏时间（毫秒）
export const SPRITE_FRAME_DURATION = 100 // 每帧持续时间（毫秒）

// 调试配置
export const SHOW_DEBUG_INFO = true
export const SHOW_VELOCITY_VECTORS = true
export const SHOW_COYOTE_TIME = true
export const SHOW_JUMP_BUFFER = true

// UI配置
export const DEBUG_FONT_SIZE = 40
export const HELP_FONT_SIZE = 28
export const CAMERA_INFO_FONT_SIZE = 18
