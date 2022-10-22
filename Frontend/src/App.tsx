import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GameAuthHandler } from 'components/game/GameAuthHandler';
import { GameContext, game } from 'features/game';


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
