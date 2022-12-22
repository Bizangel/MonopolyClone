import React from 'react';
import "bootswatch/dist/cyborg/bootstrap.min.css";
import { GameEntryHandler } from 'components/GameEntryHandler';
import { userSocketContext, useUserSocketProvider } from 'hooks/socketProvider';
// In your application's entrypoint
import { enableMapSet } from "immer"

enableMapSet()

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
