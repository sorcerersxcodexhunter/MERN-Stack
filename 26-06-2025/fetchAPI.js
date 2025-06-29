async function getdata(){
    try{
        const responce = await fetch("https://jsonplaceholder.typicode.com/posts")
        
        const data = await responce.json()
        console.log(data)
    }
    catch(e){
        console.log(e)
    }
}
getdata()