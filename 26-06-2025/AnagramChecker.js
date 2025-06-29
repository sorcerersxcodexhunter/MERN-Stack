function anagram(str1,str2){
    str1=str1.toLocaleLowerCase()
    str2=str2.toLocaleLowerCase()

    let arr1 = str1.split('').sort().join('')
    let arr2 = str2.split('').sort().join('')
    if(arr1===arr2){
        console.log("true")
    }
    else{
        console.log("false")

    }
}
let [str1,str2] = ["hello","olleh"]
anagram(str1,str2)