// @ts-check
import { test, expect } from '@playwright/test';

// Страницы сайта.
const PAGES = [
  { name: 'index', path: '/index.html' },
  { name: 'about', path: '/about.html' },
  { name: 'contact', path: '/contact.html' },
];

// Языки. Переключатель пишет выбор в localStorage['language'],
// скрипт сайта читает его при загрузке.
const LANGUAGES = ['de', 'ru', 'en'];

// Ширины подобраны по брейкпоинтам из css/main.css:
// 1920+, 1440–1919, 1024–1439, 768–1023, 320–767.
const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '800x1024', width: 800, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];

for (const viewport of VIEWPORTS) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const language of LANGUAGES) {
      for (const page_ of PAGES) {
        test(`${page_.name} · ${language}`, async ({ page }) => {
          await page.addInitScript((lang) => {
            window.localStorage.setItem('language', lang);
          }, language);

          await page.goto(page_.path, { waitUntil: 'load' });

          // Шрифты и ленивые картинки должны быть на месте до снимка.
          await page.evaluate(() => document.fonts.ready);
          await page.evaluate(async () => {
            await Promise.all(
              [...document.images]
                .filter((img) => !img.complete)
                .map((img) => new Promise((done) => {
                  img.addEventListener('load', done, { once: true });
                  img.addEventListener('error', done, { once: true });
                })),
            );
          });

          // Показан именно запрошенный язык. Проверяем не видимость, а сам
          // переключатель: на узких экранах шапка спрятана за бургер-меню.
          await expect
            .poll(() => page.evaluate(() => {
              const el = document.querySelector('.header__nav-list-item-lang');
              return el instanceof HTMLSelectElement ? el.value : null;
            }))
            .toBe(language);

          await expect(page).toHaveScreenshot(
            `${page_.name}-${language}-${viewport.name}.png`,
            { fullPage: true },
          );
        });
      }
    }
  });
}
