import { test, expect } from '@playwright/test';
test('home clears remembered login and expired sessions return to login', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'ancienne-session');
    sessionStorage.setItem('token', 'ancienne-session');
  });
  await page.reload();
  await expect(
    page.getByRole('link', { name: 'Se connecter', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  await page.evaluate(() => {
    sessionStorage.setItem(
      'token',
      'x.' + btoa(JSON.stringify({ exp: 1 })) + '.x',
    );
    sessionStorage.setItem(
      'utilisateur',
      JSON.stringify({ matricule: 'QA00001', role: 'etudiant' }),
    );
  });
  await page.goto('/etudiant/dashboard');
  await expect(page).toHaveURL(/connexion-etudiant\?session=expiree/);
});
test('inactive student session expires even while its token is still valid', async ({
  page,
}) => {
  await page.goto('/connexion-etudiant');
  await page.locator('input[type="text"]').fill('QA00001');
  await page.locator('input[type="password"]').fill('Audit-password-2026');
  await page.getByRole('button', { name: /connecter/i }).click();
  await page.waitForURL('**/etudiant/dashboard');
  await page.evaluate(() =>
    sessionStorage.setItem(
      'derniere_activite',
      String(Date.now() - 31 * 60 * 1000),
    ),
  );
  await page.reload();
  await expect(page).toHaveURL(/connexion-etudiant\?session=expiree/);
  await expect(page.getByRole('status')).toContainText(
    'Votre session a expiré',
  );
  expect(await page.evaluate(() => sessionStorage.getItem('token'))).toBeNull();
});
test('landing page renders after lazy loading without a browser error', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /La Scolarité Numérique/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Navigation principale' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
for (const width of [1440, 390]) {
  for (const role of ['etudiant', 'agent']) {
    test(role + ' routes at width ' + width, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/connexion-' + role);
      await expect(
        page.getByRole('heading', {
          name: role === 'agent' ? 'Connexion agent' : 'Connexion étudiant',
        }),
      ).toBeVisible();
      await expect(
        page.getByRole('navigation', { name: 'Navigation principale' }),
      ).toHaveCount(0);
      await page.screenshot({
        path: '../.qa/connexion-' + role + '-' + width + '.png',
        fullPage: true,
      });
      await page
        .locator('input[type="text"]')
        .fill(role === 'agent' ? 'QAAGENT' : 'QA00001');
      await page.locator('input[type="password"]').fill('Audit-password-2026');
      await page.getByRole('button', { name: /connecter/i }).click();
      await page.waitForURL(
        role === 'agent' ? '**/dashboard' : '**/etudiant/dashboard',
      );
      const paths =
        role === 'agent'
          ? [
              '/dashboard',
              '/admin/referentiel/mentions',
              '/admin/referentiel/parcours',
              '/admin/referentiel/annees',
            ]
          : [
              '/etudiant/dashboard',
              '/profil',
              '/demandes/certificat',
              '/demandes/releve',
              '/demandes/attestation',
              '/demandes/absence',
              '/demandes/reclamation',
            ];
      for (const path of paths) {
        await page.goto(path);
        await expect(page.locator('h1').first()).toBeVisible();
        await expect(
          page.getByRole('navigation', { name: 'Navigation principale' }),
        ).toBeVisible();
        await page.waitForTimeout(200);
        expect(errors, path).toEqual([]);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, path + ' horizontal overflow').toBeLessThanOrEqual(2);
      }
      await page.goto(role === 'agent' ? '/dashboard' : '/etudiant/dashboard');
      await expect(
        page.getByRole('heading', {
          name: role === 'agent' ? 'Centre de traitement' : /Bonjour/,
        }),
      ).toBeVisible();
      if (role === 'agent') {
        const reponseType = page.waitForResponse((response) => {
          const url = new URL(response.url());
          return (
            url.pathname.endsWith('/dashboard/demandes') &&
            url.searchParams.get('type_demande') === 'RECLAMATION'
          );
        });
        await page.getByLabel('Type de demande').selectOption('RECLAMATION');
        const corpsType = await (await reponseType).json();
        expect(corpsType.pagination.total).toBeGreaterThan(0);
        expect(
          corpsType.demandes.every((d) => d.type_demande === 'RECLAMATION'),
        ).toBe(true);
        await expect(page.getByLabel('Type de demande')).toHaveValue(
          'RECLAMATION',
        );
        await expect(page.getByRole('tab', { name: 'Toutes' })).toHaveAttribute(
          'aria-selected',
          'true',
        );
        await page.getByRole('tab', { name: 'Documents livrés' }).click();
        await expect(page.getByLabel('État du dossier')).toHaveValue(
          'DOCUMENT_ENVOYE',
        );
        await page
          .getByRole('button', { name: 'Réinitialiser les filtres' })
          .click();
        await expect(page.getByLabel('Type de demande')).toHaveValue('');
      }
      if (width === 390) {
        await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
        await expect(
          page.getByRole('button', { name: 'Déconnexion' }),
        ).toBeVisible();
        await page.getByRole('button', { name: 'Fermer le menu' }).click();
      }
      await page.screenshot({
        path: '../.qa/' + role + '-' + width + '.png',
        fullPage: true,
      });
    });
  }
}
test('unknown page and corrupt local session recover without crashing', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'invalid');
    localStorage.setItem('utilisateur', '{broken');
  });
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/connexion-agent/);
  await page.goto('/page-inexistante');
  await expect(
    page.getByRole('heading', { name: 'Page introuvable' }),
  ).toBeVisible();
});
