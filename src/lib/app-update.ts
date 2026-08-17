const BUILD_KEY = '3bro-app-build'

function swUrl() {
  return `${import.meta.env.BASE_URL}sw.js`
}

function versionUrl() {
  return `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`
}

async function checkForNewBuild() {
  try {
    const res = await fetch(versionUrl(), { cache: 'no-store' })
    if (!res.ok) return
    const data = (await res.json()) as { build?: string }
    const build = String(data.build || '')
    if (!build) return
    const prev = localStorage.getItem(BUILD_KEY)
    localStorage.setItem(BUILD_KEY, build)
    if (prev && prev !== build) {
      location.reload()
    }
  } catch {
    // offline — keep the current shell
  }
}

export function registerAppUpdates() {
  checkForNewBuild()

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForNewBuild()
  })
  window.addEventListener('focus', () => checkForNewBuild())

  if (!('serviceWorker' in navigator)) return

  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    location.reload()
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl()).then((reg) => {
      reg.update()
      setInterval(() => reg.update(), 60_000)
    })
  })
}
