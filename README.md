## Kepler-www
Este repositorio contiene los recursos web (gamedata) para [Kepler](https://github.com/Quackster/Kepler/), el software de servidor privado de Habbo Hotel.

Estos archivos están pensados para ser servidos a los clientes que se conectan a un servidor Kepler.

## Propósito
Kepler-www proporciona:

* Furnidata
* Figure data
* Archivos de furniture
* Archivos del cliente

Este repositorio replica el comportamiento del hosting tradicional de gamedata o web build que usaba Habbo Hotel, y es esencial para ejecutar un entorno de servidor Kepler completamente funcional.

## Descarga

Puedes descargar el paquete de gamedata más reciente en la página de [Releases](https://github.com/Quackster/Kepler-www/releases).

Cada release incluye un archivo .zip de la versión actual, listo para ser alojado en tu propio servidor web.

## HTML del loader

Aquí tienes el HTML del loader de Kepler (tal como funcionaba con Shockwave):

```php
<?php
$ssoParam = '';
if (isset($_GET['sso'])) {
    $ssoValue = htmlspecialchars($_GET['sso'], ENT_QUOTES, 'UTF-8');
    $ssoParam = "use.sso.ticket=1;sso.ticket={$ssoValue}";
}
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Kepler</title>
</head>
<body bgcolor="black">
    <div align="center">
        <object 
            classid="clsid:166B1BCA-3F9C-11CF-8075-444553540000" 
            codebase="http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=10,8,5,1,0" 
            id="habbo" width="720" height="540">
            
            <param name="src" value="http://localhost/dcr/14.1_b8/habbo.dcr">
            <param name="swRemote" value="swSaveEnabled='true' swVolume='true' swRestart='false' swPausePlay='false' swFastForward='false' swTitle='Habbo Hotel' swContextMenu='true'">
            <param name="swStretchStyle" value="none">
            <param name="swText" value="">
            <param name="bgColor" value="#000000">
            <?php if ($ssoParam): ?>
                <param name="sw6" value="<?= $ssoParam ?>">
            <?php endif; ?>
            <param name="sw2" value="connection.info.host=localhost;connection.info.port=12321">
            <param name="sw4" value="connection.mus.host=localhost;connection.mus.port=12322">
            <param name="sw3" value="client.reload.url=http://localhost/">
            <param name="sw1" value="site.url=http://www.habbo.co.uk;url.prefix=http://www.habbo.co.uk">
            <param name="sw5" value="external.variables.txt=http://localhost/gamedata/external_variables.txt;external.texts.txt=http://localhost/gamedata/external_texts.txt">

            <embed 
                src="http://localhost/dcr/14.1_b8/habbo.dcr" 
                bgColor="#000000" 
                width="720" 
                height="540"
                swRemote="swSaveEnabled='true' swVolume='true' swRestart='false' swPausePlay='false' swFastForward='false' swTitle='Habbo Hotel' swContextMenu='true'"
                swStretchStyle="none" 
                swText=""
                <?php if ($ssoParam): ?>
                sw6="<?= $ssoParam ?>"
                <?php endif; ?>
                sw2="connection.info.host=localhost;connection.info.port=12321"
                sw4="connection.mus.host=localhost;connection.mus.port=12322"
                sw3="client.reload.url=http://localhost/"
                sw1="site.url=http://www.habbo.co.uk;url.prefix=http://www.habbo.co.uk"
                sw5="external.variables.txt=http://localhost/gamedata/external_variables.txt;external.texts.txt=http://localhost/gamedata/external_texts.txt"
                type="application/x-director"
                pluginspage="http://www.macromedia.com/shockwave/download/">
            </embed>
        </object>
    </div>
</body>
</html>
```

## Contribuir

Este repositorio es mayormente estático y se mantiene para cumplir con el formato esperado por Kepler. Se aceptan pull requests para corregir o actualizar archivos de gamedata (por ejemplo, versiones más nuevas o mejoras de compatibilidad).

## Licencia
Este proyecto se ofrece con fines educativos y de desarrollo. Revisa el repositorio principal de Kepler para conocer las licencias y lineamientos de contribución.

## Consideraciones para navegadores modernos

El loader incluido depende de un cliente Shockwave (`.dcr`) y del soporte NPAPI/ActiveX, que los navegadores modernos ya no ofrecen. Para usar el cliente legado sin instalar Shockwave en tu navegador principal:

1. Ejecuta un navegador antiguo en un entorno aislado (máquina virtual o contenedor) y sirve este repositorio (por ejemplo, con `php -S 0.0.0.0:8000 -t .`). Accede al loader desde el navegador legacy.
2. Ajusta los parámetros del loader apuntando a tu backend de Kepler (consulta las claves `connection.info.*` y `external.*` en el HTML de ejemplo).
3. Si necesitas una experiencia sin plugins en navegadores modernos, tendrás que integrar un cliente alternativo (HTML5/WebAssembly) que hable el protocolo de Kepler, ya que este repositorio no incluye un reemplazo para Shockwave.

Consulta `MODERNIZATION.md` para ver un esquema de migración hacia un cliente web moderno y sin plugins.

### Stub web moderno incluido
- `public/modern/index.html` es un punto de partida sin Shockwave que acepta parámetros por query string (`sso`, `ws`, `variables`, `texts`) y muestra la configuración que debe consumir un cliente HTML5/WebAssembly.
- Sustituye la lógica de ejemplo con tu implementación real de red (WebSocket → proxy → Kepler) y renderizado (Canvas/WebGL).
