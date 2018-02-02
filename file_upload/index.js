const upload = require('./upload.js');
const download = require('./download.js');


module.exports = {
  upload: upload.uploadProfilePicture,
  download: download.download
};
