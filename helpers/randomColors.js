const getRandomNumber = () => {
  const minBrightness = 128; // batas kecerahan minimum (0-255)
  return Math.floor(Math.random() * (256 - minBrightness)) + minBrightness;
};

// Fungsi untuk menghasilkan warna acak dalam format hex
const randomColors = ({
  isBlue = false,
  isYellow = false,
  isRed = false,
  isGrey = false,
}) => {
  // Menghasilkan tiga komponen warna merah, hijau, dan biru secara acak
  //   var red = getRandomNumber().toString(16).padStart(2, "0");
  let red = 0;
  //   let green = getRandomNumber().toString(16).padStart(2, "0");
  let green = 0;
  let blue = getRandomNumber().toString(16).padStart(2, "0");

  // Menggabungkan ketiga komponen warna menjadi format hex
  let color = "#" + red + green + blue;

  if (isGrey) {
    const grey = getRandomNumber().toString(16).padStart(2, "0");
    color = "#" + grey + grey + grey;
  }

  return color;
};
module.exports = randomColors;
