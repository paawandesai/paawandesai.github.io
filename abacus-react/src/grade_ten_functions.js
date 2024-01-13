//simple under five
const simpleUnderFive = (numOfRows) => {
  const problemSet = [];
  let sumSoFar = 0;

  for (let i = 0; i < numOfRows; i++) {
    let number;

    if (i === 0) {
      // For the first iteration, generate a random number between 1 and 4
      number = Math.floor(Math.random() * 4) + 1;
    } else {
      // For subsequent iterations, apply the algorithm
      if (sumSoFar === 1) {
        number = [1, 2, 3][Math.floor(Math.random() * 2)];
      } else if (sumSoFar === 2) {
        number = [1, 2, -1][Math.floor(Math.random() * 2)];
      } else if (sumSoFar === 3) {
        number = [1, -1, -2][Math.floor(Math.random() * 2)];
      } else if (sumSoFar === 4) {
        number = [-1, -2, -3][Math.floor(Math.random() * 3)];
      }
    }

    sumSoFar += number;
    problemSet.push(number);
  }

  return problemSet;
};


  //console.log("simple under five(4): ", simpleUnderFive(4));
  //simple under ten
  const simpleUnderTen = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;
  
    for (let i = 1; i <= numOfRows; i++) {
      let number;  
      if (i === 1) {
        number = Math.floor(Math.random() * 8) + 1;
      } else {
        if (sumSoFar === 9) {
          number = -Math.floor(Math.random() * 8) - 1;
        } else if (sumSoFar === 8) {
          number = [1, -1, -2, -3, -5, -6, -7][Math.floor(Math.random() * 7)];
        } else if (sumSoFar === 7) {
          number = [1, 2, -1, -2, -5, -6][Math.floor(Math.random() * 6)];
        } else if (sumSoFar === 6) {
          number = [1, 2, 3, -1, -5][Math.floor(Math.random() * 5)];
        } else if (sumSoFar === 5) {
          number = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
        } else if (sumSoFar === 4) {
          number = [5, -1, -2, -3][Math.floor(Math.random() * 3)];
        } else if (sumSoFar === 3) {
          number = [1, 5, 6, -1, -2][Math.floor(Math.random() * 5)];
        } else if (sumSoFar === 2) {
          number = [1, 2, 5, 6, 7, -1][Math.floor(Math.random() * 6)];
        } else if (sumSoFar === 1) {
          number = [1, 2, 3, 5, 6, 7, 8][Math.floor(Math.random() * 7)];
        }
      }
      sumSoFar += number;
      problemSet.push(number);
    }
    return problemSet;
  };
  //console.log("simple under 10(4): ", simpleUnderTen(4));
  //friends plus
  const friendsPlus = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;
  
    for (let i = 1; i <= numOfRows; i++) {
      let number;
  
      if (i === 1) {
        number = Math.floor(Math.random() * 9) + 1;
      } else {
        if (sumSoFar === 9) {
          number = -randomChoice([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        } else if (sumSoFar === 8) {
          number = randomChoice([1, -2, -3, -5, -6, -7]);
        } else if (sumSoFar === 7) {
          number = randomChoice([1, 2, -5, -6]);
        } else if (sumSoFar === 6) {
          number = randomChoice([1, 2, 3, -5]);
        } else if (sumSoFar < 10) {
          const possibleAdditions = [];
          for (let j = 1; j <= 9 - sumSoFar; j++) {
            possibleAdditions.push(j);
          }
          number = randomChoice(possibleAdditions);
        } else {
          const maxSubtraction = Math.min(Math.abs(sumSoFar), 9);
          number = -Math.floor(Math.random() * maxSubtraction) - 1;
        }
      }
  
      if (Math.abs(sumSoFar + number) <= 10) {
        sumSoFar += number;
        problemSet.push(number);
      }
    }
  
    return problemSet;
  };
  const randomChoice = (choices) => {
    const filteredChoices = choices.filter(choice => choice !== 0); // Exclude 0 from choices
    const index = Math.floor(Math.random() * filteredChoices.length);
    return filteredChoices[index];
  };
  //console.log("friends plus(4): ", friendsPlus(4));
  //friends
  const friends = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;  
    for (let i = 1; i <= numOfRows; i++) {
      let number;
  
      if (i === 1) {
        number = Math.floor(Math.random() * 8) + 1; // Adjusted to exclude 0
      } else {
        if (Math.abs(sumSoFar) === 9) {
          const friendsOptions = [];
          for (let j = 1; j <= 8; j++) {
            friendsOptions.push(-j);
          }
          number = friendsOptions[Math.floor(Math.random() * friendsOptions.length)];
        } else if (Math.abs(sumSoFar) < 10) {
          const possibleAdditions = [];
          for (let k = 1; k <= 10 - Math.abs(sumSoFar); k++) {
            possibleAdditions.push(k);
          }
          number = possibleAdditions[Math.floor(Math.random() * possibleAdditions.length)];
        } else {
          // When the digit sum is 10 or higher, limit the subtraction to keep it below 10
          const maxSubtraction = Math.min(Math.abs(sumSoFar), 9 - sumSoFar);
          number = -Math.floor(Math.random() * maxSubtraction) - 1;
        }
      }
  
      if (Math.abs(sumSoFar + number) < 10) {
        sumSoFar += number;
        problemSet.push(number);
      } else {
        // If adding the number exceeds the limit, generate a new one for the same iteration
        i--;
      }
    }
  
    return problemSet;
  };
  //console.log("friends(4): ", friends(4));
  //relatives plus
  const relativesPlus = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;
  
    for (let i = 1; i <= numOfRows; i++) {
      let number;
  
      if (i === 1) {
        number = Math.floor(Math.random() * 9) + 1;
      } else {
        const remainder = sumSoFar % 10;
        if (remainder === 9) {
          const options = [-1, -2, -3, -4, -5, -6, -7, -8, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 8) {
          const options = [1, 2, 3, 4, 5, 7, 8, 9, -1, -2, -3, -4, -5, -6, -7];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 7) {
          const options = [1, 2, 3, 4, 5, 8, 9, -1, -2, -3, -4, -5, -6];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 6) {
          const options = [1, 2, 3, 4, 5, 9, -1, -2, -3, -4, -5];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 5) {
          const options = [1, 2, 3, 4, 5, -1, -2, -3, -4];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 4) {
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 3) {
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 2) {
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 1) {
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 0) {
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } 
      }
  
      sumSoFar += number;
      problemSet.push(number);
    }
  
    return problemSet;
  };
  //console.log("relatives plus(4): ", relativesPlus(4));
  //RELATIVES
  const relative = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;
  
    for (let i = 1; i <= numOfRows; i++) {
      let number;
      let options;
      if (sumSoFar <= 9) {
        const remainder = sumSoFar % 10;
        if (remainder === 9) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 8) {
          options = [1, 2, 3, 4, 5, 7, 8, 9, -1, -2, -3, -4, -5, -6, -7];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 7) {
          options = [1, 2, 3, 4, 5, 8, 9, -1, -2, -3, -4, -5, -6];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 6) {
          options = [1, 2, 3, 4, 5, 9, -1, -2, -3, -4, -5];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 5) {
          options = [1, 2, 3, 4, 5, 9, -1, -2, -3, -4];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 4) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 3) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 2) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 1) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 0) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        }
      }
      if (sumSoFar >= 10 && sumSoFar < 100) {
        const moddedDigitSum = sumSoFar % 10;
        if (moddedDigitSum === 1) {
          options = [-1, -2, -3, -4, -5, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 2) {
          options = [-1, -2, -3, -4, -5, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 3) {
          options = [-1, -2, -3, -4, -5, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 4) {
          options = [-1, -2, -3, -4, -5, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 5) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 6) {
          options = [-1, -2, -3, -4, -5, 1, 2, 3, 4, 5, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 7) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 8) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 9) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 0) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else {
          const possibleOperations = [];
          for (let j = -9; j <= 9; j++) {
            if (1 <= j + sumSoFar && j + sumSoFar <= 10 && j + sumSoFar >= -10) {
              possibleOperations.push(j);
            }
          }
          number = possibleOperations[Math.floor(Math.random() * possibleOperations.length)];
        }
    }
      sumSoFar += number;
      problemSet.push(number);
    }
  
    return problemSet;
  };
  //console.log("relatives(4): ", relative(4));
  //MIXED PLUS
  const mixedPlus = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;
  
    for (let i = 1; i <= numOfRows; i++) {
      let number;
      let options;
      if (sumSoFar <= 9) {
        const remainder = sumSoFar % 10;
        if (remainder === 9) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 8) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3, -4, -5, -6, -7];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 7) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3, -4, -5, -6];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 6) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3, -4, -5];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 5) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3, -4];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 4) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 3) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 2) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 1) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 0) {
          options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        }
      }
      if (sumSoFar >= 10 && sumSoFar < 100) {
        const moddedDigitSum = sumSoFar % 10;
        if (moddedDigitSum === 1) {
          options = [-1, -2, -3, -4, -5, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 2) {
          options = [-1, -2, -3, -4, -5, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 3) {
          options = [-1, -2, -3, -4, -5, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 4) {
          options = [-1, -2, -3, -4, -5, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 5) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 6) {
          options = [-1, -2, -3, -4, -5, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 7) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 8) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 9) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (moddedDigitSum === 0) {
          options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else {
          const possibleOperations = [];
          for (let j = -9; j <= 9; j++) {
            if (1 <= j + sumSoFar && j + sumSoFar <= 10 && j + sumSoFar >= -10) {
              possibleOperations.push(j);
            }
          }
          number = possibleOperations[Math.floor(Math.random() * possibleOperations.length)];
        }
    }
      sumSoFar += number;
      problemSet.push(number);
    }
  
    return problemSet;
  };
  //console.log("mixed plus(4): ", mixedPlus(4));
  //MIXED
  const mixed = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;
  
    for (let i = 0; i < numOfRows; i++) {
      let number = Math.floor(Math.random() * 18) - 8; // Adjust range to avoid 0
  
      // Ensure that the generated number is not 0
      while (number === 0 || !(number + sumSoFar >= 1)) {
        number = Math.floor(Math.random() * 18) - 8;
      }
  
      sumSoFar += number;
      problemSet.push(number);
    }
  
    return problemSet;
  };
  //console.log("mixed(4): ", mixed(4));
  export { simpleUnderFive, simpleUnderTen, friendsPlus, friends, relativesPlus, relative, mixedPlus, mixed };