
Array.prototype.customMap = function(callback){
    let result = [];
    for(let i = 0;i< this.length;i++){
        result.push(callback(this[i],i,this))
    }
    return result;
};
const arr = [1,2,3];
console.log(arr.customMap(x=>x*2))