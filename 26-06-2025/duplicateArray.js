function duplicate(arr){
    let newarr = []
    for(let i of arr){
        if(newarr.includes(i)){
            continue
        }
        else{
            newarr.push(i)
        }
    }
    return newarr
}
let arr = [1,2,2,2,2,3,3]
console.log(duplicate(arr))