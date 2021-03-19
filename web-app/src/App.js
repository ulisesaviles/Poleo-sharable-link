import React, { useState } from "react";
import './App.css';
import { Route, BrowserRouter as Router, Switch, useParams } from "react-router-dom";
import Poll from "./pages/Poll";

function App() {

  return (
    <Router>
      <Switch>
        <Route path="/" component={Poll} />
      </Switch>
    </Router>
  );
}

export default App;
