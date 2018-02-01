const makeDir = require('make-dir');
const formidable = require('formidable');
var multer  = require('multer');
const expressUpload = require('express-fileupload')

// Set The Storage Engine
const storage = multer.diskStorage({
destination: "uploaded_files/colleges/4",
filename: function(req, file, callback){
  callback(null,"test");
}
});

// Init Upload
const upload = multer({
storage: storage,
limits:{fileSize: 1000000}
}).single('sampleFile');// nom dans le formulaire


const uploadProfilePicture = (req,res) => {
  let id = 7;
  let type = "colleges"
  let pictureFolder = "uploaded_files";
  pictureFolder = pictureFolder + "/" + type + "/" + id;
  console.log(pictureFolder);
  //makeDir(pictureFolder);

  console.log(req.files);
  upload(req,res,(err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        res.render('index', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
  //
  // if (!req.files)
  //   return res.status(400).send('No files were uploaded.');
  //
  // // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  // let sampleFile = req.files.sampleFile;
  //
  // // Use the mv() method to place the file somewhere on your server
  // sampleFile.mv('/uploaded_files/colleges/4/filename.jpg', function(err) {
  //   if (err)
  //     return res.status(500).send(err);
  //
  //   res.send('File uploaded!');});
  //
  // console.log("File has been created");
}



module.exports = {
  uploadProfilePicture
}
