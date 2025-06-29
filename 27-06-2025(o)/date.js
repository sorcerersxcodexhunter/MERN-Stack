const regex = /^(0[1-9]|[12][0-9]|3[0,1])-(0[1-9]|1[0-2])-\d{4}$/
const num = '13-04-9004'
let result = regex.test(num)
console.log(result)
