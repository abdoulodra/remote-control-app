import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  const { pathname } = url

  if (pathname.startsWith("/api/control")) {
    event.respondWith(handleControl(event))
  } else if (pathname.startsWith("/api/upload")) {
    event.respondWith(handleUpload(event))
  } else if (pathname.startsWith("/api/latest")) {
    event.respondWith(handleLatest(event))
  } else {
    event.respondWith(handleEvent(event)) // sert les fichiers HTML via KV
  }
})

// Sert les fichiers HTML/CSS/JS depuis /public
async function handleEvent(event) {
  try {
    return await getAssetFromKV(event)
  } catch (e) {
    return new Response('Not found', { status: 404 })
  }
}

// Autorisation ou refus d'accès
async function handleControl(event) {
  const data = await event.request.json()
  const allowed = data.access === true

  // Enregistre l'état dans la KV
  await UPLOAD_KV.put("access", allowed ? "granted" : "denied")

  return new Response(JSON.stringify({ status: allowed ? "granted" : "denied" }), {
    headers: { "Content-Type": "application/json" }
  })
}

// Réception d'une capture d'écran (Blob JPEG)
async function handleUpload(event) {
  const blob = await event.request.arrayBuffer()
  const base64Image = Buffer.from(blob).toString("base64")
  await UPLOAD_KV.put("latest", base64Image)

  return new Response("Image reçue", { status: 200 })
}

// Récupération de la dernière image pour admin
async function handleLatest(event) {
  const base64Image = await UPLOAD_KV.get("latest")
  if (!base64Image) {
    return new Response("Aucune image reçue", { status: 404 })
  }

  const headers = new Headers()
  headers.set("Content-Type", "image/jpeg")
  return new Response(Buffer.from(base64Image, "base64"), { headers })
}
