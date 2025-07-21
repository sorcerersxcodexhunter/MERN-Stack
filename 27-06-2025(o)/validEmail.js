const regex = /^\w+@[a-zA-Z_]+\.[a-zA-Z]{2,3}$/
const email = 'dfghj@dfb.com'
let result = regex.test(email)
console.log(result)