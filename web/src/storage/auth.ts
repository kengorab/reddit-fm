const KEY_NAME = 'rfmuid'

export function isLoggedIn() {
  return !!localStorage.getItem(KEY_NAME)
}

export function setUserId(userId: string) {
  localStorage.setItem(KEY_NAME, userId)
}

export function logOut() {
  localStorage.removeItem(KEY_NAME)
}
