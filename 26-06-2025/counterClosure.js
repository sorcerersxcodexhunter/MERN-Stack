function closure(){
    let count =0
    return function (){
        count++
        return count
    }
}
let obj =  closure()
console.log(obj())
console.log(obj())