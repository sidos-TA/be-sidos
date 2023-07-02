const uniqueArrObj = ({arr,props})=> [
    ...new Map(arr.map((item) => [item[props], item])).values(),
];

const uniqueArr = ({arr})=>[...new Set(arr)]

module.exports = {uniqueArrObj,uniqueArr}