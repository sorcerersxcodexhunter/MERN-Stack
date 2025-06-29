function snakeCamel(str){
    words = str.split("_")
    for(let i = 1;i<= words.length-1;i++){
        words[i]=cap(words[i])
        
    }
    return words.join("")
}
function cap(str){
    return str.charAt(0).toUpperCase() + str.slice(1)
}
console.log(snakeCamel("this_is_a_test"))