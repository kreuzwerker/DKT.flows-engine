export function about() {
  const branch = process.env.GIT_BRANCH || ''
  const hash = process.env.GIT_COMMIT_HASH || ''
  const message = process.env.GIT_COMMIT_MESSAGE || ''

  return { branch, hash, message }
}
