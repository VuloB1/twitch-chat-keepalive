(() => {
  const PING_EVERY_MS = 20000;   // PING al IRC de Twitch cada 20 s
  const DEAD_AFTER_MS = 50000;   // sin ningún dato entrante en este tiempo => conexión muerta
  const CHECK_EVERY_MS = 5000;
  const TARGET = /irc-ws(\.chat)?\.twitch\.tv/;

  const NativeWS = window.WebSocket;
  if (NativeWS.__tckPatched) return;

  function PatchedWebSocket(url, protocols) {
    const ws = protocols === undefined ? new NativeWS(url) : new NativeWS(url, protocols);
    if (!TARGET.test(String(url))) return ws;

    let lastRx = Date.now();
    let timer = null;

    ws.addEventListener("message", () => { lastRx = Date.now(); });
    ws.addEventListener("open", () => {
      lastRx = Date.now();
      let lastPing = 0;
      timer = setInterval(() => {
        if (ws.readyState !== NativeWS.OPEN) return;
        const now = Date.now();
        if (now - lastRx > DEAD_AFTER_MS) {
          // Conexión muerta en silencio: cerrarla para que Twitch reconecte ya.
          console.warn("[TwitchChatKeepalive] sin datos, forzando reconexión");
          clearInterval(timer);
          try { ws.close(); } catch (e) {}
          // Firefox puede no disparar "close" si el socket está colgado.
          setTimeout(() => ws.dispatchEvent(new CloseEvent("close", { code: 4000, reason: "keepalive timeout" })), 1500);
          return;
        }
        if (now - lastPing >= PING_EVERY_MS) {
          lastPing = now;
          try { NativeWS.prototype.send.call(ws, "PING :tmi.twitch.tv"); } catch (e) {}
        }
      }, CHECK_EVERY_MS);
    });
    ws.addEventListener("close", () => clearInterval(timer));
    ws.addEventListener("error", () => clearInterval(timer));
    return ws;
  }

  PatchedWebSocket.prototype = NativeWS.prototype;
  ["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach((k) => (PatchedWebSocket[k] = NativeWS[k]));
  PatchedWebSocket.__tckPatched = true;
  window.WebSocket = PatchedWebSocket;
})();
