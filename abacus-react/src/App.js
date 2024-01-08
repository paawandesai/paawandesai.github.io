import React, { useState, useEffect } from 'react';
import { simpleUnderFive } from './grade_ten_functions';
import { simpleUnderTen } from './grade_ten_functions';
import { friendsPlus } from './grade_ten_functions';
import { friends } from './grade_ten_functions';
import { relativesPlus } from './grade_ten_functions';
import { relative } from './grade_ten_functions';
import { mixedPlus } from './grade_ten_functions';
import { mixed } from './grade_ten_functions';

function App() {
  const [formData, setFormData] = useState({
    grade: '10',
    lesson: '1',
    numQuestions: 1,
    numNumbers: 4,
    operation: 'addition',
  });

  const [generatedProblems, setGeneratedProblems] = useState([]);
  const [userAnswers, setUserAnswers] = useState(Array(formData.numQuestions).fill(''));

  useEffect(() => {
    setUserAnswers(Array(formData.numQuestions).fill(''));
  }, [formData.numQuestions]);
  
  //problems formatting
  const generateProblems = () => {
    // Extract grade and lesson from formData
    clearResultMessages();
    const { grade, lesson, numQuestions, numNumbers, operation } = formData;

    // Call the appropriate function based on grade and lesson
    let problems = [];

    for (let i = 0; i < numQuestions; i++) {
      let currentProblems = [];
      switch (grade + lesson) {
        case '101':
          // Grade 10, Lesson 1
          switch (operation) {
            case 'addition':
              currentProblems = simpleUnderFive(numNumbers);
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
              currentProblems = simpleUnderTen(numNumbers);
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
              currentProblems = friendsPlus(numNumbers);
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
              currentProblems = friends(numNumbers);
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
              currentProblems = relativesPlus(numNumbers);
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
              currentProblems = relative(numNumbers);
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
              currentProblems = mixedPlus(numNumbers);
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
              currentProblems = mixed(numNumbers);
              break;
            // Add cases for other operations as needed
            default:
              break;
          }
          break;
            
        default:
          break;
      }
      const formattedProblems = currentProblems.map((number, index) => {
        return `${index === 0 ? ' ' : ''}${number >= 0 ? '+' : ''}${number}`;
      });
      
      problems.push({
        numbers: currentProblems, // Array of numbers
        formatted: formattedProblems, // Array of formatted strings
      });
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
  const handleUserAnswerChange = (e, index) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = e.target.value;
    setUserAnswers(newAnswers);
  };
  
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      checkAnswer(index);
    }
  };
  const checkAnswer = (index) => {
    const userAnswer = parseFloat(userAnswers[index]);
    const correctAnswer = generatedProblems[index].numbers.reduce((sum, num) => sum + num, 0);
  
    const resultMessage = !isNaN(userAnswer) && userAnswer === correctAnswer
      ? 'Correct!'
      : 'Incorrect. Try again!';
  
    // Display the result as text on the UI instead of using alert
    const resultDisplay = document.getElementById(`result-${index}`);
    if (resultDisplay) {
      resultDisplay.textContent = resultMessage;
    }
  };
  const clearResultMessages = () => {
    const resultDisplays = document.querySelectorAll('[id^="result-"]');
    resultDisplays.forEach((resultDisplay) => {
      resultDisplay.textContent = '';
    });
  };
  const resetProblems = () => {
    // Clear generated problems and result messages
    setGeneratedProblems([]);
    clearResultMessages();
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
              <option value="10">Grade 9</option>
              <option value="10">Grade 8</option>
              <option value="10">Grade 7</option>
              <option value="10">Grade 6</option>
              <option value="10">Grade 5</option>
              <option value="10">Grade 4</option>
              <option value="10">Grade 3</option>
              <option value="10">Grade 2</option>
              <option value="10">Grade 1</option>
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
            Team of Numbers:
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

          {/* Buttons */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button type="button" onClick={generateProblems}>
              Generate Problems
            </button>
            <button type="button" onClick={resetProblems}>
              Reset
            </button>
          </div>
        </form>

        {/* Display generated problems vertically with solution box underneath */}
        <div style={{ textAlign: 'center' }}>
          <h1>Generated Problems:</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {generatedProblems.map((problem, index) => (
              <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '0 10px' }}>
                <h2>Problem {index + 1}</h2>

                {/* Display problem vertically with aligned numbers and operators */}
                <div style={{ fontFamily: 'Courier New',fontSize:'18pt', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {problem.formatted.map((part, partIndex) => (
                    <div key={partIndex}>{part}</div>
                  ))}
                </div>

                {/* Answer input */}
                <label>
                  Your Answer:
                  <input
                    type="text"
                    value={userAnswers[index]}
                    onChange={(e) => handleUserAnswerChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                </label>

                {/* Check Answer button */}
                <button type="button" onClick={() => checkAnswer(index)}>
                  Check Answer
                </button>

                {/* Result display */}
                <div id={`result-${index}`} style={{ marginTop: '10px' }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
