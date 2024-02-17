import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [teacherLoggedIn, setteacherLoggedIn] = useState(false);

  useEffect(() => {
    const checkIfTeacherLoggedIn = () => {
      let teacher_id = sessionStorage.getItem("teacher_id");
      if (!teacher_id) {
        setteacherLoggedIn(false);
      } else {
        setteacherLoggedIn(true);
      }
    };

    checkIfTeacherLoggedIn();
  }, []);

  return (
    <div className="App">
      {teacherLoggedIn ? <Dashboard /> : <LogRegTeacher />}
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

  return (
    <div className="margin_top">
      <table className="table">
        <thead>
          <tr>
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
  return <div className="margin_top">All Quizzes</div>;
};
