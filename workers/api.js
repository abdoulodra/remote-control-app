let accessGranted = false;

export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/control") {
      const data = await req.json();
      accessGranted = data.access;
      return new Response("OK");
    }

    if (req.method === "POST" && url.pathname === "/api/command") {
      if (!accessGranted) {
        return new Response("Refusé : l'utilisateur n’a pas donné son accord", { status: 403 });
      }
      const { command } = await req.json();
      console.log(`Commande reçue : ${command}`);
      return new Response("Commande exécutée");
    }

    return new Response("404 Not Found", { status: 404 });
  }
};