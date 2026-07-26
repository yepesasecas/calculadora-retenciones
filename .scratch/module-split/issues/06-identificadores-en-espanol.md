# 06 — Identificadores en español; `tramo` sustituye a `leg`

**What to build:** leer el código y leer el glosario pasan a ser la misma
operación. Hoy los identificadores están mezclados —`calcular`, `leerMonto` y
`addOtra` conviven con `deriveProfile`, `readCodes` e `initParty`— y no hay regla
que diga cuál usar. Se unifica en español, con los nombres que `CONTEXT.md` da a
cada término.

Incluye una decisión que **revoca conscientemente** una regla anterior:
`CONTEXT.md` dice hoy `_Avoid_: Tramo (in code)` y ADR-0002 habla de *legs*. A
partir de este ticket el código dice `tramo`. La consecuencia asumida es que el
término del modelo y el rótulo de la pantalla ("Tramo 1 · Cliente final → Matiz")
vuelven a ser la misma palabra, de modo que renombrar el rótulo dejaría de ser una
edición de texto. Eso se registra, no se esconde.

El glosario se actualiza en el mismo cambio, no después: el lema **Leg** pasa a
**Tramo** sin la línea `_Avoid_`, y **Fiscal profile** pasa a **Perfil fiscal**.
ADR-0004 deja constancia de que ADR-0002 queda superado en vocabulario, para que
dentro de seis meses la contradicción entre el ADR y el código tenga explicación.

Los slugs de documentación y de tickets siguen en inglés, según la convención ya
establecida.

**El usuario no debe notar nada:** la instantánea del ticket 04 tiene que salir
idéntica.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] Los identificadores del código usan la ortografía que el glosario da a cada término
- [ ] No quedan identificadores en inglés mezclados con los de dominio
- [ ] El código dice `tramo` donde antes decía `leg`, incluidos nombres de módulos y de campos
- [ ] `CONTEXT.md`: lema **Leg** renombrado a **Tramo**, sin la línea `_Avoid_`
- [ ] `CONTEXT.md`: lema **Fiscal profile** renombrado a **Perfil fiscal**
- [ ] ADR-0004 registra que `tramo` sustituye a `leg` y que ADR-0002 queda superado en vocabulario
- [ ] ADR-0002 no se edita: es un registro histórico
- [ ] Los slugs de `.scratch/` y `docs/` siguen en inglés
- [ ] La instantánea sale idéntica byte a byte, sin regenerarla
- [ ] `npm test` verde
