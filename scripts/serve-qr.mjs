// Build the app, serve the production bundle on the local network, and print a
// QR code of the LAN URL so you can open it on a phone on the same Wi‑Fi.
import { build, preview } from 'vite'
import qrcode from 'qrcode-terminal'

const PORT = Number(process.env.PORT) || 4173

// Vite may list several network interfaces (Wi‑Fi, plus virtual adapters from
// VMs / Docker / WSL). Phones live on the home Wi‑Fi, so prefer 192.168.x, then
// 10.x, and de-prioritise the 172.16–31 range that VM bridges usually grab.
function pickLanUrl(networkUrls) {
  const rank = (url) => {
    const host = new URL(url).hostname
    if (host.startsWith('192.168.')) return 0
    if (host.startsWith('10.')) return 1
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return 2
    return 3
  }
  return [...networkUrls].sort((a, b) => rank(a) - rank(b))[0]
}

async function main() {
  console.log('\n📦  Building production bundle…\n')
  await build()

  const server = await preview({
    preview: { host: true, port: PORT, strictPort: false },
  })

  server.printUrls()

  const urls = server.resolvedUrls ?? { local: [], network: [] }
  const networkUrl = pickLanUrl(urls.network ?? [])
  const localUrl = urls.local?.[0]
  const target = networkUrl ?? localUrl

  if (target) {
    console.log('\n📱  Scan to open on a phone on the same Wi‑Fi:\n')
    qrcode.generate(target, { small: true })
    console.log(`\n    ${target}\n`)
    if (!networkUrl) {
      console.log(
        '    (no LAN address detected — this QR points at localhost and will only\n' +
          '     work on this machine. Connect to a network to expose it to your phone.)\n',
      )
    }
  }

  console.log('Press Ctrl+C to stop the server.\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
