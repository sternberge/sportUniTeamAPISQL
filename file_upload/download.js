const makeDir = require('make-dir');
const formidable = require('formidable');
var multer  = require('multer');
const expressUpload = require('express-fileupload')
var fs = require('fs');



const download = (req,res) => {
  let id = 4;
  let type = "colleges"
  let pictureFolder = "public/uploaded_files";
  pictureFolder = pictureFolder + "/" + type + "/" + id + "/test.pdf" ;

  res.download(pictureFolder);

}


module.exports = {
  download
};
