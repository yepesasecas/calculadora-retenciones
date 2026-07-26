# 02 — `styles.css` extraído y panel de verificación eliminado

**What to build:** `index.html` se convierte en marcado y nada más. La hoja de
estilos sale a su propio archivo y el panel de verificación —el `<details>` que
corre los trece casos en el navegador y se abre solo cuando algo falla—
desaparece de la página junto con las reglas CSS que sólo existían para él.

Eliminar el panel es seguro únicamente porque el ticket 01 ya trasladó esa
cobertura a `npm test`, donde además falla con código de salida en vez de con una
fila roja que hay que ir a mirar.

Con el panel se va también el mensaje de la tolerancia de ±1 peso: ya no hay
tolerancia que explicar.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Los estilos viven en su propio archivo y `index.html` no contiene bloque de estilos
- [ ] El panel de verificación no existe en la página ni en el código que la construye
- [ ] Las reglas CSS que sólo servían al panel están borradas, no huérfanas
- [ ] No queda en la página ninguna mención a la tolerancia de ±1 peso
- [ ] La calculadora se ve y se comporta igual que antes en modo claro y oscuro
- [ ] `npm test` sigue verde
