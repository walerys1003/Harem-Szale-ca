const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://sagaturecka.pages.dev/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const wrap = await page.$('.dramatis-track-wrap');
  await wrap.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const box = await wrap.boundingBox();
  const cx = box.x + box.width/2, cy = box.y + box.height/2;
  await page.mouse.move(cx, cy);
  await page.waitForTimeout(200);

  const before = await page.evaluate(() => document.querySelector('.dramatis-track-wrap').scrollLeft);
  console.log('BEFORE single wheel tick:', before);

  // Single realistic wheel tick (typowy delta z myszki to ~100-120, z trackpada moze byc mniejszy)
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(600); // czekaj na smooth snap żeby zobaczyć finalną pozycję

  const after = await page.evaluate(() => document.querySelector('.dramatis-track-wrap').scrollLeft);
  console.log('AFTER single wheel(0,100):', after);
  const counter = await page.evaluate(() => document.querySelector('#dramatisCurrent')?.textContent);
  console.log('licznik po JEDNYM ruchu:', counter);

  await browser.close();
})();
