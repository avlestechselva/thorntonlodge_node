const RoomDetail = require('../models/RoomDetail');

exports.index = async (req, res) => {
  let room_info = await RoomDetail.findOne();
  if (!room_info) room_info = await RoomDetail.create({ beds: 0, vacancies: 0 });
  res.render('admin/room_info/index', {
    layout: 'layout/admin',
    page_title: 'Room Info - Admin',
    room_info
  });
};

exports.update = async (req, res) => {
  try {
    const { beds, vacancies } = req.body;
    let room_info = await RoomDetail.findOne();
    if (room_info) {
      await RoomDetail.findByIdAndUpdate(room_info._id, { beds, vacancies });
    } else {
      await RoomDetail.create({ beds, vacancies });
    }
    res.redirect('/admin/room-info?success=Room info updated successfully');
  } catch (err) {
    res.redirect('/admin/room-info?error=Update failed');
  }
};
