const SiteSetting = require('../models/SiteSetting');
const { uploadPdf } = require('../config/cloudinary');

exports.index = async (req, res) => {
  const settings = await SiteSetting.find();
  const menuSetting = settings.find(s => s.key === 'menu_pdf_path');
  res.render('admin/site_settings/index', {
    layout: 'layout/admin',
    page_title: 'Site Settings - Admin',
    settings,
    menu_pdf_path: menuSetting ? menuSetting.value : null
  });
};

exports.updateMenuPdf = [uploadPdf.single('menu_pdf'), async (req, res) => {
  try {
    if (!req.file) return res.redirect('/admin/site-settings?error=No file uploaded');
    const pdfUrl = req.file.path;
    await SiteSetting.findOneAndUpdate(
      { key: 'menu_pdf_path' },
      { key: 'menu_pdf_path', value: pdfUrl },
      { upsert: true, new: true }
    );
    res.redirect('/admin/site-settings?success=Menu PDF updated successfully');
  } catch (err) {
    res.redirect('/admin/site-settings?error=' + encodeURIComponent(err.message));
  }
}];
