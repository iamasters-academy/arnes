# Tests: Landing personal con boton de reserva

**Estado:** approved (Modo Estandar — tests escritos antes del codigo)
**Autor:** test-writer
**Fecha:** 2026-05-20
**Basado en:** spec.md

---

## Inventario

| # | Nombre | Tipo | Fichero |
|---|--------|------|---------|
| TST01 | la pagina muestra el nombre Angel Aparicio | unit (E2E) | `e2e/landing.spec.ts` |
| TST02 | la pagina muestra la frase de descripcion | unit (E2E) | `e2e/landing.spec.ts` |
| TST03 | el boton "Reservar llamada" tiene la URL correcta de Cal.com | unit (E2E) | `e2e/landing.spec.ts` |
| TST04 | el boton se abre en pestanra nueva (target=_blank) | unit (E2E) | `e2e/landing.spec.ts` |
| TST05 | los 3 enlaces de redes sociales son visibles | unit (E2E) | `e2e/landing.spec.ts` |
| TST06 | la pagina es responsive en viewport 375px (movil) | E2E visual | `e2e/landing.spec.ts` |

---

## Cobertura de escenarios

| Escenario (spec.md) | Tests |
|---------------------|-------|
| E1: nombre + descripcion + boton visibles | TST01, TST02 |
| E2: click en reservar abre Cal.com en pestanra nueva | TST03, TST04 |
| E3: enlaces a redes sociales visibles | TST05 |
| E4: se ve bien en movil | TST06 |

---

## Casos raros cubiertos

| Caso raro | Test |
|-----------|------|
| JavaScript desactivado | No automatizable; verificado manualmente |
| Cal.com caido | No automatizable; aceptado para v0.1 |
| URL hardcodeada cambia | El test TST03 verifica la URL actual. Si cambia, el test guia el cambio. |

---

## Codigo de los tests

Estos son los tests reales que se escribieron antes del codigo:

```ts
// e2e/landing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Landing personal', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TST01: muestra el nombre Angel Aparicio', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Angel Aparicio');
  });

  test('TST02: muestra la frase de descripcion', async ({ page }) => {
    await expect(page.getByText(/formador de IA/i)).toBeVisible();
  });

  test('TST03: boton Reservar llamada tiene URL de Cal.com', async ({ page }) => {
    const link = page.getByRole('link', { name: /reservar llamada/i });
    await expect(link).toHaveAttribute(
      'href',
      'https://cal.com/angel-aparicio/llamada-30min'
    );
  });

  test('TST04: boton se abre en pestanra nueva', async ({ page }) => {
    const link = page.getByRole('link', { name: /reservar llamada/i });
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('TST05: 3 enlaces de redes sociales visibles', async ({ page }) => {
    await expect(page.getByRole('link', { name: /linkedin/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /tiktok/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /instagram/i })).toBeVisible();
  });

  test('TST06: se ve bien en movil 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: /reservar/i })).toBeVisible();
  });
});
```

---

## Aprobacion

- [x] Cobertura de todos los escenarios de spec.md.
- [x] Cobertura de casos raros (los automatizables).
- [x] Tests verificados en rojo antes del codigo: si.

**Fecha de aprobacion:** 2026-05-20
