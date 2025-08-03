import { useState, useEffect } from "react";
import axios from "axios";
import RulesModal from "../components/RulesModal";

export default function TestEntrance() {
  const [tests, setTests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchAllTests = async () => {
      try {
        const response = await axios.get("https://marqueebackend.onrender.com/admin/tests"); // Call to your backend
        setTests(response.data);
      } catch (err) {
        console.error("Error fetching tests:", err);
      }
    };
    fetchAllTests();
  }, []);

  const handleStartTest = (test) => {
    setSelectedTest(test);
    setShowModal(true);
    
  };

  return (
    <div className="test-entrance-container">
      {tests.map((test, index) => (
        <div key={test._id} className="test-card animate__animated animate__fadeIn">
          <div className="test-header">
            <h2><i className="bi bi-journal-text me-2"></i>{test.TestName}</h2>
            <div className="test-badge">New</div>
          </div>

          <div className="test-details">
            <div className="test-info">
              <i className="bi bi-card-heading"></i>
              <span>{test.TestType} Test</span>
            </div>
            <div className="test-info">
              <i className="bi bi-clock"></i>
              <span>{test.Time} Minutes Duration</span>
            </div>
            <div className="test-info">
              <i className="bi bi-question-circle"></i>
              <span>{test.TotalQuestions} Questions</span>
            </div>
          </div>

          <button
            className="start-test-btn"
            onClick={() => handleStartTest(test)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className={hoveredIndex === index ? "animate__animated animate__pulse" : ""}>
              <i className="bi bi-arrow-right-circle me-2"></i>
              Start Test Now
            </span>
          </button>
        </div>
      ))}

      {showModal && <RulesModal test={selectedTest} onClose={() => setShowModal(false)} />}
    </div>
  );
}
