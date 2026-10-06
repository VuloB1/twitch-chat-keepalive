// Inyecta inject.js en el contexto de la página antes de que Twitch cree su WebSocket.
const s = document.createElement("script");
s.src = browser.runtime.getURL("inject.js");
s.onload = () => s.remove();
(document.head || document.documentElement).appendChild(s);
