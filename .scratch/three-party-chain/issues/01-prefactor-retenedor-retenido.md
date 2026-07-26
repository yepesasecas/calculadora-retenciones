# 01 — Prefactor: rename calcular() params to retenedor/retenido

**What to build:** The per-leg engine speaks the retired-Vendor/Client vocabulary
of [ADR-0002](../../../docs/adr/0002-three-party-reventa-chain.md). `calcular()`'s two
party params are renamed `cliente`/`vendedor` → **`retenedor`/`retenido`**, with no
behavior change, so the chain work can build on it cleanly. Small blast radius:
`calcular()` and its only caller `runGolden()`.

**Blocked by:** None — can start immediately.

**Status:** done

Done 2026-07-25 — calcular() takes retenedor/retenido; goldens keep their exact estado.

- [x] `calcular()` takes `retenedor`/`retenido`; withholding keys off
      `retenedor.agenteRetefuente` / `retenedor.agenteReteIVA` and
      `retenido.autorretenedor` / `.simple` / `.declarante` / `.responsableIVA` / `.granContribuyente`
- [x] `runGolden()` passes the renamed params
- [x] The 6 golden invoices still pass exactly (no numeric change)
