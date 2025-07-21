class classroom{
    constructor(name,sub){
        this.name=name
        this.sub=sub
    }
    
}
class student extends classroom{
    study(){
        console.log(`Hello, I'm ${this.name} and i study ${this.sub}`)
    }
}
class teacher extends classroom{
    teach(){
        console.log(`Hello, I'm ${this.name} and i Teach ${this.sub}`)
    }
}
const obj = new student("rahul","Maths" )
const obj2 = new teacher("rahul","Maths" )
obj.study()
obj2.teach()
