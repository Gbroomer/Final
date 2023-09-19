import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import MyContext from './Context'
import Opener from "./Front_Page/Opener"
import Character_Creator from "./Front_Page/Character_Creator"

function App() {
  const [user, setUser] = useState(null)
  const login = (userData) => {
    setUser(userData);
  }
  const logout = () => {
    setUser(null)
  }

  return (
    <MyContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Switch>
          <Route exact path = "/">
            <Opener />
          </Route>
          <Route exact path = '/Characters'>
            <Character_Creator />
          </Route>
        </Switch>
      </BrowserRouter>
    </MyContext.Provider>
  );
}

export default App;
