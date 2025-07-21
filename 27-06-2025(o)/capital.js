const regex = /\b[A-Z][a-z0-9]*\b/g
const num = 'ycyfugi Hello.com'
let result = num.match(regex)
console.log(result)