require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const Gallery = require('./models/Gallery');
const GalleryTag = require('./models/GalleryTag');
const Post = require('./models/Post');
const Room = require('./models/Room');
const Staff = require('./models/Staff');
const SiteSetting = require('./models/SiteSetting');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Build a flat map: basename (lowercased) → full local path
// scanning all provided directories
function buildFileMap(dirs) {
  const map = {};
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const walk = (d) => {
      for (const entry of fs.readdirSync(d)) {
        if (entry.startsWith('.') || entry === '__MACOSX') continue;
        const full = path.join(d, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walk(full);
        } else {
          const key = path.basename(entry).toLowerCase();
          if (!map[key]) map[key] = full; // first found wins
        }
      }
    };
    walk(dir);
  }
  return map;
}

// Upload a local file to Cloudinary under the given folder, using public_id = basename without ext
async function uploadFile(localPath, folder) {
  const basename = path.basename(localPath, path.extname(localPath))
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_'); // Cloudinary safe public_id
  const result = await cloudinary.uploader.upload(localPath, {
    folder,
    public_id: basename,
    overwrite: true,
    resource_type: 'auto',
  });
  return result.secure_url;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // Build lookup map from all image directories (excluding thumbnails)
  const imagesDirs = [
    '/tmp/thornton_uploads/Uploads/gallery_images',
    '/tmp/thornton_uploads/Uploads/gallery_cover_images',
    '/tmp/thornton_uploads/Uploads/post_cover_images',
    '/tmp/thornton_uploads/Uploads/room_cover_images',
    '/tmp/thornton_uploads/Uploads/staff_images',
    '/tmp/thornton_images/images',
    '/tmp/thornton_images/images/slider',
    '/tmp/thornton_images/images/team',
  ];
  const fileMap = buildFileMap(imagesDirs);
  console.log(`Found ${Object.keys(fileMap).length} unique image files\n`);

  // ---- 1. Gallery images ----
  console.log('--- Uploading Gallery images ---');
  const galleries = await Gallery.find({});
  let galleryOk = 0, gallerySkip = 0;
  for (const g of galleries) {
    if (!g.image) { gallerySkip++; continue; }
    const key = path.basename(g.image).toLowerCase();
    const localPath = fileMap[key];
    if (!localPath) {
      console.log(`  SKIP gallery: ${g.image} (file not found)`);
      gallerySkip++;
      continue;
    }
    try {
      const url = await uploadFile(localPath, 'thorntonlodge/gallery');
      await Gallery.findByIdAndUpdate(g._id, { image: url });
      console.log(`  ✓ gallery: ${g.title || g.image}`);
      galleryOk++;
    } catch (e) {
      console.log(`  ERROR gallery ${g.image}: ${e.message}`);
      gallerySkip++;
    }
  }
  console.log(`Galleries: ${galleryOk} uploaded, ${gallerySkip} skipped\n`);

  // ---- 2. Gallery Tag cover images ----
  console.log('--- Uploading Gallery Tag cover images ---');
  const tags = await GalleryTag.find({});
  let tagOk = 0, tagSkip = 0;
  for (const t of tags) {
    if (!t.image) { tagSkip++; continue; }
    const key = path.basename(t.image).toLowerCase();
    const localPath = fileMap[key];
    if (!localPath) {
      console.log(`  SKIP tag: ${t.title} (${t.image} not found)`);
      tagSkip++;
      continue;
    }
    try {
      const url = await uploadFile(localPath, 'thorntonlodge/gallery');
      await GalleryTag.findByIdAndUpdate(t._id, { image: url });
      console.log(`  ✓ tag: ${t.title}`);
      tagOk++;
    } catch (e) {
      console.log(`  ERROR tag ${t.image}: ${e.message}`);
      tagSkip++;
    }
  }
  console.log(`Gallery Tags: ${tagOk} uploaded, ${tagSkip} skipped\n`);

  // ---- 3. Post cover images ----
  console.log('--- Uploading Post cover images ---');
  const posts = await Post.find({});
  let postOk = 0, postSkip = 0;
  for (const p of posts) {
    if (!p.image) { postSkip++; continue; }
    const key = path.basename(p.image).toLowerCase();
    const localPath = fileMap[key];
    if (!localPath) {
      console.log(`  SKIP post: ${p.title} (${p.image} not found)`);
      postSkip++;
      continue;
    }
    try {
      const url = await uploadFile(localPath, 'thorntonlodge/posts');
      await Post.findByIdAndUpdate(p._id, { image: url });
      console.log(`  ✓ post: ${p.title}`);
      postOk++;
    } catch (e) {
      console.log(`  ERROR post ${p.image}: ${e.message}`);
      postSkip++;
    }
  }
  console.log(`Posts: ${postOk} uploaded, ${postSkip} skipped\n`);

  // ---- 4. Room cover images ----
  console.log('--- Uploading Room cover images ---');
  const rooms = await Room.find({});
  let roomOk = 0, roomSkip = 0;
  for (const r of rooms) {
    if (!r.cover_image) { roomSkip++; continue; }
    const key = path.basename(r.cover_image).toLowerCase();
    const localPath = fileMap[key];
    if (!localPath) {
      console.log(`  SKIP room: ${r.title} (${r.cover_image} not found)`);
      roomSkip++;
      continue;
    }
    try {
      const url = await uploadFile(localPath, 'thorntonlodge/rooms');
      await Room.findByIdAndUpdate(r._id, { cover_image: url });
      console.log(`  ✓ room: ${r.title}`);
      roomOk++;
    } catch (e) {
      console.log(`  ERROR room ${r.cover_image}: ${e.message}`);
      roomSkip++;
    }
  }
  console.log(`Rooms: ${roomOk} uploaded, ${roomSkip} skipped\n`);

  // ---- 5. Staff images ----
  console.log('--- Uploading Staff images ---');
  const staffs = await Staff.find({});
  let staffOk = 0, staffSkip = 0;
  for (const s of staffs) {
    if (!s.image) { staffSkip++; continue; }
    const key = path.basename(s.image).toLowerCase();
    const localPath = fileMap[key];
    if (!localPath) {
      console.log(`  SKIP staff: ${s.name} (${s.image} not found)`);
      staffSkip++;
      continue;
    }
    try {
      const url = await uploadFile(localPath, 'thorntonlodge/staff');
      await Staff.findByIdAndUpdate(s._id, { image: url });
      console.log(`  ✓ staff: ${s.name}`);
      staffOk++;
    } catch (e) {
      console.log(`  ERROR staff ${s.image}: ${e.message}`);
      staffSkip++;
    }
  }
  console.log(`Staffs: ${staffOk} uploaded, ${staffSkip} skipped\n`);

  // ---- 6. Menu PDF ----
  console.log('--- Uploading Menu PDF ---');
  const menuPdf = '/tmp/thornton_uploads/Uploads/menu_of_the_year/MenuOfTheYear.pdf';
  if (fs.existsSync(menuPdf)) {
    try {
      const result = await cloudinary.uploader.upload(menuPdf, {
        folder: 'thorntonlodge/menu',
        public_id: 'MenuOfTheYear',
        overwrite: true,
        resource_type: 'raw',
      });
      await SiteSetting.findOneAndUpdate(
        { key: 'menu_pdf_path' },
        { key: 'menu_pdf_path', value: result.secure_url },
        { upsert: true }
      );
      console.log(`  ✓ Menu PDF: ${result.secure_url}\n`);
    } catch (e) {
      console.log(`  ERROR menu PDF: ${e.message}\n`);
    }
  } else {
    console.log('  SKIP: menu PDF not found\n');
  }

  console.log('Upload complete!');
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
