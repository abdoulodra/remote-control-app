// Simple stockage en mémoire (réinitialisé à chaque déploiement/restart)
let lastCommand = null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // à restreindre en prod !
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Gestion CORS préflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (url.pathname === "/api/command" && request.method === "POST") {
    // Réception commande de l’admin
    try {
      const data = await request.json();
      const cmd = data.command;

      if (!cmd) {
        return new Response("Commande manquante", { status: 400, headers: corsHeaders });
      }

      // Sauvegarde la dernière commande
      lastCommand = cmd;
      console.log(`Commande reçue : ${cmd}`);

      return new Response(`Commande '${cmd}' enregistrée`, { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response("JSON invalide", { status: 400, headers: corsHeaders });
    }
  }

  if (url.pathname === "/api/get-command" && request.method === "GET") {
    // Téléphone distant récupère la dernière commande
    if (!lastCommand) {
      return new Response("Aucune commande", { status: 204, headers: corsHeaders }); // No content
    }
    // On renvoie la commande puis on reset
    const cmdToSend = lastCommand;
    lastCommand = null;

    return new Response(JSON.stringify({ command: cmdToSend }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
}
