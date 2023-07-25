const formatResponseSameKey = ({ arrDatas, propsKey, propsMergeToArray }) => {
  const objAcuan = {};
  for (let i = 0; i < arrDatas?.length; i++) {
    const item = arrDatas[i];
    if (item?.[propsKey] in objAcuan) {
      objAcuan[item?.[propsKey]][propsMergeToArray]?.push(
        item?.[propsMergeToArray]
      );
      // objAcuan[item?.no_bp]["mh"]?.push(item?.mh);
    } else {
      objAcuan[item?.[propsKey]] = item;
      objAcuan[item?.[propsKey]][propsMergeToArray] = [
        item?.[propsMergeToArray],
      ];
      // objAcuan[item?.no_bp]["mh"] = [item?.mh];
    }
  }
  return Object.values(objAcuan);
};

module.exports = formatResponseSameKey;
