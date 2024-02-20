import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [teacherLoggedIn, setteacherLoggedIn] = useState(false);
  const [isQuizPage, setisQuizPage] = useState(false);

  const [currentQuizID, setcurrentQuizID] = useState(null);

  useEffect(() => {
    const checkIfTeacherLoggedIn = () => {
      let teacher_id = sessionStorage.getItem("teacher_id");
      if (!teacher_id) {
        setteacherLoggedIn(false);
      } else {
        setteacherLoggedIn(true);
      }
    };

    const checkIfQuiz = () => {
      const queryParameters = new URLSearchParams(window.location.search);
      const quizID = queryParameters.get("quizID");
      if (quizID) {
        setisQuizPage(true);
        setcurrentQuizID(quizID);
      }
    };

    checkIfQuiz();
    checkIfTeacherLoggedIn();
  }, []);

  return (
    <div className="App">
      {isQuizPage ? (
        <QuizPage currentQuizID={currentQuizID} />
      ) : (
        <>{teacherLoggedIn ? <Dashboard /> : <LogRegTeacher />}</>
      )}
    </div>
  );
}

export default App;

const LogRegTeacher = () => {
  const [fname, setfname] = useState("");
  const [lname, setlname] = useState("");
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");

  const clearInputsForRegister = () => {
    setfname("");
    setlname("");
    setusername("");
    setpassword("");
  };

  const registerTeacher = () => {
    if (!fname || !lname || !username || !password) {
      console.log("Some inputs are missing");
    } else {
      fetch(`${process.env.REACT_APP_SERVER_LINK}/teacher-register`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fname,
          lname,
          username,
          password,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data.msg);
          clearInputsForRegister();
        });
    }
  };

  //

  const [usernameLogin, setusernameLogin] = useState("");
  const [passwordLogin, setpasswordLogin] = useState("");

  const clearInputsForLogin = () => {
    setusernameLogin("");
    setpasswordLogin("");
  };

  const loginTeacher = () => {
    if (!usernameLogin || !passwordLogin) {
      console.log("Some inputs are missing");
    } else {
      fetch(`${process.env.REACT_APP_SERVER_LINK}/teacher-login`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameLogin,
          password: passwordLogin,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 0) {
            console.log(data.msg);
          } else {
            sessionStorage.setItem("teacher_id", data.result[0].id);
            sessionStorage.setItem("teacher_fname", data.result[0].fname);
            sessionStorage.setItem("teacher_lname", data.result[0].lname);
            window.location.reload();
          }
        });
    }
  };

  return (
    <div className="row_space_around">
      <div className="column border">
        <h1>Register Teacher</h1>
        <input
          type="text"
          placeholder="First Name"
          value={fname}
          onChange={(e) => setfname(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lname}
          onChange={(e) => setlname(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setusername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setpassword(e.target.value)}
        />
        <div className="row_space_around">
          <button onClick={clearInputsForRegister}>Clear</button>
          <button onClick={registerTeacher}>Register</button>
        </div>
      </div>
      <div className="column border">
        <h1>LOGIN</h1>
        <input
          type="text"
          placeholder="Username"
          value={usernameLogin}
          onChange={(e) => setusernameLogin(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={passwordLogin}
          onChange={(e) => setpasswordLogin(e.target.value)}
        />
        <div className="row_space_around">
          <button onClick={clearInputsForLogin}>Clear</button>
          <button onClick={loginTeacher}>Login</button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [teacherInfo, setTeacherInfo] = useState({});

  useEffect(() => {
    const setTeacher = () => {
      setTeacherInfo({
        teacher_id: sessionStorage.getItem("teacher_id"),
        teacher_fname: sessionStorage.getItem("teacher_fname"),
        teacher_lname: sessionStorage.getItem("teacher_lname"),
      });
    };

    setTeacher();
  }, []);

  const logOut = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div>
      <div className="row_space_around border">
        <h1>
          Hi {`${teacherInfo.teacher_fname} ${teacherInfo.teacher_lname}`}!
        </h1>
        <button onClick={logOut}>Log Out</button>
      </div>
      <AddQuestions />
      <AllQuestions />
      <Quizzes />
    </div>
  );
};

const AddQuestions = () => {
  const [questionToAdd, setquestionToAdd] = useState("");
  const [answerToAdd, setanswerToAdd] = useState("");
  const [answersGrouped, setanswersGrouped] = useState([]);

  const setQuestionAsTrueOrFalse = (bool) => {
    if (!answerToAdd) return;
    setanswersGrouped([
      ...answersGrouped,
      {
        answer: answerToAdd,
        is_correct: bool,
      },
    ]);
    setanswerToAdd("");
  };

  const addQuestion = () => {
    if (!questionToAdd || !answersGrouped.length) return;
    fetch(`${process.env.REACT_APP_SERVER_LINK}/teacher-add-question`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacher_id: sessionStorage.getItem("teacher_id"),
        question: questionToAdd,
        answers: answersGrouped,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.status) {
          console.log(data.msg);
        } else {
          setquestionToAdd("");
          setanswerToAdd("");
          setanswersGrouped([]);
          console.log(data.msg);
        }
      });
  };

  return (
    <div className="margin_top  row_space_between">
      <div className="column border width_500">
        <h2>Add Question</h2>
        <input
          type="text"
          placeholder="Question"
          value={questionToAdd}
          onChange={(e) => setquestionToAdd(e.target.value)}
        />
        <input
          type="text"
          placeholder="Answer"
          value={answerToAdd}
          onChange={(e) => setanswerToAdd(e.target.value)}
        />
        <div className="row_space_around">
          <button
            className="green"
            onClick={() => setQuestionAsTrueOrFalse(true)}
          >
            Set As True
          </button>
          <button
            className="red"
            onClick={() => setQuestionAsTrueOrFalse(false)}
          >
            Set As False
          </button>
        </div>
      </div>
      {questionToAdd && (
        <div className="border column">
          <h3>{questionToAdd}</h3>
          {answersGrouped.map((answer, index) => {
            return (
              <div key={index} className="row">
                <button
                  onClick={() => {
                    let newAnswersGrouped = [...answersGrouped];
                    newAnswersGrouped.splice(index, 1);
                    setanswersGrouped(newAnswersGrouped);
                  }}
                >
                  Remove
                </button>
                <p className={answer.is_correct ? "green" : "red"}>
                  {answer.answer}
                </p>
              </div>
            );
          })}
          <button onClick={addQuestion}>Add the question</button>
        </div>
      )}
    </div>
  );
};

const AllQuestions = () => {
  const [allQuestions, setallQuestions] = useState([]);

  useEffect(() => {
    const getAllQuestionsWithAnswers = () => {
      fetch(`${process.env.REACT_APP_SERVER_LINK}/teacher-get-questions`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.status) {
            console.log(data.msg);
          } else {
            setallQuestions(data.result);
          }
        });
    };
    getAllQuestionsWithAnswers();
  }, []);

  const [selectedQuestions, setselectedQuestions] = useState([]);
  const [passcodeForQuiz, setpasscodeForQuiz] = useState("");

  const handleRowCheckboxChange = (questionID) => {
    if (selectedQuestions.includes(questionID)) {
      setselectedQuestions(selectedQuestions.filter((id) => id !== questionID));
    } else {
      setselectedQuestions([...selectedQuestions, questionID]);
    }
  };

  const createQuiz = () => {
    if (!selectedQuestions.length || !passcodeForQuiz) return;

    fetch(`${process.env.REACT_APP_SERVER_LINK}/teacher-create-quiz`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacher_id: sessionStorage.getItem("teacher_id"),
        questions: selectedQuestions,
        passcode: passcodeForQuiz,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.status) {
          console.log(data.msg);
        } else {
          setpasscodeForQuiz("");
          setselectedQuestions([]);
          console.log(data.msg);
        }
      });
  };

  return (
    <div className="margin_top">
      {selectedQuestions.length === 0 ? null : (
        <div className="row">
          <input
            type="text"
            placeholder="Passcode for quiz"
            value={passcodeForQuiz}
            onChange={(e) => {
              setpasscodeForQuiz(e.target.value);
            }}
          />
          <button onClick={createQuiz}>Create Quiz</button>
        </div>
      )}
      <table className="table">
        <thead>
          <tr>
            <td></td>
            <td>ID</td>
            <td>Question</td>
            <td>Answers</td>
            <td>By</td>
          </tr>
        </thead>
        <tbody>
          {allQuestions.map((question) => {
            return (
              <tr key={question.question_id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.question_id)}
                    onChange={() =>
                      handleRowCheckboxChange(question.question_id)
                    }
                  />
                </td>
                <td>{question.question_id}</td>
                <td>{question.question}</td>
                <td>
                  {JSON.parse(question.answers).map((answer) => {
                    return (
                      <p
                        key={answer.answer_id}
                        className={answer.is_correct ? "green" : "red"}
                      >
                        {answer.answer}
                      </p>
                    );
                  })}
                </td>
                <td>{`${question.teacher_fname} ${question.teacher_lname}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Quizzes = () => {
  const [allQuizzes, setallQuizzes] = useState([]);

  useEffect(() => {
    const getAllQuizzesWithAnswers = () => {
      fetch(`${process.env.REACT_APP_SERVER_LINK}/teacher-get-quizzes`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.status) {
            console.log(data.msg);
          } else {
            setallQuizzes(data.result);
          }
        });
    };
    getAllQuizzesWithAnswers();
  }, []);

  const [quizQuestions, setquizQuestions] = useState([]);

  const viewQuestionsForQuiz = (questionIDs) => {
    fetch(
      `${process.env.REACT_APP_SERVER_LINK}/teacher-get-questions-for-quiz`,
      {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIDs,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.status) {
          console.log(data.msg);
        } else {
          setquizQuestions(data.result);
        }
      });
  };

  return (
    <div className="margin_top row_space_between">
      <table className="table">
        <thead>
          <tr>
            <td>ID</td>
            <td>Passcode</td>
            <td># of Questions</td>
            <td>By</td>
            <td>Controls</td>
          </tr>
        </thead>
        <tbody>
          {allQuizzes.map((quiz) => {
            return (
              <tr key={quiz.id}>
                <td>{quiz.id}</td>
                <td>{quiz.passcode}</td>
                <td>{quiz.questions.length}</td>
                <td>{`${quiz.fname} ${quiz.lname}`}</td>
                <td>
                  <button onClick={() => viewQuestionsForQuiz(quiz.questions)}>
                    View Questions
                  </button>
                  <button>Submissions X</button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${process.env.REACT_APP_FRONT_END_LINK}?quizID=${quiz.id}`
                      );
                    }}
                  >
                    Copy Link
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {quizQuestions.length === 0 ? null : (
        <table className="table">
          <thead>
            <tr>
              <td>ID</td>
              <td>Question</td>
              <td>Answer</td>
            </tr>
          </thead>
          <tbody>
            {quizQuestions.map((question) => {
              return (
                <tr key={question.question_id}>
                  <td>{question.question_id}</td>
                  <td>{question.question.slice(0, 50) + "..."}</td>
                  <td>{question.answer}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

const QuizPage = ({ currentQuizID }) => {
  const [currentView, setcurrentView] = useState("");

  useEffect(() => {
    const checkForProgressID = () => {
      let progress_id = sessionStorage.getItem("progress_id");
      if (progress_id) {
        fetch(
          `${process.env.REACT_APP_SERVER_LINK}/student-get-quiz-progress`,
          {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              progress_id,
            }),
          }
        )
          .then((res) => res.json())
          .then((data) => {
            setcurrentView(data.status);
          });
      } else {
        setcurrentView("");
      }
    };

    checkForProgressID();
  }, [currentQuizID]);

  const pickCurrentView = () => {
    switch (currentView) {
      case "pending":
        return (
          <>
            <h1 className="text_center">QUIZ #{currentQuizID}</h1>
            <QuizPending currentQuizID={currentQuizID} />
          </>
        );
      case "started":
        return (
          <>
            <h1 className="text_center">QUIZ #{currentQuizID}</h1>
            <QuizStarted currentQuizID={currentQuizID} />
          </>
        );
      case "finished":
        return (
          <>
            <h1 className="text_center">QUIZ #{currentQuizID}</h1>
            <QuizFinished currentQuizID={currentQuizID} />
          </>
        );
      default:
        return (
          <>
            <h1 className="text_center">QUIZ #{currentQuizID}</h1>
            <QuizLogin currentQuizID={currentQuizID} />
          </>
        );
    }
  };

  return <>{pickCurrentView()}</>;
};

const QuizLogin = ({ currentQuizID }) => {
  const [studentID, setstudentID] = useState("");
  const [studentName, setstudentName] = useState("");
  const [quizPassword, setquizPassword] = useState("");

  const clearInputs = () => {
    setstudentID("");
    setstudentName("");
    setquizPassword("");
  };

  const submitUserInfo = () => {
    if (!studentID || !studentName) return;

    fetch(`${process.env.REACT_APP_SERVER_LINK}/student-login`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quiz_id: currentQuizID,
        student_id: studentID,
        student_name: studentName,
        quiz_password: quizPassword,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.status) {
          console.log(data.msg);
        } else {
          sessionStorage.setItem("progress_id", data.progress_id);
          window.location.reload();
        }
      });
  };

  return (
    <div>
      <div className="column border width_500 margin_top place_itself_center">
        <input
          type="text"
          placeholder="Student ID..."
          value={studentID}
          onChange={(e) => setstudentID(e.target.value)}
        />
        <input
          type="text"
          placeholder="Student Name..."
          value={studentName}
          onChange={(e) => setstudentName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Quiz Password..."
          value={quizPassword}
          onChange={(e) => setquizPassword(e.target.value)}
        />
        <div className="row_space_around">
          <button onClick={clearInputs}>CLEAR</button>
          <button onClick={submitUserInfo}>SUBMIT</button>
        </div>
      </div>
    </div>
  );
};

const QuizPending = ({ currentQuizID }) => {
  const [quizInfo, setquizInfo] = useState([]);

  useEffect(() => {
    const getQuizInfo = () => {
      fetch(
        `${process.env.REACT_APP_SERVER_LINK}/student-get-general-quiz-info`,
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quiz_id: currentQuizID,
          }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (!data.status) {
            console.log(data.msg);
          } else {
            setquizInfo(data.result);
          }
        });
    };

    getQuizInfo();
  }, [currentQuizID]);

  const startQuiz = () => {
    fetch(`${process.env.REACT_APP_SERVER_LINK}/student-start-quiz`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progress_id: sessionStorage.getItem("progress_id"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.status) {
          console.log(data.msg);
        } else {
          window.location.reload();
        }
      });
  };

  return (
    <>
      {quizInfo.length === 0 ? null : (
        <div className="column border width_500 margin_top place_itself_center">
          <h1>Quiz ID: {currentQuizID}</h1>
          <h1>Time Limit: 30 Min</h1>
          <h1>Number of Questions: {quizInfo[0].questions.length}</h1>
          <h1>
            By: {`${quizInfo[0].teacher_fname} ${quizInfo[0].teacher_lname}`}
          </h1>
          <button onClick={startQuiz}>START QUIZ!</button>
        </div>
      )}
    </>
  );
};

const QuizStarted = ({ currentQuizID }) => {
  const [quizProgress, setquizProgress] = useState([]);

  useEffect(() => {
    const getQuizProgress = () => {
      let progress_id = sessionStorage.getItem("progress_id");
      if (progress_id) {
        fetch(
          `${process.env.REACT_APP_SERVER_LINK}/student-get-started-quiz-progress`,
          {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              progress_id,
            }),
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (!data.status) {
              console.log(data.msg);
            } else {
              setquizProgress(data.result);
            }
          });
      } else {
        console.log("Error In Front End");
      }
    };

    getQuizProgress();
  }, []);

  console.log(quizProgress);

  return (
    <div className="margin_top">
      {!quizProgress.length ? null : (
        <div className="row_space_around place_itself_center margin_top border">
          <h2>ID: {quizProgress[0].quiz_id}</h2>
          <h2>Student ID: {quizProgress[0].student_id}</h2>
          <h2>Student Name: {quizProgress[0].student_name}</h2>
          <h2>Started: {new Date(quizProgress[0].started).toLocaleString()}</h2>
          <h2>
            Timer: <CountdownTimer startTime={quizProgress[0].started} />{" "}
          </h2>
        </div>
      )}
      <div className="margin_top">
        <h1>QUESTIONS HERE</h1>
        <button>SUBMIT QUIZ!</button>
      </div>
    </div>
  );
};

const QuizFinished = ({ currentQuizID }) => {
  return <div>Finished</div>;
};

//
const CountdownTimer = ({ startTime }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      const newRemainingTime = calculateRemainingTime(startTime);
      setRemainingTime(newRemainingTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const calculateRemainingTime = (startTime) => {
    const now = new Date().getTime();
    const startTimeInMillis = new Date(startTime).getTime(); // Convert datetime to milliseconds
    const endTimeInMillis = startTimeInMillis + 30 * 60 * 1000; // Add 30 minutes
    let difference = endTimeInMillis - now;
    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  const [remainingTime, setRemainingTime] = useState(
    calculateRemainingTime(startTime)
  );

  return (
    <>
      {`${remainingTime.minutes
        .toString()
        .padStart(2, "0")}:${remainingTime.seconds
        .toString()
        .padStart(2, "0")}`}
    </>
  );
};
