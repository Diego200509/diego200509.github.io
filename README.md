# Distrito Cero

Portafolio bilingüe de Diego Jijón. El barrio se construye con geometría de Three.js e incluye cuatro proyectos, una parada de experiencia en Ambacar y un CV web imprimible.

## Controles

- **WASD** para caminar, arrastrar para mirar y **E** para interactuar.
- **Ctrl + rueda hacia abajo** para pasar a tercera persona, **Ctrl + rueda hacia arriba** para volver. **V** y el botón **Cámara** también alternan la vista.
- En un dispositivo táctil, usa las flechas, arrastra sobre la escena y toca **Cámara** o el botón de acción.
- Pulsa **?** para mostrar u ocultar los controles. En pantallas táctiles se muestran al entrar.

En el mapa, el **Taller de TI** lleva a Ambacar. Abre la puerta, acércate al banco de trabajo y usa la terminal para jugar **Primer día en la agencia**. La misión usa datos ficticios y guarda el avance en el navegador.

## Código

- `content.js` contiene las fichas de proyectos y las traducciones de la interfaz.
- `experience.js` contiene la trayectoria y las habilidades que comparten el sitio y el CV.
- `main.js` conecta la interfaz del portafolio con el juego y guarda el progreso local.
- `game/world.js` coordina el recorrido, los destinos y la misión RGB.
- `game/scene.js`, `game/camera.js` y `game/avatar.js` contienen la construcción del barrio, las vistas y el personaje animado.
- `game/workshop.js` construye el interior de Ambacar y `game/mission.js` define su terminal bilingüe.

## Vista local

En la raíz, ejecuta `python -m http.server 8000 --bind 127.0.0.1` y abre `http://127.0.0.1:8000`. También puedes usar cualquier servidor estático. Three.js 0.180.0 y su licencia están en `vendor/`.

## GitHub Pages

Publica esta carpeta en la raíz de `diego200509.github.io`. En Settings → Pages, elige **Deploy from a branch**, selecciona la rama `main` y la carpeta **/(root)**.

El menú de proyectos y el CV funcionan sin iniciar el 3D.
