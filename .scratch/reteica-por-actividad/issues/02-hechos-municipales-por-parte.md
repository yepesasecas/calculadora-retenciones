# 02 — Hechos municipales por parte: lo que el RUT nacional no dice

**What to build:** tres hechos que gobiernan ReteICA y que **ninguna casilla del RUT
contiene**, porque los confiere el municipio:

- **agente de ReteICA** — quién puede practicarla. Bogotá designa por resolución
  (DDI-052377/2016, DDI-000305/2020) a entidades públicas, grandes contribuyentes
  DIAN y **todo el régimen común de ICA**. Por defecto **encendido** si la parte es
  responsable de IVA (proxy del régimen común), y editable.
- **autorretenedor de ICA** — habilitado por resolución municipal a retenerse a sí
  mismo; nadie le practica ReteICA. Distinto del código 15, que es de renta.
- **declarante de ICA en el municipio** — junto con gran contribuyente (13),
  excluye a la parte de ReteICA (Ac. 65/2002 art. 9 lit. d). La excepción de esa
  norma —que sí se le retiene cuando el retenedor es entidad pública— **no se
  modela**: no existe el tipo de parte «entidad de derecho público». Dejar el TODO
  anotado donde se lea.

Van al lado de los códigos del RUT en la UI, visiblemente separados de ellos: son
declaraciones del usuario, no derivaciones. `dominio/perfil.js` deriva de casilla
53; estos entran por otra puerta y el perfil los transporta.

Ver la enmienda de ADR-0001.

**Status:** ready-for-agent

- [ ] El perfil de cada parte transporta los tres hechos
- [ ] `agenteReteICA` arranca en el valor de `responsableIVA` y se puede desmarcar
- [ ] La UI distingue lo derivado del RUT de lo declarado a mano
- [ ] `dominio/` y `datos/` no importan de `vista/` ni del formateador (ADR-0003)
- [ ] `npm test` en verde
