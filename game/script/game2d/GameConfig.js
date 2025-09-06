/**
 * 游戏配置常量
 */
export default {
  // 逻辑帧更新间隔时间（毫秒）
  UPDATE_INTERVAL: 10,

  // 最大时间回溯距离（逻辑帧）
  MAX_TIME_TRAVEL_DISTANCE: 6000,

  // 渲染配置
  GRID_SIZE: 8,
  TILE_SIZE: 8,

  // 调试配置
  SHOW_DEBUG_INFO: true,
  SHOW_VELOCITY_VECTORS: true,
  SHOW_COYOTE_TIME: true,
  SHOW_JUMP_BUFFER: true,

  // UI配置
  DEBUG_FONT_SIZE: 40,
  HELP_FONT_SIZE: 28,
  CAMERA_INFO_FONT_SIZE: 18,
}
