import React, { useEffect, useState,useRef } from 'react';
import * as faceapi from 'face-api.js';


function Test() {
  const [information, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
const [warnings, setWarnings] = useState([]);

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [malpractice, setMalpractice] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [malpracticeType, setMalpracticeType] = useState([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [results, setResults] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [showPopup, setShowPopup] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();
  const missCountRef = useRef(0);
  const [focusPercent, setFocusPercent] = useState(100);
  const [presencePercent, setPresencePercent] = useState(100);
  const [talkingPercent, setTalkingPercent] = useState(100);
  const hasSubmittedRef = useRef(false);
  const [deviceError, setDeviceError] = useState(null);


  useEffect(() => {
    fetch("https://marqueebackend.onrender.com/admin/codingquestions")
      .then(res => res.json())
      .then(data => setQuestions(data[0].Coding));
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

    
    document.removeEventListener("click", goFullscreen);
  };

  // Add listener for first click
  document.addEventListener("click", goFullscreen);

  return () => document.removeEventListener("click", goFullscreen);
}, []);

  const submitAndLogout = async (detectedType) => {
  if (hasSubmittedRef.current || examFinished) return;
    hasSubmittedRef.current = true;
    
    setShowPopup(true);
    
    const username = localStorage.getItem("token");
   
    const resultData = {
      title: information[index].question,
      language,
      expected_output: information[index].expectedOutput,
      success: false,
      malpractice: true,
      malpractice_type: [...new Set([...malpracticeType, detectedType])],
      timeTaken: Math.floor((Date.now() - startTime) / 1000),

    };
     
    const newResults = [...results];
    newResults[index] = resultData;

    await fetch("https://marqueebackend.onrender.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, results: newResults,totalMarks: newResults.filter(r => r?.success).length,test_type:"Coding",malpractice:detectedType })
    });
    setExamFinished(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }, 3000);

  };
  useEffect(() => {
    let timer = setInterval(() => setTimeTaken(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);


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
        }

        console.log('Transcript:', transcript);
        if (transcript.match(/\b(program|code|input|output|print)\b/)) {
          addWarning("🔴 Programming terms spoken! Don't Speak");
        }
      };

      recognition.onerror = (e) => console.error('Speech error:', e.error);
      recognition.onend = () => recognition.start(); // restart on end

      recognition.start();
    };

    document.addEventListener("click", startRecognition, { once: true });

    return () => {
      if (recognition) recognition.stop();
    }
  },[])

  useEffect(() => {
    const handleCopy = async (e) => {
      e.preventDefault();
      if (examFinished) return;
      setMalpractice(true);
      setMalpracticeType(prev => [...new Set([...prev, "Copy"])]);
      await submitAndLogout("Copy");
    };

    const handleBlur = async (e) => {
      if (examFinished) return;
      setMalpractice(true);
      setMalpracticeType(prev => [...new Set([...prev, "Tab Switch"])]);
      await submitAndLogout("Tab Switch");
    };

     document.addEventListener("copy", handleCopy);
      window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("copy", handleCopy);
      window.removeEventListener("blur", handleBlur);
    };

  });

   useEffect(() => {
    const interval = setInterval(() => {
      handleDetection();
    }, 500);

    return () => clearInterval(interval);
   }, [focusPercent, presencePercent, talkingPercent]);
  
  

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 470, height: 340 } })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setDeviceError(false);
      })
      .catch((err) => {
        console.error('Webcam error:', err);
        setDeviceError("Camera access denied or not available. Please enable it to continue the test.");
      }
      );
  };

  const handleMultiFace = async () => {
      if (examFinished) return;
      setMalpractice(true);
      setMalpracticeType(prev => [...new Set([...prev, "Multiple Faces Detected"])]);
      await submitAndLogout("MultiFace Detected");
    };

    const handleNotPresence = async () => {
      if (examFinished) return;
      setMalpractice(true);
      setMalpracticeType(prev => [...new Set([...prev, "SideView Copy"])]);
      await submitAndLogout("SideView Copy");
  }
  const handleCameraOff = async () => {
      if (examFinished) return;
      setMalpractice(true);
      setMalpracticeType(prev => [...new Set([...prev, "Camera Off"])]);
      await submitAndLogout("Camera Off");
    }

    const handleSpeech = async () => {
      if (examFinished) return;
      setMalpractice(true);
      setMalpracticeType(prev => [...new Set([...prev, "Talking With Others"])]);
      await submitAndLogout("Talking");
  }
  
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
    if (!videoRef.current || videoRef.current.readyState !== 4 || !videoRef.current.videoWidth) {
      setDeviceError(true);
      return;
    }
    setDeviceError(false);
    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks(true);

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (detections.length === 0) {
      missCountRef.current += 1;
      if (missCountRef.current >= 3) {
        if (presencePercent < 10) {
           handleCameraOff();
          addWarning('🔴 You are not present!');
        }
        else if (presencePercent < 40) {
        addWarning('🟡 Stay present!');
      }
        setFocusPercent(0);
        setPresencePercent((prev) => prev - 2);
      }
      
    } else {
      missCountRef.current = 0;

      if (detections.length > 1) {
        setFocusPercent(0);
        addWarning('🔴 Multiple Faces detected');
        handleMultiFace();
      } else {
        const detection = detections[0];
        const landmarks = detection.landmarks;

        const focus = calculateFocus(landmarks);
        setFocusPercent(focus);
        
        if (focus <= 87)
        {
        setPresencePercent(presencePercent-3);
          
        }

        const mouth = landmarks.getMouth();
        const topLip = mouth[13];
        const bottomLip = mouth[19];
        const lipDistance = Math.abs(topLip.y - bottomLip.y);
        const isTalking = lipDistance > 8.5;

        if (isTalking) {
          setTalkingPercent((prev) => Math.max(0, prev - 2));
        }

        if (presencePercent < 10) {
          addWarning('🔴 You are not present!');
          handleNotPresence();
        } else if (presencePercent < 40) {
          addWarning('🟡 Stay present!');
        }

        if (talkingPercent < 10) {
          addWarning('🔴 You are talking excessively!');
          handleSpeech();
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
  }

  const getStatusColor = (percent) => {
    if (percent > 70) return '#4ade80'; // Green
    if (percent > 40) return '#fbbf24'; // Yellow
    return '#f87171'; // Red
  };

  const handleCompile = async () => {
    const endTime = Date.now();
    const question = information[index];
    

    const res = await fetch("https://marqueebackend.onrender.com/compile", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        expected_output: question.expectedOutput
      })
    });

    const data = await res.json();
    console.log(data);
    if (data.error == "")
    {
    setOutput(data.success ? " ✅"+data.output : " ❌"+data.output);
    }
    else
    {
    setOutput(data.success ? " ✅"+data.output : " ❌"+data.error);

    }

    const questionTime = Math.floor((endTime - startTime) / 1000);

    const resultData = {
      title: information[index].question,
      code,
      language,
      expected_output: information[index].expectedOutput,
      output: data.output,
      success: data.success,
      malpractice,
      malpractice_type: malpracticeType,
      timeTaken: questionTime
    };

    const newResults = [...results];
    newResults[index] = resultData;
    setResults(newResults);

    setStartTime(Date.now());
  };

  
  

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuestionChange = (newIndex) => {
    setIndex(newIndex);
    setOutput("");
    setCode("")
  };

    

  const handleFinishExam = async () => {
    const username = localStorage.getItem("token");
    await fetch("https://marqueebackend.onrender.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username, results: results,totalMarks: results.filter(r => r?.success).length,test_type:"Coding",malpractice:false
       })
    });
    
    setShowCompletionPopup(true);
    setExamFinished(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }, 4000);
  };

  return (
    <div className="test-container">
    
      <div className="header-bar">
        <div className="time-display">
          <i className="bi bi-clock"></i> {formatTime(timeTaken)}
        </div>
        {malpractice && (
          <div className="malpractice-alert">
            <i className="bi bi-exclamation-triangle"></i> Malpractice Detected
          </div>
        )}
      </div>

      <div className="main-content">
        {information.length > 0 ? (
          <div className="row g-4">
            <div className="col-md-5">
              <div className="question-card glass-card">
                <h3 className="question-title">
                  Question {index + 1} of {information.length} 
                </h3>
                <div className="txt">
                  {information[index].question}
                </div>
                <div className="output-container">
                  <h5>Output:</h5>
                  <pre className={`output ${output.includes("✅") ? 'success' : output.includes("❌") ? 'error' : ''}`}>
                    {output || "Your output will appear here..."}
                  </pre>
                </div>
              </div>
            </div>

            <div className="col-md-7">
              <div className="code-editor-container glass-card">
                <div className="editor-header">
                  <select 
                    className="form-select language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="c">C</option>
                  </select>
                  
                  <button 
                    className="btn btn-primary compile-btn"
                    onClick={handleCompile}
                  >
                    <i className="bi bi-play-fill"></i> Run Code
                  </button>
                </div>
                
                <textarea
                  className="code-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Write your ${language} code here...`}
                />
              </div>
            </div>
            <div className='facescan'>
              <div style={{
      maxWidth: '90vw',
      height: '45vh',
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
              width: '470px',
              height: '340px',
              objectFit: 'cover',
                borderRadius: '12px',
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '470px',
              height: '340px',
              borderRadius: '12px'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '0.5rem',
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
              </div>
              <div style={{
                  display: 'flex',
                  alignItems:"center",
          gap: '2rem'
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
              fontSize: '1.2rem',
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
              fontSize: '1.2rem',
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
            }}>Speech</p>
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              color: getStatusColor(talkingPercent),
              fontWeight: '700'
            }}>{talkingPercent}%</h3>
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
                fontSize: '0.75rem',
                color: '#64748b'
              }}>Attention</span>
              <span style={{
                fontSize: '0.75rem',
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
                fontSize: '0.75rem',
                color: '#64748b'
              }}>Presence</span>
              <span style={{
                fontSize: '0.75rem',
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
                fontSize: '0.75rem',
                color: '#64748b'
              }}>Verbal</span>
              <span style={{
                fontSize: '0.75rem',
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
              fontSize: '0.75rem',
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
        ) : (
          <div className="loading-placeholder">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading questions...</p>
          </div>
        )}
      </div>

      <div className="navigation-footer">
        <button 
          className="btn btn-outline-primary"
          disabled={index === 0}
          onClick={() => handleQuestionChange(index - 1)}
        >
          <i className="bi bi-arrow-left"></i> Previous
        </button>
        
        <button 
          className="btn btn-success"
          onClick={handleFinishExam}
        >
          <i className="bi bi-check-circle"></i> Finish Exam
        </button>
        
        <button 
          className="btn btn-outline-primary"
          disabled={index === information.length - 1}
          onClick={() => handleQuestionChange(index + 1)}
        >
          Next <i className="bi bi-arrow-right"></i>
        </button>
      </div>

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
  );
}

export default Test;