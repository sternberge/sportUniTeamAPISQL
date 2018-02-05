const makeDir = require('make-dir');
const formidable = require('formidable');
var multer  = require('multer');
const expressUpload = require('express-fileupload')
var fs = require('fs-extra');
var path = require('path');



const download = (req,res) => {
  let id = 6;
  let type = "colleges"
  let pictureFolder = "public/uploaded_files";
  pictureFolder = pictureFolder + "/" + type + "/" + id +"/"+"agile_course.pdf" ;

  //   console.log("Uploading: ");
  //   //tell the browser to download this
  // res.setHeader('Content-disposition', 'attachment; filename=agile_course.pdf');
  //
  //   const fstream = fs.createReadStream(pictureFolder+"/"+"agile_course.pdf");
  //   fstream.pipe(res);

  //read the image using fs and send the image content back in the response
  fs.readFile(pictureFolder, function (err, content) {
    if (err) {
      res.writeHead(400, {'Content-type':'text/html'})
      console.log(err);
      res.end("No such file");
    } else {
      //specify Content will be an attachment
      res.setHeader('Content-disposition', 'attachment; filename=agile_course.pdf');
      res.end(content);
    }
  });

  //
  // fstream.on('end', function () {
  //   return res.ok();
  // });
  // fstream.on('error', function () {
  //   res.status(404).end('Not found');
  // });

}


module.exports = {
  download
};
