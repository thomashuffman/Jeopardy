import React, { useEffect, useState } from "react";
import "./JeopardyBoard.css";
import WinningScreen from "./WinningScreen";
import useGamepads from './useGamepads'; // Adjust the path as needed


// Categories and Points
const allCategories = ["Science", "History", "Movies", "Geography", "Music", "Sports", "Famous Duos", "Math and Logic", "Animals", "Religions", "Famous Last Words", "South Africa", "Food"];
const points = [200, 400, 600, 800, 1000];

const JeopardyBoard = () => {
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [clickedQuestions, setClickedQuestions] = useState(new Set());
  const [answerToDisplay, setAnswerToDisplay] = useState(null);
  const [playerScores, setPlayerScores] = useState({
    player1: 0,
    player2: 0,
    player3: 0,
  });
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gamepads, setGamepads] = useState([]);
  const [previousButtonStates, setPreviousButtonStates] = useState([]);

  useEffect(() => {
    // Set up event listeners for gamepad connection and disconnection
    const handleGamepadConnected = (event) => {
      console.log("A gamepad connected:");
      console.log(event.gamepad);
      setGamepads([...gamepads, event.gamepad]);
      setPreviousButtonStates([...previousButtonStates, Array(event.gamepad.buttons.length).fill(false)]);
    };

    const handleGamepadDisconnected = (event) => {
      console.log("A gamepad disconnected:");
      console.log(event.gamepad);
      setGamepads(gamepads.filter(gp => gp.index !== event.gamepad.index));
      setPreviousButtonStates(previousButtonStates.filter((_, index) => index !== event.gamepad.index));
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
    };
  }, [gamepads, previousButtonStates]);

  useEffect(() => {
    const updateGamepads = () => {
      const updatedGamepads = navigator.getGamepads();
      setGamepads(Array.from(updatedGamepads).filter(gp => gp !== null));
    };

    const handleGamepadInput = () => {
      updateGamepads();
      gamepads.forEach((gamepad, index) => {
        if (gamepad) {
          gamepad.buttons.forEach((button, buttonIndex) => {
            const wasPressed = previousButtonStates[index] && previousButtonStates[index][buttonIndex];
            if (button.pressed && !wasPressed) {
              console.log(`Gamepad ${gamepad.index}, Button ${buttonIndex} is pressed`);
              handleGamepadButtonPress(gamepad.index, buttonIndex, gamepad.id);
            }
          });
          // Update previous button states
          setPreviousButtonStates(prevStates => {
            const newStates = [...prevStates];
            newStates[index] = gamepad.buttons.map(button => button.pressed);
            return newStates;
          });
        }
      });
    };

    handleGamepadInput();

    return () => {
      // Cleanup if necessary
    };
  }, [gamepads, previousButtonStates]);

  const handleGamepadButtonPress = (gamepadIndex, buttonIndex, name) => {
    if(gamepadIndex && buttonIndex){
      console.log("game index is " + gamepadIndex + " button index is "+buttonIndex);
    }else{
      console.log("null")
    }
    if(currentQuestion && !selectedPlayer){
      if(name.startsWith("DualSense Wireless Controller1")){
        setSelectedPlayer('player1');
      }
      if(name.startsWith("DualSense Wireless Controller2")){
        setSelectedPlayer('player2');
      }
      if(name.startsWith("DualSense Wireless Controller3")){
        setSelectedPlayer('player3');
      }
  }else{

  }

  };

  useEffect(() => {
    // Initialize categories only on component mount
    if (categories.length === 0) {
      const initializeCategories = () => {
        const shuffled = allCategories.sort(() => 0.5 - Math.random());
        setCategories(shuffled.slice(0, 6));
      };
      initializeCategories();
    }

    fetchQuestions();

    const handleKeyPress = (event) => {
      if (event.key === 'q' && !selectedPlayer) {
        setSelectedPlayer('player1');
      }
      if (event.key === 'b' && !selectedPlayer) {
        setSelectedPlayer('player2');
      }
      if (event.key === 'p' && !selectedPlayer) {
        setSelectedPlayer('player3');
      }
      if (event.key === 'Enter' && selectedPlayer && currentQuestion) {
        handleShowAnswer();
      }
      if (event.key === 'ArrowUp' && selectedPlayer && currentQuestion) {
        handleAnswerResult(true); // Mark answer as correct
      }
      if (event.key === 'ArrowDown' && selectedPlayer && currentQuestion) {
        handleAnswerResult(false); // Mark answer as incorrect
      }
      if (event.key === 'Escape') {
        closeQuestionView(); // Close the question view
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedPlayer, categories.length]);

  // Fetch questions from the text file
  const fetchQuestions = async () => {
    try {
      const response = await fetch("/questions.txt");
      const data = await response.json();
      setQuestions(data); // Save questions in the state
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };
  

  // Function to handle cell click
  const handleCellClick = (category, pointValue) => {
    // Filter available questions
    const availableQuestions = questions.filter(
      (q) => q.category === category && q.pointValue === pointValue && !clickedQuestions.has(`${category}, ${pointValue}`)
    );
    
    if (availableQuestions.length > 0) {
      // Randomly select a question
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const question = availableQuestions[randomIndex];
      setCurrentQuestion(question);
      setClickedQuestions(prevState => new Set(prevState).add(`${category}, ${pointValue}`));
      setAnswerToDisplay(null); // Reset answer display
    }
  };

  // Function to handle showing the answer
  const handleShowAnswer = () => {
    if (currentQuestion) {
      setAnswerToDisplay(currentQuestion.answer);
    }
  };

  // Function to handle answer result
  const handleAnswerResult = (isCorrect) => {
    if (selectedPlayer && currentQuestion) {
      setPlayerScores(prevScores => {
        const points = currentQuestion.pointValue;
        return {
          ...prevScores,
          [selectedPlayer]: isCorrect
            ? prevScores[selectedPlayer] + points
            : prevScores[selectedPlayer] - points,
        };
      });
    }
    setCurrentQuestion(null);
    setAnswerToDisplay(null);
    setSelectedPlayer(null);
    checkGameOver();
  };

  // Function to check if the game is over
  const checkGameOver = () => {
    if (clickedQuestions.size === 30) {
      setGameOver(true);
    }
  };

  // Function to close the full-screen question view
  const closeQuestionView = () => {
    setCurrentQuestion(null);
    setAnswerToDisplay(null);
    setSelectedPlayer(null);
    checkGameOver();
  };

  // Function to determine the winning player
  const getWinningPlayer = () => {
    const maxScore = Math.max(playerScores.player1, playerScores.player2, playerScores.player3);
    return Object.keys(playerScores).find(player => playerScores[player] === maxScore);
  };

  return (
    <div className="jeopardy-board">
      <div className="player-scores">
        <div className={`player ${selectedPlayer === 'player1' ? 'selected' : ''}`} id="player1">Player 1 (Q): ${playerScores.player1}</div>
        <div className={`player ${selectedPlayer === 'player2' ? 'selected' : ''}`} id="player2">Player 2 (B): ${playerScores.player2}</div>
        <div className={`player ${selectedPlayer === 'player3' ? 'selected' : ''}`} id="player3">Player 3 (P): ${playerScores.player3}</div>
      </div>

      <div className="categories-row">
        {categories.map((category, index) => (
          <div key={index} className="category">
            {category}
          </div>
        ))}
      </div>

      {points.map((point, rowIndex) => (
        <div key={rowIndex} className="points-row">
          {categories.map((category, colIndex) => {
            const isDisabled = clickedQuestions.has(`${category}, ${point}`);

            return (
              <div
                key={colIndex}
                className={`points-cell ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && handleCellClick(category, point)}
              >
                {`$${point}`}
              </div>
            );
          })}
        </div>
      ))}

      {/* Full-screen question display */}
      {gameOver && <WinningScreen winner={getWinningPlayer()} />}
      {currentQuestion && (
        <div className="question-overlay">
          <div className="question-container">
            <button className="close-button" onClick={closeQuestionView}>×</button>
            {selectedPlayer && (
              <div className="answer-indicator">
                Now answering: {selectedPlayer.replace('player', 'Player ')}
              </div>
            )}
            <h1 className="question-text">{currentQuestion.question}</h1>
            {selectedPlayer && !answerToDisplay && (
              <button className="show-answer-button" onClick={handleShowAnswer}>
                Click to Display Answer
              </button>
            )}
            {answerToDisplay && (
              <div className="answer-section">
                <p className="answer-text">{answerToDisplay}</p>
                <button className="answer-button incorrect" onClick={() => handleAnswerResult(false)}>Incorrect</button>
                <button className="answer-button correct" onClick={() => handleAnswerResult(true)}>Correct</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Winning screen */}
    </div>
  );
};

export default JeopardyBoard;
