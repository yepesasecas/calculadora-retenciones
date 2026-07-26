# 05 — Razones como datos

**What to build:** el motor deja de escribir español. Hoy, cuando una retención
queda en cero, el dominio construye la frase que verá el usuario
(`"base mínima del concepto: $105.000"`), lo que obliga al motor a conocer el
formato de moneda y obliga a las pruebas a afirmar redacción cuando querían
afirmar aritmética.

A partir de este ticket el motor emite descriptores —el tipo de razón y sus
datos— y la capa de presentación los traduce. Las notas del motor reciben el
mismo tratamiento. El catálogo de tipos es uno solo y lo comparten motor y
traductor, de modo que un tipo nuevo sin traducción sea detectable en vez de
imprimirse vacío.

Del prototipo de la conversación, la forma acordada:

```
{ tipo: "retenidoSimple" }
{ tipo: "baseMinimaConcepto", base: 105000 }
{ tipo: "baseMinimaMunicipal", base: 209496 }
{ tipo: "retenedorNoAgenteRetefuente" }
{ tipo: "retenidoNoResponsableIVA" }
```

**El usuario no debe notar nada.** La traducción reproduce la redacción actual
carácter por carácter, y eso lo prueba la instantánea del ticket 04, que tiene que
salir idéntica.

Se escribe en rojo primero: esto es comportamiento nuevo, no una mudanza.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Las razones de las pruebas se afirman como datos, no como cadenas de texto
- [ ] Ningún módulo de dominio importa el formateador ni construye texto para el usuario
- [ ] El catálogo de tipos de razón es único y compartido entre motor y traductor
- [ ] Un tipo de razón sin traducción es detectable y no se imprime en blanco
- [ ] Las notas del motor también son datos traducidos por la vista
- [ ] La instantánea sale idéntica byte a byte, sin regenerarla
- [ ] Las pruebas nuevas se escribieron en rojo antes de la implementación
- [ ] `npm test` verde
