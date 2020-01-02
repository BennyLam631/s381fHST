const express = require('express');
const app = express();
const fs = require('fs');
const ExifImage = require('exif').ExifImage;
var lat = 0;
var lng = 0;
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })



app.use(express.static('uploads'));
app.set('view engine', 'ejs');
app.get('/', function (req, res) {
			res.redirect('/upload');
});
app.get('/upload', (req,res) => {
			res.render('upload');
});

app.post('/fileupload', upload.single('filetoupload'), function (req, res) {
			if (req.file == null) {
				res.status(404);
				res.render('error', {msg : "No file"});
			} else {

				let buff1 = fs.readFileSync(req.file.path);
				let base64data = buff1.toString('base64');
				let buff2 = new Buffer(base64data, 'base64');

				getinfo(buff2);
				function getinfo(fileName){
				try {
					new ExifImage({ image : fileName }, function (error, exifData) {
					        if (error){
					          console.log('Error: '+error.message);
					        }else{
					          console.log(exifData); // Do something with your data!
										if (exifData.gps != null) {
											getLatLng(exifData);
										}
										let docObj = {
											title : req.body.title,
											description : req.body.description,
											photo : base64data,
											make : exifData.image.Make,
											model : exifData.image.Model,
											modifydate : exifData.image.ModifyDate,
											lat : lat,
											lng : lng
										};
										res.render('fileupload', {
											photoinfo : docObj,
										});
									}
					    });
				} catch (error) {
						    console.log('Error: ' + error.message);
				}
				}

			}
});

app.get('/map/', function (req, res) {
	var lat = req.param('lat');
	var lng = req.param('lng');
	var zoom = req.param('zoom');
	let docObj2 = {
		lat : lat,
		lng : lng,
		zoom : zoom
	};
	res.render('map',{
		coordinate : docObj2,
	});
});


function getLatLng(data){
	lat = ConvertDMSToDD(data.gps.GPSLatitude[0], data.gps.GPSLatitude[1], data.gps.GPSLatitude[2], data.gps.GPSLatitudeRef);
  lng = ConvertDMSToDD(data.gps.GPSLongitude[0], data.gps.GPSLongitude[1], data.gps.GPSLongitude[2], data.gps.GPSLongitudeRef);
}
function ConvertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes/60 + seconds/(60*60);
    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}



app.listen(process.env.PORT || 8099);
