/**
 * 2D Vector Implementation
 *
 * @author windlandneko
 */
export default class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  /**
   * Returns a new vector adding another vector or coordinates together.
   *
   * @overload
   * @param {number} x
   * @param {number} y
   *
   * @overload
   * @param {Vec2} vector
   */
  add(x, y) {
    return x instanceof Vec2
      ? new Vec2(this.x + x.x, this.y + x.y)
      : new Vec2(this.x + x, this.y + y)
  }

  /**
   * Modifies this vector by adding another vector or coordinates.
   *
   * @overload
   * @param {number} x
   * @param {number} y
   *
   * @overload
   * @param {Vec2} vector
   */
  addTo(x, y) {
    const result = this.add(x, y)
    this.x = result.x
    this.y = result.y
  }

  /**
   * Returns a new vector subtracting another vector or coordinates together.
   *
   * @overload
   * @param {number} x
   * @param {number} y
   *
   * @overload
   * @param {Vec2} vector
   */
  sub(x, y) {
    return x instanceof Vec2
      ? new Vec2(this.x - x.x, this.y - x.y)
      : new Vec2(this.x - x, this.y - y)
  }

  /**
   * Modifies this vector by subtracting another vector or coordinates.
   *
   * @overload
   * @param {number} x
   * @param {number} y
   *
   * @overload
   * @param {Vec2} vector
   */
  subTo(x, y) {
    const result = this.sub(x, y)
    this.x = result.x
    this.y = result.y
  }

  /**
   * Multiplies this vector by a scalar value and returns a new vector.
   * @param {number} k
   */
  mul(k) {
    return new Vec2(this.x * k, this.y * k)
  }

  /**
   * Returns the length (magnitude) of the vector.
   */
  len() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  /**
   * Returns a new vector with the same direction but a length of 1.
   */
  norm() {
    const n = this.len()
    return n === 0 ? new Vec2() : this.mul(1 / n)
  }

  /**
   * Returns the dot product of this vector and another vector.
   * @param {Vec2} v
   */
  dot(v) {
    return this.x * v.x + this.y * v.y
  }

  /**
   * Rotates this vector by a given angle (in radians) and returns a new vector.
   * @param {number} angle
   */
  rotate(angle) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
  }
}
