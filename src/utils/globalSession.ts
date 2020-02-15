/**
 * 缓存指定的值至localStorage
 */
export const KEYS = {
  /**
   * 获取头部卡片
   */
  get location() { return 'page-location' },

  /**
   * 保存在浏览器缓存中的key (面包屑)
   */
  get bread() { return 'page-breadcrumb' },

  /**
   * 保存在浏览器缓存中的key (token)
   */
  get token() { return 'token' },

  /**
   * 保存在浏览器缓存中的key (权限按钮)
   */
  get buttons() { return 'permission-button' },

}

export function getStorageByKey(key: string) {
  return sessionStorage.getItem(key);
}

/**
 * 将值保存在浏览器缓存中
 * @param key 存储的key
 * @param token 存储的值
 */
export function setToStorageByKey(key: string, token: string) {
  sessionStorage.setItem(key, token || '');
}

/**
 * 清楚所有缓存
 */
export function removeStorages() {
  return sessionStorage.clear()
}

export function removeStorageByKey(key: string) {
  sessionStorage.removeItem(key)
}


// export function getGlobalToken(key: string) {
//   return sessionStorage.getItem(key)
// }

// export function setGlobalToken(key: string, token: string) {
//   return sessionStorage.setItem(key, token)
// }

export function removeGlobalToken(key: string) {
  return sessionStorage.removeItem(key)
}
