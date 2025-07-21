function validEmail(email){
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log(typeof(pattern))
    return pattern.test(email)
}
const email = "rewe@fgh.com"
console.log(validEmail(email))