//lesson 1
const two_digit_simple = (numOfRows) => {
  const problemSetOnes = [];
  const problemSetTens = [];
  const problemSet = [];
  let onesDigit = 0;
  let tensDigit = 0;
  
  const getRandomNonZero = () => {
    let number = 0;
    while (number === 0) {
      number = -Math.floor(Math.random() * 8) || -1;
    }
    return number;
  };
  
  for (let i = 1; i <= numOfRows; i++) {
    let number;
  
    if (i === 1) {
      // Ensure the first number is between 1 and 9
      number = Math.floor(Math.random() * 9) + 1;
    } else {
      number = getRandomNonZero();
    }
  
    onesDigit += number;
    problemSetOnes.push(number);
  }
  
  for (let i = 1; i <= numOfRows; i++) {
    let number;
  
    if (i === 1) {
      // Ensure the first number is between 1 and 9
      number = Math.floor(Math.random() * 9) + 1;
    } else {
      number = getRandomNonZero();
    }
  
    tensDigit += number;
    problemSetTens.push(number * 10);
  }
  
  for (let i = 0; i < numOfRows; i++) {
    const adjustedOnes = problemSetOnes[i] < 0 ? -problemSetOnes[i] : problemSetOnes[i];
    const adjustedTens = problemSetTens[i] < 0 ? -problemSetTens[i] : problemSetTens[i];
  
    problemSet[i] = adjustedTens + adjustedOnes;
  }
  
  console.log("problem set ones: ", problemSetOnes);
  console.log("problem set tens: ", problemSetTens);
  return problemSet;
  

  
};
/*
console.log("two digit simple 1: ", two_digit_simple(4));
console.log("two digit simple 2: ", two_digit_simple(4));
console.log("two digit simple 3: ", two_digit_simple(4));
console.log("two digit simple 4: ", two_digit_simple(4));
*/
//lesson 2
const advance_fifty_first = () => {
  const problemSet = [];

  // Generate the first number between 41 and 49
  const firstNumber = Math.floor(Math.random() * 9) + 41;

  // Generate the second number based on the logic you provided
  let secondNumber;
  switch (firstNumber) {
    case 41:
      secondNumber = 9;
      break;
    case 42:
      secondNumber = Math.floor(Math.random() * 2) + 8;
      break;
    case 43:
      secondNumber = Math.floor(Math.random() * 3) + 7;
      break;
    case 44:
      secondNumber = Math.floor(Math.random() * 4) + 6;
      break;
    case 45:
      secondNumber = 5;
      break;
    case 46:
      secondNumber = Math.random() < 0.5 ? 4 : 9;
      break;
    case 47:
      secondNumber = Math.floor(Math.random() * 3) + 3;
      break;
    case 48:
      secondNumber = Math.floor(Math.random() * 5) + 2;
      break;
    case 49:
      secondNumber = Math.floor(Math.random() * 9) + 1;
      break;
    default:
      break;
  }

  // Add the generated numbers to the problem set
  problemSet.push(firstNumber, secondNumber);

  return problemSet;
}
console.log("1: Lesson 2: ", advance_fifty_first());
console.log("2: Lesson 2: ", advance_fifty_first());
//lesson 3
const advance_fifty_sec = (numOfRows) => {
    
}
//lesson 4
const fifty_back_first = (numOfRows) => {
    
}
//lesson 5
const fifty_back_sec = (numOfRows) => {
    
}
//lesson 6
const advance_hundred_first = (numOfRows) => {
    
}
//lesson 7
const advance_hundred_sec = (numOfRows) => {
    
}
//lesson 8
const hundred_back_first = (numOfRows) => {
    
}
//lesson 9
const hundred_back_sec = (numOfRows) => {
    
}
//lesson 10
const two_hundred_back = (numOfRows) => {
    
}
//lesson 11
const mixed_plus_ones = (numOfRows) => {
    
}
//lesson 12
const mixed_plus_tens = (numOfRows) => {
    
}
//lesson 13
const nine_mixed_plus = (numOfRows) => {
    
}
//lesson 14
const mixed_minus_ones = (numOfRows) => {
    
}
//lesson 15
const mixed_minus_tens = (numOfRows) => {
    
}
//lesson 16
const nine_mixed_minus = (numOfRows) => {
    
}
//lesson 17-20
const nine_mixed = (numOfRows) => {
    
}
//multiplcation
const grade_nine_mult = () => {
   
}
export {two_digit_simple, advance_fifty_first, advance_fifty_sec, fifty_back_first, fifty_back_sec, advance_hundred_first, advance_hundred_sec, hundred_back_first, hundred_back_sec, two_hundred_back, mixed_plus_ones, mixed_plus_tens, nine_mixed_plus, mixed_minus_ones, mixed_minus_tens, nine_mixed_minus, nine_mixed, grade_nine_mult }

