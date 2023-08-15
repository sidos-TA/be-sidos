const checkTandaKurung = (str) => {
  const regex = /[()]/;
  return regex.test(str);
};
module.exports = checkTandaKurung;
