import { React, useRef, useState } from "react";

export default function Step1({ formData, setFormData, nextStep }) {
  const fileInputRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    success: false
  });

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleExcelUpload = async (file) => {
    const form = new FormData();
     form.append("Time", formData.duration); // or any time format
  form.append("TestName", formData.testName);
  form.append("TestType", formData.type); // "MCQ" or "Coding"
  form.append("TotalQuestions", formData.numQuestions);
    form.append("file", file);
    form.append("type", formData.type); // MCQ or Coding

    try {
      const response = await fetch("https://marqueebackend.onrender.com/admin/upload-excel", {
        method: "POST",
        body: form
      });

      if (!response.ok) {
        const error = await response.json();
        setModalContent({
          title: "Upload Failed",
          message: error.detail || "Failed to upload file",
          success: false
        });
        setShowModal(true);
        return;
      }

      const data = await response.json();
      setFormData({
        ...formData,
        questions: data.questions,
        numQuestions: data.questions.length
      });

      setModalContent({
        title: "Success!",
        message: `Uploaded ${data.questions.length} questions successfully!`,
        success: true
      });
      setShowModal(true);

    } catch (err) {
      console.error(err);
      setModalContent({
        title: "Error",
        message: "Something went wrong during upload.",
        success: false
      });
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Bootstrap CDN links - should be in your index.html */}
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
      />

      {/* Custom styles */}
      <style>{`
        .admin-card {
          background: linear-gradient(145deg, #f8f9fa, #ffffff);
          border-radius: 15px;
          border: none;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        
        .admin-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        
        .form-input {
          border-radius: 10px;
          border: 1px solid #e0e0e0;
          padding: 12px 15px;
          transition: all 0.3s;
        }
        
        .form-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.25rem rgba(0,123,255,0.15);
        }
        
        .upload-btn {
          background: linear-gradient(135deg, #007bff, #0062cc);
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,123,255,0.3);
        }
        
        .next-btn {
          background: linear-gradient(135deg, #28a745, #218838);
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .next-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(40,167,69,0.3);
        }
        
        .modal-header-success {
          background: linear-gradient(135deg, #28a745, #218838);
          color: white;
        }
        
        .modal-header-error {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
        }
        
        .modal-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
      `}</style>

      {/* Component JSX */}
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="w-100" style={{ maxWidth: "500px" }}>
          <div className="text-center mb-5 animate__animated animate__fadeIn">
            <h2 className="text-primary mb-3">
              <i className="bi bi-pencil-square me-2"></i>
              Step 1: Test Details
            </h2>
            <p className="text-muted">Enter details about the test you want to create</p>
          </div>

          <div className="admin-card p-4 animate__animated animate__fadeInUp">
            <input
              className="form-input form-control mb-3"
              placeholder="Test Name"
              value={formData.testName}
              onChange={(e) =>
                setFormData({ ...formData, testName: e.target.value })
              }
            />
            <input
              className="form-input form-control mb-3"
              placeholder="Duration (in minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
            />
            <select
              className="form-input form-select mb-3"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="">Select Type</option>
              <option value="MCQ">MCQ</option>
              <option value="Coding">Coding</option>
            </select>
            <input
              className="form-input form-control mb-3"
              placeholder="Number of Questions"
              type="number"
              value={formData.numQuestions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numQuestions: parseInt(e.target.value),
                })
              }
            />
            
            {formData.type && (
              <div className="mb-3">
                <button 
                  onClick={handleClick} 
                  className="upload-btn btn btn-primary w-100 text-white"
                >
                  <i className="bi bi-upload me-2"></i>
                  Upload {formData.type} Questions from Excel
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  style={{ display: 'none' }}
                  onChange={(e) => handleExcelUpload(e.target.files[0])}
                />
              </div>
            )}
            
            <button 
              className="next-btn btn btn-success w-100 text-white" 
              onClick={nextStep}
            >
              Next <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Status Modal */}
      <div 
        className={`modal fade ${showModal ? 'show' : ''}`} 
        style={{ display: showModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content overflow-hidden">
            <div className={`modal-header ${modalContent.success ? 'modal-header-success' : 'modal-header-error'}`}>
              <h5 className="modal-title">{modalContent.title}</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="modal-body text-center py-4">
              <i 
                className={`bi ${modalContent.success ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} modal-icon`}
              ></i>
              <p>{modalContent.message}</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className={`btn ${modalContent.success ? 'btn-success' : 'btn-danger'}`}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}