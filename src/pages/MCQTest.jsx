import React, { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';


function MCQTest() {
   const [examFinished, setExamFinished] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [malpractice, setMalpractice] = useState(false);
  const [malpracticeType, setMalpracticeType] = useState([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
    const [showPopup, setShowPopup] = useState(false);
      const [showCompletionPopup, setShowCompletionPopup] = useState(false);
    const videoRef = useRef();
      const canvasRef = useRef();
      const missCountRef = useRef(0);
      const [focusPercent, setFocusPercent] = useState(100);
      const [presencePercent, setPresencePercent] = useState(100);
      const [talkingPercent, setTalkingPercent] = useState(100);
      const [warnings, setWarnings] = useState([]);
      const hasSubmittedRef = useRef(false);
      const [deviceError, setDeviceError] = useState(null);
    
  
      useEffect(() => {
        const loadModels = async () => {
          const MODEL_URL = '/models';
          await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
          await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
          startVideo();
        };
    
        loadModels();
      }, []);
    
      const addWarning = (warning) => {
        setWarnings((prevWarnings) => {
          if (warning.includes('🔴')) {
            return [warning];
          }
          if (!prevWarnings.includes(warning)) {
            return [...prevWarnings, warning];
          }
          return prevWarnings;
        });
      };
  const handleMalpractice = async (type) => {
    if (examFinished || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    setMalpractice(true);
    setMalpracticeType(prev => [...new Set([...prev, type])]);
    setExamFinished(true);
    const username = localStorage.getItem("token");

    const results = questions.map((q, idx) => ({
      question: q.question,
      selected: answers[idx],
      correctAnswer: q.correctAnswer,
      success: answers[idx] == q.correctAnswer,
    }));

    await fetch("https://marqueebackend.onrender.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        results,
        timeTaken: Math.floor((Date.now() - startTime) / 1000),
        malpractice_type: [...new Set([...malpracticeType, type])],
        totalMarks: results.filter(r => r?.success).length,
        test_type: "MCQ",
        malpractice: type
      }),
    });

    setShowPopup(true);
    
    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }, 3000);
  };

    const handleMultiFace = async () => {
      if (examFinished) return;
      setMalpractice(true);
      setMalpracticeType(prev => [...new Set([...prev, "Multiple Faces Detected"])]);
      await handleMalpractice("MultiFace Detected");
    };

    const handleNotPresence = async () => {
      if (examFinished) return;
      setMalpractice(true);
      setMalpracticeType(prev => [...new Set([...prev, "SideView Copy"])]);
      await handleMalpractice("SideView Copy");
    }

    const handleSpeech = async () => {
      if (examFinished) return;
      setMalpractice(true);
      setMalpracticeType(prev => [...new Set([...prev, "Talking"])]);
      await handleMalpractice("Talking");
  }
      useEffect(() => {
        const interval = setInterval(() => {
          handleDetection();
        }, 1000);
    
        return () => clearInterval(interval);
      }, [focusPercent, presencePercent, talkingPercent]);
    
      const startVideo = () => {
        navigator.mediaDevices
          .getUserMedia({ video: { width: 640, height: 480 } })
          .then((stream) => {
            videoRef.current.srcObject = stream;
            setDeviceError(false);
          })
          .catch((err) => {
            console.error('Webcam error:', err);
        setDeviceError("Camera access denied or not available. Please enable it to continue the test.");
          });
      };
    
      const calculateFocus = (landmarks) => {
        const nose = landmarks.getNose()[3];
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
    
        if (!leftEye.length || !rightEye.length) return 0;
    
        const leftEyeCenterX = (leftEye[0].x + leftEye[3].x) / 2;
        const rightEyeCenterX = (rightEye[0].x + rightEye[3].x) / 2;
        const midEyeX = (leftEyeCenterX + rightEyeCenterX) / 2;
    
        const deviation = Math.abs(nose.x - midEyeX);
        let percent = 100 - deviation;
        return Math.max(0, Math.min(100, Math.round(percent)));
      };
    
      const handleDetection = async () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) {
      setDeviceError(true);
          return;
        }
    
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks(true);
    
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
        if (detections.length === 0) {
          missCountRef.current += 1;
          if (missCountRef.current >= 3) {
            if (presencePercent < 10) {
              handleNotPresence();
              addWarning('🔴 You are not present!');
            }
            else if (presencePercent < 40) {
              addWarning('🟡 Stay present!');
            }
            setFocusPercent(0);
            setPresencePercent((prev) => prev - 1);
          }
        } else {
          missCountRef.current = 0;
    
          if (detections.length > 1) {
            setFocusPercent(0);
            handleMultiFace();
            addWarning('🔴 Multiple Faces detected');
          } else {
            const detection = detections[0];
            const landmarks = detection.landmarks;
    
            const focus = calculateFocus(landmarks);
            setFocusPercent(focus);
    
            
            if (focus <= 87)
            {
              setPresencePercent((prev)=>prev-3)
            }
          
            const mouth = landmarks.getMouth();
            const topLip = mouth[13];
            const bottomLip = mouth[19];
            const lipDistance = Math.abs(topLip.y - bottomLip.y);
            const isTalking = lipDistance > 8.7;
    
            if (isTalking) {
              setTalkingPercent((prev) => Math.max(0, prev - 3));
            }
    
            if (presencePercent < 10) {
              handleNotPresence();
              addWarning('🔴 You are not present!');
            } else if (presencePercent < 40) {
              addWarning('🟡 Stay present!');
            }
    
            if (talkingPercent < 10) {
              handleSpeech();
              addWarning('🔴 You are talking excessively!');
            } else if (talkingPercent < 40) {
              addWarning('🟡 You are talking a bit much!');
            }
    
            if (focus <= 10) {
              addWarning('🔴 You are not focusing!');
            } else if (focus <= 40) {
              addWarning('🟡 Please stay focused');
            }
          }
        }
    
        const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
        const resized = faceapi.resizeResults(detections, dims);
        faceapi.draw.drawDetections(canvasRef.current, resized);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      };
    
      const getStatusColor = (percent) => {
        if (percent > 70) return '#4ade80'; // Green
        if (percent > 40) return '#fbbf24'; // Yellow
        return '#f87171'; // Red
      };

  useEffect(() => {
    fetch("https://marqueebackend.onrender.com/admin/mcqquestions")
      .then(res => res.json())
      .then(data => setQuestions(data[0].MCQ));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTimeTaken(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (qIndex, optionIndex) => {
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };
  useEffect(() => {
  let recognition;

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript.toLowerCase();
        console.log(transcript)
      }

      console.log('Transcript:', transcript);
      if (transcript.match(/\b(program|code|input|output|print)\b/)) {
        addWarning('🔴 Programming terms spoken!');
      }
    };

    recognition.onerror = (e) => console.error('Speech error:', e.error);
    recognition.onend = () => recognition.start(); // restart on end

    recognition.start();
  };

  document.addEventListener("click", startRecognition, { once: true });

  return () => {
    if (recognition) recognition.stop();
  };
}, []);
useEffect(() => {
  const goFullscreen = () => {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  // Add listener for first click
  document.addEventListener("click", goFullscreen);

  return () => document.removeEventListener("click", goFullscreen);
}, []);

  const handleSubmit = async () => {
    const username = localStorage.getItem("token");
    setShowCompletionPopup(true);
    
    const results = questions.map((q, idx) => ({
      question: q.question,
      selected: answers[idx],
      correctAnswer: q.correctAnswer,
      success: answers[idx] == q.correctAnswer,
    }));

    await fetch("https://marqueebackend.onrender.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        results,
        timeTaken,
        malpractice_type: [...new Set(malpracticeType)],
        totalMarks: results.filter(r => r?.success).length,
        test_type: "MCQ",
        malpractice: false
      }),
    });

    localStorage.removeItem("token");
    setExamFinished(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }, 3000);
  };

 

  useEffect(() => {
    const handleCopy = (e) => {
      if (examFinished) return;
      e.preventDefault();
      handleMalpractice("Copy");
    };
    const handleBlur = () => {
      if (examFinished) return;
      handleMalpractice("Tab Switch");
    };

     document.addEventListener("copy", handleCopy);
    window.addEventListener("blur", handleBlur);

       
    return () => {
      document.removeEventListener("copy", handleCopy);
          window.removeEventListener("blur", handleBlur);
    };
  });

  return (
    <div className="container">
      <div className="test-container">
        <h2 className="text-center mb-4">MCQ Test</h2>

        <div className="time-display">
          Time Elapsed: {formatTime(timeTaken)}
        </div>

        {malpractice && (
          <div className="alert alert-danger text-center">
            ⚠️ Malpractice Detected - Submitting test...
          </div>
        )}

        {questions.length === 0 ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" />
            <p>Loading questions...</p>
          </div>
        ) : (
          <form className="mb-4">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="question-card-mcq">
                <h5>Q{qIndex + 1}. {q.question}</h5>
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`question-${qIndex}`}
                      id={`q${qIndex}-option${oIndex}`}
                      checked={answers[qIndex] == oIndex}
                      onChange={() => handleSelect(qIndex, oIndex)}
                    />
                    <label className="form-check-label" htmlFor={`q${qIndex}-option${oIndex}`}>
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            ))}

            <div className="text-center">
              <button type="button" className="btn btn-success px-4 py-2" onClick={handleSubmit}>
                Submit Test
              </button>
            </div>
          </form>
        )}

        {showPopup && (
          <div className={`malpractice-modal visible`}>
            <div className="modal-content animate__animated animate__headShake">
              <div className="modal-icon">
                <i className="bi bi-exclamation-octagon"></i>
              </div>
              <h3>Malpractice Detected!</h3>
              <p>Your test has been flagged for suspicious activity:</p>
              <ul>
                {malpracticeType.map((type, i) => (
                  <li key={i}>{type}</li>
                ))}
              </ul>
              <p>Your test is being submitted automatically.</p>
              <div className="countdown">
                Redirecting in 3 seconds...
              </div>
            </div>
          </div>
        )}
        
        {deviceError && (
          <div className={`malpractice-modal visible`}>
            <div className="modal-content animate__animated animate__headShake">
              <div className="modal-icon">
                <i className="bi bi-exclamation-octagon"></i>
              </div>
              <h3>No WebCam Or Mic Detected</h3>
              <p>Please Ensure You Have A Proper WebCam or Mic And Switch On Both Of Them Please</p>
              <p>Your test is being Hold</p>
            </div>
          </div>
        )}
        
        {showCompletionPopup && (
          <div className={`completion-modal visible`}>
            <div className="modal-content animate__animated animate__fadeIn">
              <div className="modal-icon">
                <i className="bi bi-check-circle-fill text-success"></i>
              </div>
              <h3>Test Completed Successfully!</h3>
              <p>Thank you for taking the test. Your responses have been submitted.</p>
              <div className="countdown">
                You will be redirected to login page in 3 seconds...
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="analyzer-container">
        <div className="analyzer-header">
          <div>
            <h1 className="analyzer-title">Face & Speech Analyzer</h1>
          </div>
        </div>
        
        {warnings.length > 0 && (
          <div className={`warning-container ${warnings.some(w => w.includes('🔴')) ? 'warning-red' : 'warning-yellow'}`}>
            <div className="warning-content">
              <div className={`warning-icon ${warnings.some(w => w.includes('🔴')) ? 'icon-red' : 'icon-yellow'}`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <p className="warning-text">
                {warnings.join(' • ')}
              </p>
            </div>
          </div>
        )}

        <div className="analyzer-main">
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="video-element"
            />
            <div className="video-label">
              Live Analysis
            </div>
            <canvas
              ref={canvasRef}
              className="canvas-element"
            />
            <div className="metrics-container">
              <div className="metric-box">
                <p className="metric-label">Presence</p>
                <h3 className="metric-value" style={{ color: getStatusColor(presencePercent) }}>
                  {presencePercent}%
                </h3>
              </div>
              
              <div className="metric-box">
                <p className="metric-label">Attention</p>
                <h3 className="metric-value" style={{ color: getStatusColor(focusPercent) }}>
                  {focusPercent}%
                </h3>
              </div>
              
              <div className="metric-box">
                <p className="metric-label">Talking</p>
                <h3 className="metric-value" style={{ color: getStatusColor(talkingPercent) }}>
                  {talkingPercent}%
                </h3>
              </div>
            </div>
          </div>

          <div className="stats-panel">
            <h3 className="stats-title">Metrics</h3>
            
            <div className="stat-item">
              <div className="stat-label">
                <span className="stat-name">Attention</span>
                <span className="stat-value" style={{ color: getStatusColor(focusPercent) }}>
                  {focusPercent}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${focusPercent}%`,
                  background: `linear-gradient(90deg, ${getStatusColor(focusPercent)}, ${getStatusColor(focusPercent)}80)`,
                }}></div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">
                <span className="stat-name">Presence</span>
                <span className="stat-value" style={{ color: getStatusColor(presencePercent) }}>
                  {presencePercent}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${presencePercent}%`,
                  background: `linear-gradient(90deg, ${getStatusColor(presencePercent)}, ${getStatusColor(presencePercent)}80)`,
                }}></div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">
                <span className="stat-name">Verbal</span>
                <span className="stat-value" style={{ color: getStatusColor(talkingPercent) }}>
                  {talkingPercent}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${talkingPercent}%`,
                  background: `linear-gradient(90deg, ${getStatusColor(talkingPercent)}, ${getStatusColor(talkingPercent)}80)`,
                }}></div>
              </div>
            </div>
            
            <div className="guidelines-box">
              <h4 className="guidelines-title">Guidelines</h4>
              <ul className="guidelines-list">
                <li>Maintain eye contact</li>
                <li>Single person visible</li>
                <li>Minimize talking</li>
                <li>Good lighting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MCQTest;