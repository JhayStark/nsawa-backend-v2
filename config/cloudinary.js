const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: "jhay",
  api_key: "223114865268436",
  api_secret: "tcZGiPJeRF2YBbb0r4CHlDEaWg4",
});

// Upload

const imageUploader = (imageOfDeceased, funeralName) => {
  const res = cloudinary.uploader.upload(`${imageOfDeceased}`, {
    public_id: `${funeralName}`,
  });

  res
    .then((data) => {
      console.log(data);
      console.log(data.secure_url);
    })
    .catch((err) => {
      console.log(err);
    });

  // Generate
  const url = cloudinary.url(`${funeralName}`, {
    width: 100,
    height: 150,
    Crop: "fill",
  });

  // The output url
  console.log(url);
  return url;
  // https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/olympic_flag
};

module.exports = {
  imageUploader,
};
