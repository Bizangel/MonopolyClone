import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GameAuthHandler } from 'components/game/GameAuthHandler';
import { userSocketContext, useUserSocketProvider } from 'hooks/socketProvider';


function App() {
  const socketval = useUserSocketProvider();


  return (
    <React.StrictMode>
      <div className="App">
        <userSocketContext.Provider value={socketval}>
          <GameAuthHandler />
        </userSocketContext.Provider>
      </div>
    </React.StrictMode>
  );
}

export default App;
