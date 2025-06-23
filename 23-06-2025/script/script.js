console.log("----------------------------------------------------")
// 4. Using a do...while loop, print "Welcome!" 5 times.

let count = 0
do{
    console.log("Welcome!")
    count++
}while(count < 5)

    console.log("----------------------------------------------------")
// 5. How can you break out of a loop in JavaScript? Show an example using break.

let num = 10
let arr5 = []
for(let i =0;i<=num;i++){
    if(i>=6)break
    arr5.push(i)
}
console.log(arr5.join(', '))

console.log("----------------------------------------------------")
// 6. What is the use of continue in loops? Write a loop that skips number 5 while printing 1 to 10.
let arr6 =[]
for(let i =1;i<=10;i++){
    if(i==5){continue;}
    else{arr6.push(i);      
    }
}
console.log(arr6.join(', '));

console.log("----------------------------------------------------")
// 7. **Write a nested loop that prints the following pattern:

//  1 1
// 2 2
// 3 3
console.log("----------------------------------------------------")

for(let a = 1;a<=3;a++){
    for(let b = 1;b<=3;b++){
        if(a==b){
            console.log(a+" "+b)
        }
    }
}

console.log("----------------------------------------------------")
// 8. How would you loop through an array and print each element without using forEach? Use a for loop.

let arr = [12,13,14,25,67,90];


for(let i = 0;i<6;i++){
    console.log(arr[i])

}

console.log("----------------------------------------------------")
// 9.What is the difference between == and === in JavaScript? Give examples.

let arra =[4,"4"]
console.log(arra[0]==arra[1])
console.log(arra[0]===arra[1])


console.log("----------------------------------------------------")
// 10.  let x = 5;
// console.log(x++ + ++x);

let  x=5
console.log(x++ + ++x)

console.log("----------------------------------------------------")
// 11.Explain the difference between logical AND (&&) and logical OR (||) with examples.
let c = true
let d = false
console.log(c&&d)
console.log(c||d)

console.log("----------------------------------------------------")
// 12. Write a program to check if a number is divisible by 3 and 5 using operators.

let num3 = 50
if(num3%3 ==0 && num3 % 5 == 0){
    console.log(num3+"divisible by 3 and 5")
}
else{
    console.log("it is not")
}

console.log("----------------------------------------------------")
// 13. Use the ternary operator to check if a number is even or odd.

let num4 = 12903
 const v = num4%2==0 ? "Even":"Odd"
 console.log(v)

 console.log("----------------------------------------------------")
// 14. What does the % (modulus) operator do? Write a program that prints all numbers from 1 to 20 that are divisible by 4.
let arr1=[]
for(let i = 1;i<=20;i++){
    if(i%4==0){
        arr1.push(i)
    }
}
console.log(arr1.join(', '))

console.log("----------------------------------------------------")
// 15. Write a program using if-else to check if a user is eligible to vote (age >= 18).

let obj = {
    name :"rahul",
    age :21


}

    if(obj.age>=18){
        console.log(obj.name+" "+"can vote")
    }
    else{
        console.log(obj.name+"can't vote")
    }
    console.log("----------------------------------------------------")
// 16. Write a program using if-else if-else to print grades based on marks: A (90+), B (75–89), C (50–74), F (below 50).

let mark = 60;
if (mark>=90){
    console.log("Grade:A")
}
else if(75<=mark && mark<=89){
    console.log("Grade:B")

}
else if(50<=mark && mark<=74){
    console.log("Grade:C")

}
else {
    console.log("Grade:F")

}

console.log("----------------------------------------------------")
// 17.Explain the difference between if, else if, and else blocks.
// if:one condition
// else if : more than one condition
// else: two possible outputs
// Even and positive


console.log("----------------------------------------------------")
// 18.Write a program that checks whether a number is positive, negative, or zero.

let num18 = -68
if (num18 >=0){
    console.log("Positive")
}
else if (num18 <=0){
    console.log("Negative")
}
else{
    console.log("Zero")
}
console.log("----------------------------------------------------")
// 19.How would you use nested if statements to check if a number is even and also greater than 10?

let num19 = 80
if(num19%2==0){
    console.log("Even ")
    if(num19>10){
        console.log("Greater than 10 ")

    }
}

// Convert the following if-else code to a ternary operator:

//  let isLoggedIn = true;
// if (isLoggedIn) {
//   console.log("Welcome back!");
// } else {
//   console.log("Please log in.");
// }
let isLoggedIn = false
 isLoggedIn ?console.log("Welcome back!"): console.log("please log in.")
