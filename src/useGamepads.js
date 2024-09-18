import { useEffect, useState } from 'react';

const useGamepads = () => {
  const [gamepads, setGamepads] = useState([]);

  useEffect(() => {
    const updateGamepads = () => {
      const g = navigator.getGamepads();
      setGamepads(Array.from(g).filter(gp => gp !== null));
    };

    const handleGamepads = () => {
      updateGamepads();
      requestAnimationFrame(handleGamepads);
    };

    handleGamepads();

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return gamepads;
};

export default useGamepads;
