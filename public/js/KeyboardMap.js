class KeyboardMap {
  /**
   * @type {Map<string, *>}
   */
  static map = new Map();

  static init() {
    window.addEventListener('keydown', (event) => {
      this.map.set(event.key, true);
    });

    window.addEventListener('keyup', (event) => {
      this.map.delete(event.key);
    });
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  static isPressed(key) {
    return this.map.get(key) !== undefined;
  }
}

KeyboardMap.init();

export default KeyboardMap;
