const obj = {
  a: 2,
  b: { c: 4, d: 5 },
  e: { f: { g: 6 }, h: 3 }
};
function sumEven(obj){
    let sum = 0;
    for(let key in obj){
            let value= obj[key]
            if(typeof value === "number" && value %2 ===0 ){
                sum+=value
            }
            else if(typeof value === 'object' && value!== null){
                sum+= sumEven(value)
            }
    }
    return sum
}
console.log(sumEven(obj))