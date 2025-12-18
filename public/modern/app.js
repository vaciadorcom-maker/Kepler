const params = new URLSearchParams(window.location.search);

const config = {
  sso: params.get("sso") || "(pendiente)",
  websocket: params.get("ws") || "(definir, ej: wss://tu-dominio/ws)",
  externalVariables:
    params.get("variables") || "/gamedata/external_variables.txt",
  externalTexts: params.get("texts") || "/gamedata/external_texts.txt",
};

const configEl = document.getElementById("configPreview");
const statusEl = document.getElementById("status");
const gamedataStatusEl = document.getElementById("gamedataStatus");
const gamedataPreviewEl = document.getElementById("gamedataPreview");
const wsLogEl = document.getElementById("wsLog");
const connectBtn = document.getElementById("connectBtn");

configEl.textContent = JSON.stringify(config, null, 2);

const missing = Object.entries(config).filter(([_, v]) => v.startsWith("("));
if (missing.length === 0) {
  statusEl.innerHTML =
    "<p>Configuración mínima lista. Implementa la conexión WebSocket y el renderizado aquí.</p>";
} else {
  statusEl.innerHTML =
    "<p>Faltan parámetros clave: " + missing.map(([k]) => k).join(", ") + ".</p>";
}

function appendLog(message) {
  const time = new Date().toISOString();
  wsLogEl.textContent += `[${time}] ${message}\n`;
  wsLogEl.scrollTop = wsLogEl.scrollHeight;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fallo al descargar ${url} (${res.status})`);
  return res.text();
}

function parseKeyValue(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) acc[key.trim()] = rest.join("=").trim();
      return acc;
    }, {});
}

async function loadGamedata() {
  try {
    const [variablesRaw, textsRaw] = await Promise.all([
      fetchText(config.externalVariables),
      fetchText(config.externalTexts),
    ]);
    const variables = parseKeyValue(variablesRaw);
    const texts = parseKeyValue(textsRaw);
    const summary = {
      external_variables_count: Object.keys(variables).length,
      external_texts_count: Object.keys(texts).length,
      connection_host: variables["connection.info.host"] || "(sin definir)",
      connection_port: variables["connection.info.port"] || "(sin definir)",
      mus_host: variables["connection.mus.host"] || "(sin definir)",
      mus_port: variables["connection.mus.port"] || "(sin definir)",
    };
    gamedataStatusEl.textContent = "Gamedata cargada correctamente.";
    gamedataPreviewEl.textContent =
      JSON.stringify(summary, null, 2) +
      "\n\nEjemplos (variables):\n" +
      JSON.stringify(
        Object.fromEntries(Object.entries(variables).slice(0, 8)),
        null,
        2
      );
  } catch (err) {
    gamedataStatusEl.textContent = err.message;
    gamedataPreviewEl.textContent = "";
  }
}

async function testWebSocket() {
  if (!config.websocket || config.websocket.startsWith("(")) {
    appendLog("Configura el parámetro ?ws= para probar la conexión.");
    return;
  }
  connectBtn.disabled = true;
  appendLog(`Abriendo WebSocket hacia ${config.websocket}…`);
  try {
    const ws = new WebSocket(config.websocket);
    ws.addEventListener("open", () => appendLog("Conexión abierta."));
    ws.addEventListener("message", (ev) =>
      appendLog("Mensaje recibido: " + ev.data)
    );
    ws.addEventListener("error", (ev) =>
      appendLog("Error de WebSocket: " + (ev.message || ev.type))
    );
    ws.addEventListener("close", (ev) =>
      appendLog(`Conexión cerrada (code=${ev.code}, reason=${ev.reason})`)
    );
  } catch (err) {
    appendLog("No se pudo abrir el WebSocket: " + err.message);
  } finally {
    connectBtn.disabled = false;
  }
}

connectBtn.addEventListener("click", () => {
  testWebSocket();
});

loadGamedata();
