import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import MyContextProvider from './Context'
import Opener from "./Front_Page/Opener"
import Character_Creator from "./Front_Page/Character_Creator"
import Main from "./Main_Page/Main"

function App() {
  return (
    <MyContextProvider>
      <Switch>
        <Route exact path="/">
          <Opener />
        </Route>
        <Route exact path='/Characters'>
          <Character_Creator />
        </Route>
        <Route exact path='/Main'>
          <Main />
        </Route>
      </Switch>
    </MyContextProvider>
  );
}

export default App;
