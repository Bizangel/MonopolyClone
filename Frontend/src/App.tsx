import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GameEntryHandler } from 'components/GameEntryHandler';
import { userSocketContext, useUserSocketProvider } from 'hooks/socketProvider';


function App() {
  const socketval = useUserSocketProvider();


  return (
    <React.StrictMode>
      <div className="App">
        <userSocketContext.Provider value={socketval}>
          <GameEntryHandler />
        </userSocketContext.Provider>
      </div>
    </React.StrictMode>
  );
}

export default App;
