function palindrom(str){
    return str.split('').reverse().join('')
}
let str = "hello"
if(str === palindrom(str)){
    console.log(`${str} is a palindrom`)
}
else{
    console.log(`${str} is not a palindrom`)

}