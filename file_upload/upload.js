const makeDir = require('make-dir');
const mkdir = require('mkdirp');
const formidable = require('formidable');
var multer  = require('multer');
const expressUpload = require('express-fileupload')
var fs = require('fs-extra');


// Set The Storage Engine
const storage = multer.diskStorage({
  destination: "public/uploaded_files/colleges/4",
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
  let id = 6;
  let type = "colleges"
  let pictureFolder = "public/uploaded_files";
  pictureFolder = pictureFolder + "/" + type + "/" + id ;
  console.log(`Test ${pictureFolder}`);
  //makeDir(pictureFolder);
  mkdir(pictureFolder, (error)=>{
    if (error)
      console.error(err);
    else
      console.log('Folder has been created !');
  });


  console.log(req.files);
  // var fstream;
  // req.pipe(req.busboy);
  // req.busboy.on('file', function (fieldname, file, filename) {
  //   console.log("Uploading: " + filename);
  //   fstream = fs.createWriteStream(pictureFolder+"/"+filename);
  //   file.pipe(fstream);
  //   fstream.on('close', function () {
  //     res.send('uploaded');
  //   });
  // });


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


  // upload(req,res,(err) => {
  //   if(err){
  //     res.render('index', {
  //       msg: err
  //     });
  //   } else {
  //     if(req.file == undefined){
  //       res.render('index', {
  //         msg: 'Error: No File Selected!'
  //       });
  //     } else {
  //       res.render('index', {
  //         msg: 'File Uploaded!',
  //         file: `uploads/${req.file.filename}`
  //       });
  //     }
  //   }
  //
  //
}



module.exports = {
  uploadProfilePicture
}
