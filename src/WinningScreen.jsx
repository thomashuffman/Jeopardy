import React from 'react';
import './WinningScreen.css'; // Import the CSS file

const WinningScreen = ({ winner, onClose }) => {
  const messages = [
    `Congratulations, ${winner}! You crushed the competition and left them in the dust. Better luck next time, losers!`
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="winning-screen">
      <div className="winning-content">
        <h1 className="winning-message">{randomMessage}</h1>
      </div>
    </div>
  );
};

export default WinningScreen;
