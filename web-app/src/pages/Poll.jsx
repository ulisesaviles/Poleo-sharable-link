import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MdRadioButtonUnchecked } from "react-icons/md";
import { HorizontalBar } from "react-chartjs-2";

const Poll = () => {
  // localStorage.setItem("answered", "false");


  const [updater, update] = useState(false);
  // Allways scroll to top
  const [scrollToTop, setScrollToTop] = useState(false);
  if (!scrollToTop) {
    window.scrollTo(0, 0);
    setScrollToTop(true);
  }
  
  // Detect the theme
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
  // initial => answering => loadingResults => final

  // Know if someone already answered a poll
  const [alreadyAnswered, setAlreadyAnswered] = useState("No data");
  if (alreadyAnswered == "No data") { 
    setAlreadyAnswered(localStorage.getItem("answered"));
  };
  console.log("Already answered: " + alreadyAnswered + ", State: " + state);
  if (alreadyAnswered == "true") {
    setState("loadingResults");
    update(true);
    setAlreadyAnswered(true);
  }

  // Question states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionType, setCurrentQuestionType] = useState("multiTextOption");
  const [currentQuestion, setCurrentQuestion] = useState("Loading...");
  const [currentOptions, setCurrentOptions] = useState([]);
  const [optionClasses, setOptionClasses] = useState([])
  const [optionsContainerClasses, setOptionsContainerClasses] = useState("poll-options-container")
  const [questionClasses, setQuestionClasses] = useState("poll-question")
  const [answers, setAnswers] = useState([]);
  if (updater) {
    update(false);
  }
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
      if (localStorage.getItem("answered") != "true") {
        setState("answering");
      }
      setCurrentQuestion(response.data.questions[currentQuestionIndex].title[response.data.defaultLang]);
      setCurrentOptions(response.data.questions[currentQuestionIndex].options);
      setCurrentQuestionType(response.data.questions[currentQuestionIndex].type);      
      let tempClasses = [];
      for (let i = 0; i < response.data.questions[currentQuestionIndex].options.length; i++) {
        tempClasses.push(`${response.data.questions[currentQuestionIndex].type}-container`);
      }
      setOptionClasses(tempClasses);
    });
  }
  function goToNextQuestion(passedFilter) {
    setTimeout(() => {
      setOptionsContainerClasses("poll-options-container dissapear-left");
      setQuestionClasses("poll-question dissapear-left");
      if (currentQuestionIndex + 1 == poll.questions.length && passedFilter) {
        setState("loadingResults");
        // Post results
        let dataToPost = {
          userId : "anonim",
          method : "submitAnswers",
          pollId : pollId,
          answers : answers,
        };
        console.log("im posting data");
        console.log(dataToPost);
        axios({
          method: "post",
          url:
            "https://us-central1-poleoo.cloudfunctions.net/randomNumber",
          data: dataToPost,
        });
      } else {
        console.log("im not posting data");
      }
      if (passedFilter && currentQuestionIndex + 1 < poll.questions.length){
        setTimeout(()=> {
          setCurrentQuestion(poll.questions[currentQuestionIndex + 1].title[poll.defaultLang]);
          setCurrentOptions(poll.questions[currentQuestionIndex + 1].options);
          setCurrentQuestionType(poll.questions[currentQuestionIndex + 1].type);
          let tempClasses = [];
          for (let i = 0; i < poll.questions[currentQuestionIndex + 1].options.length; i++) {
            tempClasses.push(`${poll.questions[currentQuestionIndex + 1].type}-container`);
          }
          setOptionClasses(tempClasses);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setQuestionClasses("poll-question hide dissapear-right");
          setOptionsContainerClasses("poll-options-container hide dissapear-right");
          setTimeout(()=> {
            setQuestionClasses("poll-question");
            setOptionsContainerClasses("poll-options-container");
            update(true);
          }, 200);  
        }, 200);
      }
    }, 500)
  }
  function passedFilter(answerIndex) {
    console.log("Is filter: " + poll.questions[currentQuestionIndex].filter.isFilter);
    if(poll.questions[currentQuestionIndex].filter.isFilter) { // Is filter
      if(poll.questions[currentQuestionIndex].filter.correctIndexes.indexOf(answerIndex) < 0) { // if it's incorrect
        localStorage.setItem("answered", "true");
        setAlreadyAnswered("true");
        setState("loadingResults");
        return false;
      } else { // Is correct
        console.log("passed the filter");
        return true;
      }
    } else { // Is not a filter
      console.log("passed the filter");
      let tempAnswers = answers;
      tempAnswers.push(answerIndex);
      console.log("Current answers: " + tempAnswers);
      setAnswers(tempAnswers);
      return true;
    }
  }
  function options(questionType) {
    if (questionType == "multiTextOption") {
      return(
        currentOptions.map((option) => (
          <div className={optionClasses[currentOptions.indexOf(option)]} onClick={() => {
            let tempClasses = optionClasses;
            tempClasses[currentOptions.indexOf(option)] = "multiTextOption-container multiTextOption-container-selected"
            setOptionClasses(tempClasses);
            update(true);
            goToNextQuestion(passedFilter(currentOptions.indexOf(option)));
          }}>
            <MdRadioButtonUnchecked className="unchecked-icon"/>
            <p className="option-text">{option[poll.defaultLang]}</p>
          </div>
        ))
      );
    } else if (questionType == "multiImgOption") {
      return(
        currentOptions.map((option) => (
          <div className={optionClasses[currentOptions.indexOf(option)]} onClick={() => {
            let tempClasses = optionClasses;
            tempClasses[currentOptions.indexOf(option)] = "multiImgOption-container multiTextOption-container-selected"
            setOptionClasses(tempClasses);
            update(true);
            goToNextQuestion(passedFilter(currentOptions.indexOf(option)));
          }}>
            <img className="option-img" alt="img" src={option.img}/>
            <p className="option-text">{(option.name == undefined) ? "" : option.name[poll.defaultLang] }</p>
          </div>
        ))
      );
    }
  }

  // Query the results
  const [results, setResults] = useState("No data");
  if(state == "loadingResults") {
    setState("final");
    axios({
      method: "post",
      url:
        "https://us-central1-poleoo.cloudfunctions.net/randomNumber",
      data: {
        method : "queryResultsByPollId",
        pollId : pollId,
      },
    }).then((response) => {
      setResults(response.data);
    });
  }

  // Display results
  function finalState () {
    if (results == "No data") {
      //////////////////////// Set loading to gif img
      return(
        <p>Loading final state...</p>
      );
    } else if (results == "Poll results are private"){
      //////////////////////// Style this shit
      return(
        <p>Thank you fow answering!</p>
      );
    } else if(poll != "No data"){
      let labels = [];
      let titles = [];
      for (let i = 0; i < poll.questions.length; i++) {
        if (!poll.questions[i].filter.isFilter) {
          labels.push([]);
          titles.push(poll.questions[i].title[poll.defaultLang]);
          for (let j = 0; j < poll.questions[i].options.length; j++) {
            if(poll.questions[i].type == "multiTextOption") {
              labels[i].push(poll.questions[i].options[j][poll.defaultLang]);
            } else {
              labels[i].push(poll.questions[i].options[j].name[poll.defaultLang]);
            }
          }
        }
      }
      return(
        <div className="results-container">
          {
            results.map((questionResult) => (
              <div className="chart-container">
                <h2 className="results-question">{titles[results.indexOf(questionResult)]}</h2>
                <HorizontalBar data={{
                  labels : labels[results.indexOf(questionResult)],
                  datasets: [
                    {
                      label : "Votos",
                      data: questionResult,
                      backgroundColor : "rgba(18, 229, 122, 0.3)",
                      borderColor : "rgb(18, 229, 122)",
                      borderWidth: 3,
                      maxBarThickness: 30,
                    }
                  ],
                }}
                options={{
                  maintainAspectRatio : true,
                  scales: {
                    xAxes: [
                      {
                        ticks: {
                          beginAtZero: true
                        }
                      }
                    ]
                  }
                }}
                height={120}
                className="results-chart"
                />
              </div>
            ))
          }
        </div>
      );
    }
  }

  // Renders
  if (state == "loadingResults" || state == "final") {
    return (
      <div className="content-container">
        <div className="poll-container">
          <h1 className="">{poll == "No data" ? "Loading results..." : poll.title[poll.defaultLang]}</h1>
          {finalState()}
        </div>
        <p style={{color: "rgba(255,255,255,1)"}}>{updater}</p>
      </div>
    );
  } else {
    return (
      <div className="content-container">
        <div className="poll-container">
          <h1 className={questionClasses}>{currentQuestion}</h1>
          <div className={optionsContainerClasses} style={{"display": currentQuestionType == "multiImgOption" ? "flex" : "block"}}>
            {
              options(currentQuestionType)
            }
          </div>
          <div className="progress-bar-content-container">
            <div className="progress-bar-container">
              <div className="progress-bar" style={{width: (poll == "No data" ? "0%" : `${((currentQuestionIndex + 1) / (poll.questions.length)) * 100}%`)}}/>
            </div>
            <p>{`${currentQuestionIndex + 1} de ${poll == "No data" ? 0 : poll.questions.length}`}</p>
          </div>
        </div>
        <p style={{color: "rgba(255,255,255,1)"}}>{updater}</p>
      </div>
    );
  }
}

export default Poll;

// TODO: 
// Add input to enter the pollId
// Navigate to the correct url
// Check if the pollId exists
// // Verify if the question is a filter
// //   if it is, then check if the answer was correct
// //      if it was, then continue
// //      if not, save the in the browser the fact that you already answered it 
// // Post the results on firebase
// // Prevent the poll from breaking when questions are over
// // Query the results
// Display the results
