import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'public', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Menjalankan Puppeteer untuk mengambil screenshot demo otomatis...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport ke ukuran desktop (Full HD)
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // 1. Landing Page
    console.log('Mengambil screenshot Landing Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing.png') });

    // 2. Demo Admin Dashboard
    console.log('Mengambil screenshot Demo Admin Dashboard...');
    await page.goto('http://localhost:3000/demo/admin', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000)); // Tunggu animasi recharts
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-dashboard.png') });

    // 3. Demo Teacher Dashboard
    console.log('Mengambil screenshot Demo Teacher Dashboard...');
    await page.goto('http://localhost:3000/demo/teacher', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000)); // Tunggu animasi recharts
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'teacher-dashboard.png') });

    // 4. Demo Student Dashboard
    console.log('Mengambil screenshot Demo Student Dashboard...');
    await page.goto('http://localhost:3000/demo/student', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'student-dashboard.png') });

    console.log('✅ Semua screenshot demo berhasil diambil dan disimpan di folder public/screenshots!');
  } catch (err) {
    console.error('Terjadi kesalahan:', err);
  } finally {
    await browser.close();
  }
}

run();
