import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Poll = () => {
  const [scrollToTop, setScrollToTop] = useState(false);
  if (!scrollToTop) {
    window.scrollTo(0, 0);
    setScrollToTop(true);
  }

  const [theme, setTheme] = useState("No data");
  if (theme == "No data") {
    if (window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', event => {
        if (event.matches) {
          setTheme("dark");
        } else {
          setTheme("light");
        }
      })
  }

  const [state, setState] = useState("initial");
  // initial => answering => loading => answered

  const [alreadyAnswered, setAlreadyAnswered] = useState("No data");
  if (alreadyAnswered == "No data") { 
    setAlreadyAnswered(localStorage.getItem("answered"));
  }
  console.log(localStorage.getItem("answered") == null);

  let { pollId } = useParams();
  const [poll, setPoll] = useState("No data");
  if (poll == "No data") {
    axios({
      method: "post",
      url:
        "https://us-central1-poleoo.cloudfunctions.net/randomNumber",
      data: {
        method : "queryPollByPollId",
        pollId : pollId
      },
    }).then((response) => {
      setPoll(response.data);
      setState("answering");
    });
  }
  return (
    <div className="content-container">
      <div className="poll-container">
        <h1 className="poll-question">{poll == "No data" ? "Loading..." : poll.title[poll.defaultLang]}</h1>
      </div>
    </div>
  );
}

export default Poll;