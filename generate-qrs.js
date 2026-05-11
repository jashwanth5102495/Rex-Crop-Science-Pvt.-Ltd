import { PRODUCTS } from './src/productsData.js';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://rex-crop-science-pvt-ltd.vercel.app/';
const qrDir = path.join(__dirname, 'qr');

if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

console.log(`Generating QR codes for ${PRODUCTS.length} products...\n`);

for (const product of PRODUCTS) {
  const url = `${DOMAIN}${encodeURIComponent(product.brand)}`;
  const fileName = `${product.brand.replace(/[()/\\:?%*|"<>]/g, '-')}.pdf`;
  const filePath = path.join(qrDir, fileName);

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc
      .fontSize(24)
      .text('Rex Crop Science Pvt. Ltd.', { align: 'center' })
      .moveDown();

    doc
      .fontSize(18)
      .text(product.displayName, { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text('Scan QR code to view product details', { align: 'center' })
      .moveDown(2);

    const qrX = (doc.page.width - 300) / 2;
    doc.image(qrDataUrl, qrX, doc.y, { width: 300 });

    doc.moveDown(3);
    doc
      .fontSize(10)
      .text(url, { align: 'center', link: url });

    doc.end();

    await new Promise((resolve) => writeStream.on('finish', resolve));

    console.log(`✅ Generated: ${fileName}`);
    console.log(`   URL: ${url}\n`);
  } catch (err) {
    console.error(`❌ Failed to generate ${fileName}:`, err);
  }
}

console.log('\n✨ All QR codes generated successfully!');
