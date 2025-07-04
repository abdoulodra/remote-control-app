import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event)
  } catch (e) {
    return new Response('Not found', { status: 404 })
  }
}
// functions/api.js
export async function onRequest(context) {
  return new Response("Hello from API!", {
    headers: { "Content-Type": "text/plain" },
  });
}
