# 04 — ReteICA responde a un agente municipal, no al código 07

**What to build:** quién puede practicar ReteICA deja de leerse del RUT nacional.

La calidad de agente de retención de ICA **la confiere el municipio por resolución**.
Bogotá designa a entidades públicas, grandes contribuyentes DIAN y **todo el régimen
común de ICA** (Res. DDI-052377/2016, DDI-000305/2020). Consecuencia práctica: un
cliente sin código 07 puede ser perfectamente agente retenedor de ICA, y hoy la
calculadora le dice que no retiene nada.

Dos hechos nuevos por parte, que el usuario declara y la aplicación **no** deriva:

- **agente de ReteICA** — por defecto toma el valor de responsable de IVA (proxy del
  régimen común de ICA), y se puede desmarcar.
- **autorretenedor de ICA** — habilitado por resolución municipal a retenerse a sí
  mismo; nadie le practica ReteICA. Distinto del código 15, que es de renta y que el
  ticket 03 ya desligó del ICA.

Van al lado de los códigos del RUT y **visiblemente separados de ellos**: son
declaraciones del usuario, no derivaciones. El perfil deja de ser función pura de la
casilla 53 y pasa a transportar también lo declarado — es la enmienda de ADR-0001.

Demostrable: desmarcar «agente de ReteICA» en el cliente y ver desaparecer la ReteICA
del tramo 1 con su propia razón, sin que retefuente ni ReteIVA se muevan.

**Blocked by:** 02

**Status:** done

Hecho 2026-07-28. Los hechos declarados entran por un canal propio
(`HECHOS_MUNICIPALES` en `dominio/perfil.js`), que los tickets 07 y 08 amplían sin
tocar la derivación del RUT. Fixture movida: el caso «Agencia sin IVA» declara
`agenteReteICA: true`, porque su Agencia no es responsable de IVA y el valor por
defecto le habría quitado la ReteICA del tramo 2 — que no es de lo que habla ese
caso.

- [x] El perfil de cada parte transporta los dos hechos nuevos
- [x] `agenteReteICA` arranca en el valor de responsable de IVA y se puede desmarcar
- [x] Un retenedor sin código 07 pero agente de ReteICA practica ReteICA y no retefuente
- [x] Un retenido autorretenedor de ICA no recibe ReteICA, y sí las demás
- [x] La UI distingue lo declarado a mano de lo derivado del RUT
- [x] El dominio y los datos no importan de la vista ni del formateador (ADR-0003)
- [x] `npm test` en verde
