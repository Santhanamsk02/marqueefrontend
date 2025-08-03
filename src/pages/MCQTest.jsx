import React, { useEffect, useState,useRef } from 'react';
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
        }, 500);
    
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
    <div className="container mt-4 d-flex">
      <div  className='w-50'>
      <h2 className="text-center mb-4">MCQ Test</h2>

      <div className="alert alert-info text-center">
        Time Elapsed: {formatTime(timeTaken)}
      </div>

      {malpractice && (
        <div className="alert alert-danger text-center">
          ⚠️ Malpractice Detected - Submitting test...
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-center">
          <div className="spinner-border text-primary" />
          <p>Loading questions...</p>
        </div>
      ) : (
        <form className="mb-4">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="mb-4 p-3 border rounded " style={{background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
          boxShadow: '4px 4px 8px #d9d9d9, -4px -4px 8px #ffffff',}}>
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
            <h3>No Webcam Or Mic Detected</h3>
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
      <div style={{
      width: '40vw',
        height: '90vh',
        position: 'fixed',
      right:'100px',
      margin: '0.5rem auto',
      padding: '1rem',
      borderRadius: '16px',
      background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
      boxShadow: '10px 10px 20px #d9d9d9, -10px -10px 20px #ffffff',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        flexShrink: 0
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: '700',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Face & Speech Analyzer</h1>
        </div>
        </div>
        

      {warnings.length > 0 && (
        <div style={{
          padding: '0.5rem',
          marginBottom: '0.5rem',
          borderRadius: '8px',
          background: warnings.some(w => w.includes('🔴')) 
            ? 'linear-gradient(145deg, #fee2e2, #fecaca)' 
            : 'linear-gradient(145deg, #fef9c3, #fef08a)',
          boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)',
          borderLeft: warnings.some(w => w.includes('🔴')) 
            ? '3px solid #ef4444' 
            : '3px solid #f59e0b',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: warnings.some(w => w.includes('🔴')) ? '#ef4444' : '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.75rem',
              fontWeight: '600',
              color: warnings.some(w => w.includes('🔴')) ? '#b91c1c' : '#92400e'
            }}>
              {warnings.join(' • ')}
            </p>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '1rem',
        flexGrow: 1,
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '6px 6px 12px #d9d9d9, -6px -6px 12px #ffffff',
          height: '100%'
        }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{
              display: 'block',
              width: '400px',
              height: '350px',
              objectFit: 'cover',
              borderRadius: '12px'
            }}
            />
            <div style={{
            position: 'absolute',
            top:'1rem',
            left: '0.5rem',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.6rem',
            fontWeight: '500'
          }}>
            Live Analysis
          </div>
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '400px',
              height: '350px',
              borderRadius: '12px'
            }}
            /><div style={{
            marginTop:"50px",
          display: 'flex',
          gap: '1.3rem'
        }}>
          <div style={{
            padding: '0.5rem',
            borderRadius: '12px',
            background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
            boxShadow: '4px 4px 8px #d9d9d9, -4px -4px 8px #ffffff',
            textAlign: 'center',
            minWidth: '80px'
          }}>
            <p style={{
              margin: '0 0 0.2rem',
              fontSize: '1rem',
              color: '#64748b',
              fontWeight: '500'
            }}>Presence</p>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              color: getStatusColor(presencePercent),
              fontWeight: '700'
            }}>{presencePercent}%</h3>
          </div>
          
          <div style={{
            padding: '0.5rem',
            borderRadius: '12px',
            background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
            boxShadow: '4px 4px 8px #d9d9d9, -4px -4px 8px #ffffff',
            textAlign: 'center',
            minWidth: '80px'
          }}>
            <p style={{
              margin: '0 0 0.2rem',
              fontSize: '1rem',
              color: '#64748b',
              fontWeight: '500'
            }}>Attention</p>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              color: getStatusColor(focusPercent),
              fontWeight: '700'
            }}>{focusPercent}%</h3>
          </div>
          
          <div style={{
            padding: '0.5rem',
            borderRadius: '12px',
            background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
            boxShadow: '4px 4px 8px #d9d9d9, -4px -4px 8px #ffffff',
            textAlign: 'center',
            minWidth: '80px'
          }}>
            <p style={{
              margin: '0 0 0.2rem',
              fontSize: '1rem',
              color: '#64748b',
              fontWeight: '500'
            }}>Talking</p>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              color: getStatusColor(talkingPercent),
              fontWeight: '700'
            }}>{talkingPercent}%</h3>
          </div>
        </div>
      
          
        </div>

        <div style={{
          width: '200px',
          padding: '0.8rem',
          borderRadius: '12px',
          background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
          boxShadow: '4px 4px 8px #d9d9d9, -4px -4px 8px #ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          overflowY: 'auto'
        }}>
          <h3 style={{
            margin: '0 0 0.3rem',
            fontSize: '1rem',
            color: '#334155',
            fontWeight: '600'
          }}>Metrics</h3>
          
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.3rem'
            }}>
              <span style={{
                fontSize: '1rem',
                color: '#64748b'
              }}>Attention</span>
              <span style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: getStatusColor(focusPercent)
              }}>{focusPercent}%</span>
            </div>
            <div style={{
              height: '6px',
              borderRadius: '3px',
              background: '#e2e8f0',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${focusPercent}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${getStatusColor(focusPercent)}, ${getStatusColor(focusPercent)}80)`,
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.3rem'
            }}>
              <span style={{
                fontSize: '1rem',
                color: '#64748b'
              }}>Presence</span>
              <span style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: getStatusColor(presencePercent)
              }}>{presencePercent}%</span>
            </div>
            <div style={{
              height: '6px',
              borderRadius: '3px',
              background: '#e2e8f0',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${presencePercent}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${getStatusColor(presencePercent)}, ${getStatusColor(presencePercent)}80)`,
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.3rem'
            }}>
              <span style={{
                fontSize: '1rem',
                color: '#64748b'
              }}>Verbal</span>
              <span style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: getStatusColor(talkingPercent)
              }}>{talkingPercent}%</span>
            </div>
            <div style={{
              height: '6px',
              borderRadius: '3px',
              background: '#e2e8f0',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${talkingPercent}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${getStatusColor(talkingPercent)}, ${getStatusColor(talkingPercent)}80)`,
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          <div style={{
            marginTop: '0.5rem',
            padding: '0.6rem',
            borderRadius: '8px',
            background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
          boxShadow: '4px 4px 8px #d9d9d9, -4px -4px 8px #ffffff',
          }}>
            <h4 style={{
              margin: '0 0 0.3rem',
              fontSize: '1rem',
              color: '#334155',
              fontWeight: '600'
            }}>Guidelines</h4>
            <ul style={{
              margin: 0,
              paddingLeft: '1rem',
              fontSize: '0.85rem',
              color: '#64748b',
              lineHeight: '1.4'
            }}>
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
