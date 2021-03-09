import React, { useState } from "react";
import './App.css';
import { Route, BrowserRouter as Router, Switch, useParams } from "react-router-dom";
import Poll from "./pages/Poll";
import logoForLight from "./images/logoForLight.png";
import logoForDark from "./images/logoForDark.png";
import { Fade } from "react-awesome-reveal";

function App() {
  const [theme, setTheme] = useState("No data");
  const [firstLodad, setfirstLoad] = useState(true);
  const [logo, setLogo] = useState("No data");
  const [headerClasses, setHeaderClasses] = useState("logo-container start-screen");
  const [logoClasses, setLogoClasses] = useState("logo");
  if (theme == "No data") {
    if (window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
      setLogo(logoForDark);
    } else {
      setTheme("light");
      setLogo(logoForLight);
    }
    window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', event => {
      if (event.matches) {
        setTheme("dark");
        setLogo(logoForDark);
      } else {
        setTheme("light");
        setLogo(logoForLight);
      }
      })
  }
  if (firstLodad) {
    setTimeout(()=>{
      setHeaderClasses(`logo-container header`);
      setLogoClasses("logo header-logo")
    },1000);
  }

  return (
    <Router>
      <div className={headerClasses}>
        <Fade>
          <img src={logo} alt="Poleo" className={logoClasses}/>
        </Fade>
      </div>
      <Switch>
        <Route path="/Poleo-sharable-link/:pollId" component={Poll} />
      </Switch>
    </Router>
  );
}

export default App;
