import { useState, useEffect } from "react";


export default function RulesModal({ onClose, test }) {
  const [isVisible, setIsVisible] = useState(false);
  const [acceptHover, setAcceptHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleAccept = () => {
    
    setTimeout(() => {
      onClose();
      if (test?.TestType === "MCQ") {
      window.location.href = "/mcqtest";
    } else {
      window.location.href = "/test"; // for coding or any other type
    }
    }, 300);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div className={`modal-backdrop ${isVisible ? 'visible' : ''}`}>
      <div className={`modal-container ${isVisible ? 'visible' : ''}`}>
        <div className="modal-glass">
          <div className="modal-header">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <h2>Test Rules & Regulations</h2>
          </div>
          
          <div className="modal-body">
            <ul className="rules-list">
              <li className="animate__animated animate__fadeInRight">
                <i className="bi bi-lock-fill"></i>
                <span>No tab switching allowed</span>
              </li>
              <li className="animate__animated animate__fadeInRight" style={{ animationDelay: '0.1s' }}>
                <i className="bi bi-clipboard-x-fill"></i>
                <span>No copy-paste actions</span>
              </li>
              <li className="animate__animated animate__fadeInRight" style={{ animationDelay: '0.2s' }}>
                <i className="bi bi-door-closed-fill"></i>
                <span>Leaving the test page results in disqualification</span>
              </li>
              <li className="animate__animated animate__fadeInRight" style={{ animationDelay: '0.3s' }}>
                <i className="bi bi-1-circle-fill"></i>
                <span>Only one attempt is allowed</span>
              </li>
              <li className="animate__animated animate__fadeInRight" style={{ animationDelay: '0.4s' }}>
                <i className="bi bi-shield-exclamation"></i>
                <span>Any malpractice will lead to elimination</span>
              </li>
            </ul>
            
            <div className="warning-box animate__animated animate__pulse animate__infinite">
              <i className="bi bi-exclamation-diamond-fill"></i>
              <span>Violating any rule will automatically submit your test!</span>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className={`cancel-btn ${cancelHover ? 'hover' : ''}`}
              onClick={handleCancel}
              onMouseEnter={() => setCancelHover(true)}
              onMouseLeave={() => setCancelHover(false)}
            >
              {cancelHover ? (
                <span className="animate__animated animate__headShake">Cancel</span>
              ) : (
                <span>Cancel</span>
              )}
            </button>
            <button 
              className={`accept-btn ${acceptHover ? 'hover' : ''}`}
              onClick={handleAccept}
              onMouseEnter={() => setAcceptHover(true)}
              onMouseLeave={() => setAcceptHover(false)}
            >
              {acceptHover ? (
                <span className="animate__animated animate__pulse">Accept & Start Test</span>
              ) : (
                <span>Accept & Start Test</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}