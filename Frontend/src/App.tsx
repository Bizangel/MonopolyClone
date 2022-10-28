import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GameAuthHandler } from 'components/game/GameAuthHandler';


function App() {
  return (
    <React.StrictMode>
      <div className="App">
        <GameAuthHandler />
      </div>
    </React.StrictMode>
  );
}

export default App;
