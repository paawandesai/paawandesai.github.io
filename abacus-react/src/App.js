import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    grade: '10',
    lesson: '1',
    numQuestions: 1,
    numNumbers: 4,
    operation: 'addition',
  });

  const [generatedProblems, setGeneratedProblems] = useState([]);

  const simpleUnderFive = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;

    for (let i = 1; i < numOfRows + 2; i++) {
      let number;

      if (i === 1) {
        number = Math.floor(Math.random() * 4) + 1;
      } else {
        if (sumSoFar === 4) {
          number = Math.floor(Math.random() * Math.min(sumSoFar, 4)) + 1;
          sumSoFar -= number;
          problemSet.push(-number);
        } else {
          if (sumSoFar > 0 && Math.random() < 0.5) {
            number = Math.floor(Math.random() * Math.min(sumSoFar, 4)) + 1;
            sumSoFar -= number;
            problemSet.push(-number);
          } else {
            if (sumSoFar === 1) {
              number = Math.floor(Math.random() * 3) + 1;
            } else if (sumSoFar === 2) {
              number = Math.floor(Math.random() * 2) + 1;
            } else if (sumSoFar === 3) {
              number = 1;
            } else {
              number = Math.floor(Math.random() * 3) + 1;
            }
            sumSoFar += number;
            problemSet.push(number);
          }
        }
      }
    }

    return problemSet;
  };
  const simpleUnderTen = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;

    for (let i = 1; i <= numOfRows; i++) {
      let number;

      if (i === 1) {
        number = Math.floor(Math.random() * 9) + 1;
      } else {
        if (sumSoFar === 9) {
          number = -Math.floor(Math.random() * 9) + 1;
        } else if (sumSoFar === 8) {
          number = [1, -Math.floor(Math.random() * 3) + 1, -Math.floor(Math.random() * 4) + 5][Math.floor(Math.random() * 3)];
        } else if (sumSoFar === 7) {
          number = [1, 2, -1, -2, -Math.floor(Math.random() * 3) + 5][Math.floor(Math.random() * 5)];
        } else if (sumSoFar > 0 && [true, false][Math.floor(Math.random() * 2)]) {
          const maxSubtraction = Math.min(sumSoFar, 9);
          number = -Math.floor(Math.random() * maxSubtraction) + 1;
        } else {
          if (sumSoFar === 1) {
            number = [1, 2, 3, 5, 6, 7, 8][Math.floor(Math.random() * 7)];
          } else if (sumSoFar === 2) {
            number = [1, 2, 5, 6, 7][Math.floor(Math.random() * 5)];
          } else if (sumSoFar === 3) {
            number = [1, 5, 6][Math.floor(Math.random() * 3)];
          } else if (sumSoFar === 4) {
            number = 5;
          } else if (sumSoFar === 5) {
            number = 4;
          } else if (sumSoFar === 6) {
            number = [1, 2, 3][Math.floor(Math.random() * 3)];
          } else {
            number = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
          }
        }
      }

      sumSoFar += number;
      problemSet.push(number);
    }

    return problemSet;
  };
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
          number = randomChoice([1, -2, -3, -5, -6, -7, -8]);
        } else if (sumSoFar === 7) {
          number = randomChoice([1, 2, -5, -6, -7]);
        } else if (sumSoFar === 6) {
          number = randomChoice([1, 2, 3, -5, -6]);
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
    const index = Math.floor(Math.random() * choices.length);
    return choices[index];
  };
  const friends = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;

    for (let i = 1; i <= numOfRows; i++) {
      let number;

      if (i === 1) {
        number = Math.floor(Math.random() * 9) + 1;
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
          const options = [-1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 8) {
          const options = [1, 2, 3, 4, 5, 7, 8, 9, -1, -2, -3, -4, -5, -6, -7, -8];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 7) {
          const options = [1, 2, 3, 4, 5, 8, 9, -1, -2, -3, -4, -5, -6, -7];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 6) {
          const options = [1, 2, 3, 4, 5, 9, -1, -2, -3, -4, -5, -6];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 5) {
          const options = [1, 2, 3, 4, 5, 9, -1, -2, -3, -4, -5];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 4) {
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3, -4];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 3) {
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 2) {
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 1) {
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1];
          number = options[Math.floor(Math.random() * options.length)];
        } else if (remainder === 0) {
          const options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
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
  const relative = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;
  
    for (let i = 0; i < numOfRows; i++) {
      let number;
  
      if (i === 0) {
        number = Math.floor(Math.random() * 9) + 1;
      } else {
        const digitSum = sumSoFar % 10;
  
        if (digitSum === 0 || digitSum === 5) {
          number = Math.floor(Math.random() * 9) + 1;
        } else {
          const friendsPlusMinus = [];
          for (let j = -9; j <= 9; j++) {
            if (1 <= j + sumSoFar && j + sumSoFar <= 10 && j + sumSoFar >= -10) {
              friendsPlusMinus.push(j);
            }
          }
  
          number = friendsPlusMinus[Math.floor(Math.random() * friendsPlusMinus.length)];
  
          while (digitSum > 0 && sumSoFar + number < 1) {
            number = friendsPlusMinus[Math.floor(Math.random() * friendsPlusMinus.length)];
          }
        }
      }
  
      sumSoFar += number;
      problemSet.push(number);
    }
  
    return problemSet;
  };
  const mixedPlus = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;
  
    for (let i = 0; i < numOfRows; i++) {
      let number;
  
      if (i === 0) {
        number = Math.floor(Math.random() * 9) + 1;
      } else {
        const digitSum = sumSoFar % 10;
  
        if (digitSum === 0 || digitSum === 5) {
          number = Math.floor(Math.random() * 9) + 1;
        } else if (digitSum === 1 || digitSum === 6) {
          const mixedPlusOptions = [];
          for (let j = 1; j < 10; j++) {
            if (j + sumSoFar <= 10) {
              mixedPlusOptions.push(j);
            }
          }
          number = mixedPlusOptions[Math.floor(Math.random() * mixedPlusOptions.length)];
        } else {
          const friendsPlusMinus = [];
          for (let k = -9; k < 10; k++) {
            if (1 <= k + sumSoFar && k + sumSoFar <= 10 && k + sumSoFar >= -10) {
              friendsPlusMinus.push(k);
            }
          }
  
          number = friendsPlusMinus[Math.floor(Math.random() * friendsPlusMinus.length)];
  
          while (digitSum > 0 && sumSoFar + number < 1) {
            number = friendsPlusMinus[Math.floor(Math.random() * friendsPlusMinus.length)];
          }
        }
      }
  
      sumSoFar += number;
      problemSet.push(number);
    }
  
    return problemSet;
  };
  const mixed = (numOfRows) => {
    const problemSet = [];
    let sumSoFar = 0;
    for(let i = 0; i < numOfRows; i++){
      let number = Math.floor(Math.random() * 19) - 9;
      while (!(number + sumSoFar >= 1)) {
        number = Math.floor(Math.random() * 19) - 9;
      }
      sumSoFar += number;
      problemSet.push(number);
    }
    return problemSet;
    
  }


  const generateProblems = () => {
    // Extract grade and lesson from formData
    const { grade, lesson, numQuestions, numNumbers, operation } = formData;

    // Call the appropriate function based on grade and lesson
    let problems = [];

    for (let i = 0; i < numQuestions; i++) {
      switch (grade + lesson) {
        case '101':
          // Grade 10, Lesson 1
          switch (operation) {
            case 'addition':
              problems = problems.concat(simpleUnderFive(numNumbers));
              break;
            // Add cases for other operations as needed
            default:
              break;
          }
          break;
        // Add more cases for other grades and lessons
        case '102':
          // Grade 10, Lesson 2
          switch (operation) {
            case 'addition':
              problems = [...problems, ...simpleUnderTen(numNumbers)];
              break;
            // Add cases for other operations as needed
            default:
              break;
          }
          break;
        case '103':
          // Grade 10, Lesson 3
          switch (operation) {
            case 'addition':
              problems = [...problems, ...friendsPlus(numNumbers)];
              break;
            // Add cases for other operations as needed
            default:
              break;
          }
          break;
        case '104':
        case '105':
        case '106':
        case '107':
        case '108':
        case '109':
          // Grade 10, Lesson 4 to 9
          switch (operation) {
            case 'addition':
              problems = [...problems, ...friends(numNumbers)];
              break;
            // Add cases for other operations as needed
            default:
              break;
          }
          break;
        case '1010':
          // Grade 10, Lesson 10
          switch (operation) {
            case 'addition':
              problems = [...problems, ...relativesPlus(numNumbers)];
              break;
            // Add cases for other operations as needed
            default:
              break;
          }
          break;
    
        case '1011':
        case '1012':
        case '1013':
        case '1014':
          // Grade 10, Lesson 11 to Lesson 14
          switch (operation) {
            case 'addition':
              problems = [...problems, ...relative(numNumbers)];
              break;
            // Add cases for other operations as needed
            default:
              break;
          }
          break;
    
        case '1015':
          // Grade 10, Lesson 15
          switch (operation) {
            case 'addition':
              problems = [...problems, ...mixedPlus(numNumbers)];
              break;
            // Add cases for other operations as needed
            default:
              break;
          }
          break;
    
        case '1016':
        case '1017':
        case '1018':
        case '1019':
        case '1020':
          // Grade 10, Lesson 16 to Lesson 20
          switch (operation) {
            case 'addition':
              problems = [...problems, ...mixed(numNumbers)];
              break;
            // Add cases for other operations as needed
            default:
              break;
          }
          break;
            
        default:
          break;
      }
    }

    setGeneratedProblems(problems);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="app-container">
      <div className="form-container">
        <h1>Problem Generator</h1>
        <form>
          <label>
            Grade:
            <select name="grade" value={formData.grade} onChange={handleInputChange}>
              <option value="10">Grade 10</option>
              {/* Add options for other grades */}
            </select>
          </label>
          <br />

          <label>
            Lesson:
            <select name="lesson" value={formData.lesson} onChange={handleInputChange}>
            <option value="1">Lesson 1</option>
              <option value="2">Lesson 2</option>
              <option value="3">Lesson 3</option>
              <option value="4">Lesson 4</option>
              <option value="5">Lesson 5</option>
              <option value="6">Lesson 6</option>
              <option value="7">Lesson 7</option>
              <option value="8">Lesson 8</option>
              <option value="9">Lesson 9</option>
              <option value="10">Lesson 10</option>
              <option value="11">Lesson 11</option>
              <option value="12">Lesson 12</option>
              <option value="13">Lesson 13</option>
              <option value="14">Lesson 14</option>
              <option value="15">Lesson 15</option>
              <option value="16">Lesson 16</option>
              <option value="17">Lesson 17</option>
              <option value="18">Lesson 18</option>
              <option value="19">Lesson 19</option>
              <option value="20">Lesson 20</option>
            </select>
          </label>
          <br />

          <label>
            Number of Questions:
            <input
              type="number"
              name="numQuestions"
              value={formData.numQuestions}
              onChange={handleInputChange}
            />
          </label>
          <br />

          <label>
            Number of Numbers in the Problem:
            <input
              type="number"
              name="numNumbers"
              value={formData.numNumbers}
              onChange={handleInputChange}
            />
          </label>
          <br />

          <label>
            Operation:
            <select name="operation" value={formData.operation} onChange={handleInputChange}>
              <option value="addition">Addition/Subtraction</option>
              <option value="multiplication">Multiplication</option>
              <option value="division">Division</option>
            </select>
          </label>
          <br />

          <button type="button" onClick={generateProblems}>
            Generate Problems
          </button>
        </form>

        {/* Display generated problems side by side in columns */}
        <div>
          <h2>Generated Problems:</h2>
          <div style={{ display: 'flex' }}>
            {generatedProblems.map((number, index) => (
              <div key={index} style={{ marginRight: '20px' }}>
                <h3>Number {index + 1}</h3>
                <div>{number}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
