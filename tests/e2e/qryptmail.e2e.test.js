import { test, expect } from '@playwright/test';

test.describe('QryptMail End-to-End Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the front-end login page
    await page.goto('/');
  });

  test('should display the login interface and default configurations', async ({ page }) => {
    // Assert page title or heading exists
    const title = page.locator('p, span, div', { hasText: 'QryptMail.com' }).first();
    await expect(title).toBeVisible();

    // Verify presence of auth buttons
    const googleLoginBtn = page.locator('button', { hasText: 'Google' }).first();
    await expect(googleLoginBtn).toBeVisible();

    const demoBtn = page.locator('button', { hasText: 'Try Demo Inbox' }).first();
    await expect(demoBtn).toBeVisible();
  });

  test('should navigate to Demo Mode and explore dashboard features', async ({ page }) => {
    // Click demo mode button
    const demoBtn = page.locator('button', { hasText: 'Try Demo Inbox' }).first();
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // Verify dashboard displays folder listing
    const inboxFolder = page.locator('.folder-title', { hasText: 'Inbox' }).first();
    await expect(inboxFolder).toBeVisible();

    // Verify inbox contains mock emails
    const figmaMail = page.locator('.email-item', { hasText: 'Figma' }).first();
    await expect(figmaMail).toBeVisible();

    // Click Figma email to load details
    await figmaMail.click();

    // Verify detail panel updates with email body content
    const detailSubject = page.locator('.email-detail-subject').first();
    await expect(detailSubject).toContainText('plugin', { ignoreCase: true });
  });

  test('should open compose modal, toggle CC/BCC inputs, and attach files', async ({ page }) => {
    // Enter Demo Mode
    const demoBtn = page.locator('button', { hasText: 'Try Demo Inbox' }).first();
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // Click Compose button
    const composeBtn = page.locator('button', { hasText: 'Compose' }).first();
    await expect(composeBtn).toBeVisible();
    await composeBtn.click();

    // Verify Compose Modal is open
    const modalTitle = page.locator('span', { hasText: 'New Message' }).first();
    await expect(modalTitle).toBeVisible();

    // Toggle CC/BCC inputs
    const ccBccBtn = page.locator('button', { hasText: 'CC/BCC' }).first();
    await expect(ccBccBtn).toBeVisible();
    await ccBccBtn.click();

    // Verify CC/BCC inputs are now rendered
    const ccInput = page.locator('label', { hasText: 'CC' }).first();
    const bccInput = page.locator('label', { hasText: 'BCC' }).first();
    await expect(ccInput).toBeVisible();
    await expect(bccInput).toBeVisible();

    // Fill fields using exact placeholders
    await page.getByPlaceholder('recipient@example.com', { exact: true }).fill('recipient@test.com');
    await page.getByPlaceholder('cc@example.com', { exact: true }).fill('cc-user@test.com');
    await page.getByPlaceholder('bcc@example.com', { exact: true }).fill('bcc-user@test.com');
    await page.getByPlaceholder('Enter subject line', { exact: true }).fill('E2E Test Subject');
    await page.getByPlaceholder('Type your message here...', { exact: true }).fill('Hello, this is an automated E2E message.');

    // Upload mock file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label', { hasText: 'Attach File' }).first().click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-attachment.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('mock attachment data content')
    });

    // Verify attachment chip is rendered
    const attachmentChip = page.locator('span', { hasText: 'test-attachment.txt' }).or(page.locator('p', { hasText: 'test-attachment.txt' })).first();
    await expect(attachmentChip).toBeVisible();

    // Send the email (scoped inside compose dialog)
    const sendBtn = page.getByRole('dialog').getByRole('button', { name: 'Send', exact: true }).first();
    await sendBtn.click();

    // Verify Modal closes
    await expect(modalTitle).not.toBeVisible();
  });
});
