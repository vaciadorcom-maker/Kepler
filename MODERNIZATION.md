## Plan de compatibilidad con navegadores modernos

El loader heredado de Kepler depende de un cliente Shockwave (`.dcr`), que no puede ejecutarse en navegadores actuales porque ya no existe soporte para plugins NPAPI/ActiveX. No hay un emulador drop-in para Shockwave. Para conseguir una experiencia sin plugins, hay que reemplazar el cliente por una implementación en HTML5/WebAssembly que hable el mismo protocolo que el cliente Shockwave.

### Qué hay que reemplazar
- **Runtime del cliente**: Sustituir `dcr/14.1_b8/habbo.dcr` por un cliente web construido en JavaScript/TypeScript (o Rust → WebAssembly).
- **Capa de red**: Implementar la pila de sockets/protocolo que usa el cliente Shockwave para comunicarse con Kepler (protocolo SULake/Habbo sobre TCP, expuesto vía proxy WebSocket).
- **Carga de assets**: Reutilizar los recursos ya existentes en `gamedata/` (figuredata, furnidata, external variables/texts) para contenido y configuración.

### Pasos sugeridos para la migración
1. **Crear un shell de cliente moderno** que se monte en un `<div>` normal (sin `<object>`/`<embed>`). Se puede servir desde `/public` o un nuevo directorio `web-client/`.
2. **Implementar un puente WebSocket** que refleje la conexión TCP que usaba Shockwave (lo habitual: WebSocket → proxy en el servidor → TCP hacia Kepler). Configura los endpoints mediante equivalentes de `external_variables.txt`.
3. **Parsear la gamedata existente** (`gamedata/external_variables.txt`, `gamedata/external_texts.txt`, `gamedata/figuredata.xml`, `gamedata/furnidata.xml`) para alimentar la UI y el renderizado de salas.
4. **Renderizar UI y salas** con un renderer moderno (Canvas/WebGL). Este repo no incluye código de render; tendrás que integrarlo o desarrollarlo.
5. **Autenticar con tickets SSO** conservando el flujo `use.sso.ticket` descrito en el HTML del loader; inyecta el ticket en el arranque del nuevo cliente.

### Loader de reemplazo mínimo (placeholder)
Hasta que exista un cliente completo, sirve un loader placeholder que explique el requisito. Ejemplo:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Kepler Web Client (moderno)</title>
</head>
<body>
  <div id="app">
    <p>El cliente Shockwave no es compatible con navegadores modernos.</p>
    <p>Integra aquí un cliente HTML5/WebAssembly con capacidad WebSocket que hable el protocolo de Kepler.</p>
  </div>
</body>
</html>
```

### Estado actual
Este repositorio **no** incluye un reemplazo para Shockwave. Los pasos anteriores describen la ruta de migración necesaria; completarla requiere construir o integrar un cliente moderno compatible con Habbo/Kepler.

#### Stub incluido
- `public/modern/index.html` es un punto de partida sin dependencias de plugins. Lee parámetros vía query string (`sso`, `ws`, `variables`, `texts`) y muestra la configuración que deberá consumir el futuro cliente HTML5/WebAssembly.
- Sustituye la lógica de ejemplo por tu implementación de red (WebSocket) y renderizado (Canvas/WebGL).

### Checklist mínima para avanzar
- [ ] Implementar proxy WebSocket ↔️ TCP hacia Kepler (por ejemplo, Node/Express + `ws`).
- [ ] Consumir `external_variables.txt` para rellenar endpoints y banderas de cliente.
- [ ] Consumir `external_texts.txt` para localizar la UI.
- [ ] Implementar handshake y mensajes del protocolo SULake/Habbo.
- [ ] Render básico de habitaciones/avatares (Canvas/WebGL) que reutilice `figuredata`/`furnidata`.
- [ ] Autenticación usando ticket SSO (`use.sso.ticket`).

#### Progreso incluido en el stub
- `public/modern/index.html` + `app.js`: lee parámetros `sso`, `ws`, `variables`, `texts`, descarga `external_variables.txt` y `external_texts.txt`, y muestra un resumen de los valores clave (host/puerto).
- Botón “Probar conexión” para abrir un WebSocket con el endpoint configurado (con fines de conectividad básica; no implementa aún el protocolo del cliente).
- Recuerda servirlo por HTTP/HTTPS (no `file://`) para evitar CORS y restricciones de módulos ES.
