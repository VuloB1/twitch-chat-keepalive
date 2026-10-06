# Twitch Chat Keepalive

Firefox extension that stops Twitch chat from freezing and reconnecting when chat activity is low.

> 🇪🇸 [Leer en español](#español)

## The problem

In Firefox and Firefox-based browsers (Waterfox, LibreWolf, etc.), Twitch chat can stop showing new messages for a while and then display "reconnecting". It usually happens in streams with a quiet chat, and the messages that arrive during the gap are lost.

Twitch chat runs over a WebSocket to `wss://irc-ws.chat.twitch.tv`. Firefox can silently drop an idle connection, and Twitch only notices after a long delay. See [Mozilla bug 1604219](https://bugzilla.mozilla.org/show_bug.cgi?id=1604219) and [webcompat/web-bugs#30349](https://github.com/webcompat/web-bugs/issues/30349).

## What it does

- Sends an IRC `PING :tmi.twitch.tv` every **20 seconds**, so the connection never sits idle long enough to be dropped.
- If no data is received for **50 seconds**, it closes the socket so Twitch's own client reconnects immediately instead of after a long freeze.

No settings, no buttons: install it and it works on `twitch.tv`.

It cannot recover messages lost during a past disconnection. It prevents the disconnections.

## How it works

1. `content.js` runs at `document_start` on `*.twitch.tv` and injects `inject.js` into the page context.
2. `inject.js` wraps `window.WebSocket`. Only connections to `irc-ws(.chat).twitch.tv` are touched; every other WebSocket is returned unmodified.
3. The wrapper tracks the last inbound message, sends the keepalive PING and runs the watchdog.

The whole extension is a few dozen lines, with no build step.

## Privacy

No data is collected, stored or sent anywhere. The extension makes no network requests of its own and only talks to the Twitch chat server your browser already connects to. Its only permission is running on `twitch.tv`.

## Install

- **Firefox Add-ons:** link to be added once the listing is approved.
- **Temporary, for testing:** open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…** and select `manifest.json`. It is removed when the browser closes.

Requires Firefox 140+ (Firefox for Android 142+).

## Build

```bash
npx web-ext lint
npx web-ext build
```

## License

[MIT](LICENSE)

---

## Español

Extensión para Firefox que evita que el chat de Twitch se congele y se reconecte cuando hay poca actividad.

### El problema

En Firefox y navegadores basados en él (Waterfox, LibreWolf, etc.), el chat de Twitch puede dejar de mostrar mensajes nuevos y luego "reconectarse". Suele pasar en directos con chat tranquilo, y los mensajes que llegan durante ese hueco se pierden.

El chat usa un WebSocket a `wss://irc-ws.chat.twitch.tv`. Firefox puede cortar en silencio una conexión inactiva y Twitch tarda en darse cuenta.

### Qué hace

- Envía un `PING :tmi.twitch.tv` cada **20 segundos** para que la conexión no quede inactiva.
- Si pasan **50 segundos** sin recibir datos, cierra el socket para que el chat de Twitch se reconecte al instante.

Sin ajustes ni botones: se instala y funciona en `twitch.tv`.

### Privacidad

No recopila ni envía datos. No hace peticiones propias y solo se ejecuta en `twitch.tv`.

### Instalación temporal (pruebas)

Abre `about:debugging#/runtime/this-firefox`, pulsa **Cargar complemento temporal…** y elige `manifest.json`. Se desactiva al cerrar el navegador.

### Licencia

[MIT](LICENSE)
