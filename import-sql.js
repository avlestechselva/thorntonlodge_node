require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const Category = require('./models/Category');
const GalleryTag = require('./models/GalleryTag');
const Gallery = require('./models/Gallery');
const Post = require('./models/Post');
const Room = require('./models/Room');
const RoomDetail = require('./models/RoomDetail');
const Testimonial = require('./models/Testimonial');
const Staff = require('./models/Staff');
const StaffCategory = require('./models/StaffCategory');

// Parse all rows from a VALUES block string like "(1,'a',NULL),(2,'b','c')"
function parseValuesBlock(block) {
  const rows = [];
  let i = 0;
  const s = block.trim().replace(/;$/, '').trim();

  while (i < s.length) {
    // skip whitespace/commas between rows
    while (i < s.length && (s[i] === ',' || s[i] === '\n' || s[i] === '\r' || s[i] === ' ')) i++;
    if (i >= s.length) break;
    if (s[i] !== '(') { i++; continue; }
    i++; // skip '('
    const row = [];
    while (i < s.length) {
      // skip whitespace
      while (i < s.length && (s[i] === ' ' || s[i] === '\t')) i++;
      if (s[i] === ')') { i++; break; }
      if (s[i] === ',') { i++; continue; }

      if (s[i] === "'") {
        // string value
        i++;
        let val = '';
        while (i < s.length) {
          if (s[i] === '\\') {
            i++;
            const esc = { 'n': '\n', 'r': '\r', 't': '\t', "'": "'", '\\': '\\', '"': '"', '0': '\0' };
            val += esc[s[i]] !== undefined ? esc[s[i]] : s[i];
          } else if (s[i] === "'" && s[i + 1] === "'") {
            val += "'"; i++;
          } else if (s[i] === "'") {
            break;
          } else {
            val += s[i];
          }
          i++;
        }
        i++; // skip closing quote
        row.push(val);
      } else if (s.slice(i, i + 4).toUpperCase() === 'NULL') {
        row.push(null);
        i += 4;
      } else {
        // number
        let num = '';
        while (i < s.length && s[i] !== ',' && s[i] !== ')' && s[i] !== ' ') {
          num += s[i++];
        }
        row.push(num === '' ? null : isNaN(num) ? num : Number(num));
      }
    }
    rows.push(row);
  }
  return rows;
}

// Extract all INSERT blocks from SQL, grouped by table name.
// Uses a character-level state machine to correctly skip ';' inside string literals.
function extractInserts(sql) {
  const result = {};
  const lines = sql.split('\n');
  let currentTable = null;
  let valuesLines = [];
  let collecting = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Detect INSERT INTO line
    const insertMatch = line.match(/^INSERT INTO `(\w+)`/);
    if (insertMatch) {
      currentTable = insertMatch[1];
      valuesLines = [];
      collecting = true;
      // If VALUES is on this same line, just skip the line itself and start collecting next
      // (the actual data rows start on subsequent lines)
      continue;
    }

    if (!collecting || !currentTable) continue;

    // Blank lines or comment lines end the block
    if (line === '' || line.startsWith('--') || line.startsWith('/*')) {
      if (valuesLines.length) {
        if (!result[currentTable]) result[currentTable] = [];
        result[currentTable].push(...parseValuesBlock(valuesLines.join('\n')));
      }
      collecting = false;
      currentTable = null;
      valuesLines = [];
      continue;
    }

    // Check if this line ends the INSERT (ends with ';' outside any string)
    const endsStatement = lineEndsStatement(line);
    valuesLines.push(line);

    if (endsStatement) {
      if (!result[currentTable]) result[currentTable] = [];
      result[currentTable].push(...parseValuesBlock(valuesLines.join('\n')));
      collecting = false;
      currentTable = null;
      valuesLines = [];
    }
  }
  return result;
}

// Returns true if the line ends a SQL statement (trailing ';' that isn't inside a string)
function lineEndsStatement(line) {
  let inString = false;
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === '\\' && inString) { i += 2; continue; }
    if (c === "'") { inString = !inString; }
    i++;
  }
  return !inString && line.trimEnd().endsWith(';');
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const sql = fs.readFileSync('/Users/selvakumarmaheshwarasarma/Downloads/thornton_db (2).sql', 'utf8');
  const data = extractInserts(sql);

  console.log('Tables found:', Object.keys(data).filter(t => t !== 'migrations' && t !== 'password_resets' && t !== 'users').join(', '));

  // ---- 1. Categories ----
  await Category.deleteMany({});
  const categoryIdMap = {};
  for (const [id, parent_id, order, name, slug, created_at, updated_at] of (data.categories || [])) {
    const doc = await Category.create({
      name, slug,
      createdAt: created_at ? new Date(created_at) : undefined,
      updatedAt: updated_at ? new Date(updated_at) : undefined,
    });
    categoryIdMap[id] = doc._id;
  }
  console.log(`Categories: ${Object.keys(categoryIdMap).length}`);

  // ---- 2. Gallery Tags ----
  await GalleryTag.deleteMany({});
  const galleryTagIdMap = {};
  for (const [id, order, title, slug_raw, image, created_at, updated_at] of (data.gallery_tags || [])) {
    const doc = await GalleryTag.create({
      order: order || 1, title,
      slug: slugify(title),
      image: image || null,
      createdAt: created_at ? new Date(created_at) : undefined,
      updatedAt: updated_at ? new Date(updated_at) : undefined,
    });
    galleryTagIdMap[id] = doc._id;
  }
  console.log(`Gallery Tags: ${Object.keys(galleryTagIdMap).length}`);

  // ---- 3. Galleries ----
  await Gallery.deleteMany({});
  let galleryCount = 0;
  for (const [id, tag_id, title, image, created_at, updated_at] of (data.galleries || [])) {
    await Gallery.create({
      tag_id: galleryTagIdMap[tag_id] || null,
      title: title || null,
      image: image ? decodeURIComponent(image) : '',
      createdAt: created_at ? new Date(created_at) : undefined,
      updatedAt: updated_at ? new Date(updated_at) : undefined,
    });
    galleryCount++;
  }
  console.log(`Galleries: ${galleryCount}`);

  // ---- 4. Posts ----
  await Post.deleteMany({});
  let postCount = 0;
  for (const [id, category_id, title, author, seo_title, excerpt, body, image, slug, meta_description, keyword, status, featured, created_at, updated_at] of (data.posts || [])) {
    await Post.create({
      category_id: categoryIdMap[category_id] || null,
      title, author, seo_title, excerpt, body,
      image: image || null, slug,
      meta_description: meta_description || null,
      keyword: keyword || null,
      status: status || 'DRAFT',
      featured: featured === 1,
      createdAt: created_at ? new Date(created_at) : undefined,
      updatedAt: updated_at ? new Date(updated_at) : undefined,
    });
    postCount++;
  }
  console.log(`Posts: ${postCount}`);

  // ---- 5. Rooms ----
  await Room.deleteMany({});
  let roomCount = 0;
  for (const [id, title, slug, excerpt, body, cover_image, seo_title, meta_description, keyword, status, created_at, updated_at] of (data.rooms || [])) {
    await Room.create({
      title, slug,
      excerpt: excerpt || null,
      body: body || null,
      cover_image: cover_image || null,
      seo_title: seo_title || null,
      meta_description: meta_description || null,
      keyword: keyword || null,
      status: status || 'DRAFT',
      createdAt: created_at ? new Date(created_at) : undefined,
      updatedAt: updated_at ? new Date(updated_at) : undefined,
    });
    roomCount++;
  }
  console.log(`Rooms: ${roomCount}`);

  // ---- 6. Room Details ----
  await RoomDetail.deleteMany({});
  for (const [id, beds, vacancies, created_at, updated_at] of (data.room_details || [])) {
    await RoomDetail.create({
      beds, vacancies,
      createdAt: created_at ? new Date(created_at) : undefined,
      updatedAt: updated_at ? new Date(updated_at) : undefined,
    });
  }
  console.log(`Room Details: ${(data.room_details || []).length}`);

  // ---- 7. Testimonials ----
  // SQL only has: id, comment, created_at, updated_at
  await Testimonial.deleteMany({});
  let testimonialCount = 0;
  for (const [id, comment, created_at, updated_at] of (data.testimonials || [])) {
    const nameMatch = comment.match(/[–\-]\s*([A-Z]{1,4})\s*$/);
    const name = nameMatch ? `Resident ${nameMatch[1]}` : `Resident ${id}`;
    await Testimonial.create({
      name, comment, status: 'PUBLISHED',
      createdAt: created_at ? new Date(created_at) : undefined,
      updatedAt: updated_at ? new Date(updated_at) : undefined,
    });
    testimonialCount++;
  }
  console.log(`Testimonials: ${testimonialCount}`);

  // ---- 8. Staff Categories ----
  // SQL has: id, title, created_at, updated_at
  await StaffCategory.deleteMany({});
  const staffCategoryIdMap = {};
  for (const [id, title, created_at, updated_at] of (data.staff_categories || [])) {
    const doc = await StaffCategory.create({
      name: title,
      slug: slugify(title),
      is_active: true,
      order: id,
      createdAt: created_at ? new Date(created_at) : undefined,
      updatedAt: updated_at ? new Date(updated_at) : undefined,
    });
    staffCategoryIdMap[id] = doc._id;
  }
  console.log(`Staff Categories: ${Object.keys(staffCategoryIdMap).length}`);

  // ---- 9. Staffs ----
  // SQL has: id, image, staff_category_id, name, qualification, created_at, updated_at, bio
  await Staff.deleteMany({});
  let staffCount = 0;
  for (const [id, image, staff_category_id, name, qualification, created_at, updated_at, bio] of (data.staffs || [])) {
    await Staff.create({
      category_id: staffCategoryIdMap[staff_category_id] || null,
      name,
      image: image || null,
      qualification: qualification || null,
      bio: bio || null,
      status: 'ACTIVE',
      order: id,
      createdAt: created_at ? new Date(created_at) : undefined,
      updatedAt: updated_at ? new Date(updated_at) : undefined,
    });
    staffCount++;
  }
  console.log(`Staffs: ${staffCount}`);

  console.log('\nImport complete!');
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
