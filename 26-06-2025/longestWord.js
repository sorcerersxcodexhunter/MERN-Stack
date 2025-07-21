function longest(str){
    let words = str.split(" ")
    let longest = ''
    for(let word of words){
        if(longest.length< word.length){
            longest = word
        }
    }
    return longest
}
let str = "hello  how are you?"
console.log(longest(str))