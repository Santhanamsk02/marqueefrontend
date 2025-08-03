import { useState } from "react";

export default function MCQForm({ formData, setFormData, submitTest }) {
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [q, setQ] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 1
  });

  const handleNext = () => {
    const updated = [...questions, q];
    setQuestions(updated);
    setQ({ question: "", options: ["", "", "", ""], correctAnswer: 1 });

    if (updated.length === formData.numQuestions) {
      submitTest({ ...formData, questions: updated });
    } else {
      setCurrent(current + 1);
    }
  };

  return (
    <>
      {/* Embedded styles - consistent with other forms */}
      <style>{`
        #root{
          background-color: #ffffff;}
        .admin-dashboard-container {
          display: flex;
          min-height: 100vh;
          justify-content: center;
          align-items: center;
          background-color: #ffffff;
        }

        .main-content {
          flex-grow: 1;
          padding: 40px;
          color: #333;
          width: 100%;
          max-width: 700px;
          margin-top: -40px;
        }

        .admin-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .admin-header h2 {
          color: #007bff;
          font-size: 28px;
          margin-bottom: 10px;
        }

        .admin-header p {
          color: #666;
        }

        .admin-cards {
          display: flex;
          justify-content: center;
        }

        .admin-card {
          background-color: #f8f9fa;
          padding: 30px;
          border-radius: 15px;
          width: 100%;
          max-width: 500px;
          box-shadow: 8px 8px 16px #e0e0e0,
                     -8px -8px 16px #ffffff;
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.03);
        }

        .admin-card:hover {
          box-shadow: 5px 5px 12px #d9d9d9,
                     -5px -5px 12px #ffffff;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 15px;
          border: none;
          font-size: 16px;
          box-sizing: border-box;
          background-color: #f8f9fa;
          box-shadow: inset 3px 3px 6px #e0e0e0,
                      inset -3px -3px 6px #ffffff;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          box-shadow: inset 2px 2px 4px #d9d9d9,
                      inset -2px -2px 4px #ffffff;
        }

        .admin-button {
          background-color: #007bff;
          color: white;
          padding: 12px 25px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          margin-top: 10px;
          box-shadow: 4px 4px 8px #e0e0e0,
                     -4px -4px 8px #ffffff;
          transition: all 0.2s ease;
          width: 100%;
        }

        .admin-button:hover {
          background-color: #0069d9;
          box-shadow: 2px 2px 4px #d9d9d9,
                     -2px -2px 4px #ffffff;
        }

        .admin-button:active {
          box-shadow: inset 2px 2px 4px #0056b3,
                     inset -2px -2px 4px #007bff;
        }

        h3 {
          color: #007bff;
          text-align: center;
          margin-bottom: 20px;
        }

        .question-counter {
          color: #666;
          text-align: center;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .option-container {
          position: relative;
          margin-bottom: 15px;
        }

        .option-number {
          position: absolute;
          left: 10px;
          top: 12px;
          color: #666;
          font-weight: bold;
        }

        .option-input {
          width: 100%;
          padding: 12px 12px 12px 30px;
          border-radius: 10px;
          border: none;
          font-size: 16px;
          box-sizing: border-box;
          background-color: #f8f9fa;
          box-shadow: inset 3px 3px 6px #e0e0e0,
                      inset -3px -3px 6px #ffffff;
          transition: all 0.2s ease;
        }

        .option-input:focus {
          outline: none;
          box-shadow: inset 2px 2px 4px #d9d9d9,
                      inset -2px -2px 4px #ffffff;
        }

        .correct-answer-selector {
          margin-top: 20px;
          padding: 15px;
          background-color: #f0f8ff;
          border-radius: 10px;
          text-align: center;
        }

        .correct-answer-selector label {
          margin-right: 10px;
          color: #555;
        }

        .correct-answer-selector select {
          padding: 8px 12px;
          border-radius: 5px;
          border: 1px solid #ddd;
          background-color: white;
        }
      `}</style>

      {/* Component JSX */}
      <div className="admin-dashboard-container">
        <div className="main-content bg-white">
          <div className="admin-header animate__animated animate__fadeIn">
            <h2 className="ms-5 ps-5">
              <i className="bi bi-list-check me-2"></i>
              Multiple Choice Questions
            </h2>
            <p className="question-counter">
              Question {current + 1} of {formData.numQuestions}
            </p>
          </div>

          <div className="admin-cards animate__animated animate__fadeInUp">
            <div className="admin-card">
              <input
                className="form-input"
                placeholder="Enter your question here"
                value={q.question}
                onChange={e => setQ({ ...q, question: e.target.value })}
              />

              <h4>Options:</h4>
              {q.options.map((opt, i) => (
                <div className="option-container" key={i}>
                  <span className="option-number">{i + 1}.</span>
                  <input
                    className="option-input"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => {
                      const newOpts = [...q.options];
                      newOpts[i] = e.target.value;
                      setQ({ ...q, options: newOpts });
                    }}
                  />
                </div>
              ))}

              <div className="correct-answer-selector">
                <label>Correct Answer:</label>
                <select
                  value={q.correctAnswer}
                  onChange={e => setQ({ ...q, correctAnswer: parseInt(e.target.value) })}
                >
                  {q.options.map((_, i) => (
                    <option key={i} value={i + 1}>Option {i + 1}</option>
                  ))}
                </select>
              </div>

              <button className="admin-button" onClick={handleNext}>
                {questions.length + 1 === formData.numQuestions ? 
                  "Submit Test" : 
                  "Next Question"} 
                <i className={`bi bi-${questions.length + 1 === formData.numQuestions ? 'check' : 'arrow-right'} ms-1`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}