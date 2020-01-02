const express = require('express');
const app = express();
const fs = require('fs');
const fileUpload = require('express-fileupload');
const ExifImage = require('exif').ExifImage;
var lat = 0;
var lng = 0;
app.use(fileUpload());
app.use(express.static('uploads'));

app.set('view engine', 'ejs');
app.get('/', function (req, res) {
			res.redirect('/upload');
});
app.get('/upload', (req,res) => {
			res.render('upload');
});

app.post('/fileupload', function (req, res) {
			if (!req.files) {
				res.status(404);
				res.render('error', {msg : "No file"});
			} else {
				let filetoupload = req.files.filetoupload;
				uploadPath = __dirname + '/uploads/' + filetoupload.name;
				uploadName = req.files.filetoupload.name;
				filetoupload.mv(uploadPath, function(err) {
				    if (err){
				      console.log("file upload fail")
							res.status(404);
							res.render('error' , {msg : "No file"});
						}
				});
				//call functino to get exif message
				getinfo(uploadName);
				function getinfo(fileName){
				try {
					new ExifImage({ image : __dirname + '/uploads/' + fileName }, function (error, exifData) {
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
											photo : filetoupload.name,
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
