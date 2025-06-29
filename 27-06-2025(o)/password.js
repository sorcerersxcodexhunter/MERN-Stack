const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
const num = 'a123v'
let result = num.search(regex)
if(result != -1){
    console.log(" password contains at least one uppercase letter, one lowercase letter, and one number")
}
else{
    console.log("it doesnt")
}
