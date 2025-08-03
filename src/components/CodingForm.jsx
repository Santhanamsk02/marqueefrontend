import { useState } from "react";

export default function CodingForm({ formData, setFormData, submitTest }) {
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [q, setQ] = useState({
    title: "",
    expected_output: ""
  });

  const handleNext = () => {
    const updated = [...questions, q];
    setQuestions(updated);
    setQ({ title: "", expected_output: "" });

    if (updated.length === formData.numQuestions) {
      submitTest({ ...formData, questions: updated });
    } else {
      setCurrent(current + 1);
    }
  };

  return (
    <>
      {/* Embedded styles - same as Step1 */}
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

        .form-textarea {
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
          min-height: 150px;
          resize: vertical;
        }

        .form-textarea:focus {
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
      `}</style>

      {/* Component JSX */}
      <div className="admin-dashboard-container">
        <div className="main-content bg-white">
          <div className="admin-header animate__animated animate__fadeIn">
            <h2 className="ms-5 ps-5">
              <i className="bi bi-code-square me-2"></i>
              Coding Questions
            </h2>
            <p className="question-counter">
              Question {current + 1} of {formData.numQuestions}
            </p>
          </div>

          <div className="admin-cards animate__animated animate__fadeInUp">
            <div className="admin-card">
              <input
                className="form-input"
                placeholder="Question Title"
                value={q.title}
                onChange={e => setQ({ ...q, title: e.target.value })}
              />
              <textarea
                className="form-textarea"
                placeholder="Expected Output"
                value={q.expected_output}
                onChange={e => setQ({ ...q, expected_output: e.target.value })}
              ></textarea>
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