## MonopolyClone Authentication

There needs to be at least some sort of authentication in the game or identification. As the need for different players is necessary as they have different properties, money in the original game.

For this, a usual cookie-based login mechanism is presented.
Users can register and then proceed to subsequently login, obtaining a cookie.

The game is intended to have a constant websocket connection with the backend server. So on the initial websocket request the login cookie is sent, and thus the backend server accepts the connection else, just simply refuses it.

When the user sends the cookie, it can then easily identify who the user is and will associate in memory the user with the websocket. If the websocket connection is closed or lost, this implies the user needs to still have the cookie to re-connect.


#### Currently there is no logout mechanism. But there should be.