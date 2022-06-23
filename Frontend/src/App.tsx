import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GameAuthHandler } from './Components/Game';
import { GameContext, game } from './Game';


function App() {
  return (
    <React.StrictMode>
      <GameContext.Provider value={game}>
        <div className="App">
          <GameAuthHandler />
        </div>
      </GameContext.Provider>
    </React.StrictMode>
  );
}

export default App;
