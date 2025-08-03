import { useEffect, useState,useRef } from "react";
import * as yup from "yup";
import { useFormik } from "formik";


const studentSchema = yup.object().shape({
  name: yup.string(),
  rollno: yup.string(),
  username: yup.string(),
  password: yup.string().min(6, "Password must be at least 6 characters"),
  email: yup.string().email("Invalid email"),
  mobile: yup.string().matches(/^[0-9]{10}$/, "Invalid mobile number"),
  classSection: yup.string(),
  department: yup.string(),
  cgpa: yup.number().min(0, "CGPA must be at least 0").max(10, "CGPA cannot exceed 10"),
  regno: yup.string()
});

const departments = ["IT", "CSE", "AIML", "AIDS", "EEE", "ECE", "MECH", "CSBS"];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      name: "",
      rollno: "",
      username: "",
      password: "",
      email: "",
      mobile: "",
      classSection: "",
      department: "",
      cgpa: "",
      regno: ""
    },
    validationSchema: studentSchema,
    onSubmit: async (values) => {
      try {
        await fetch("https://marqueebackend.onrender.com/admin/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });
        setShowSuccessModal(true);
        formik.resetForm();
        fetchStudents();
      } catch (error) {
        console.error("Error adding student:", error);
      }
    }
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://marqueebackend.onrender.com/admin/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };
const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://marqueebackend.onrender.com/admin/students/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Upload failed");
      } else {
      
        setShowSuccessModal(true);
        fetchStudents();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
    }
  }

  const handleUploadClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  return (
    <div className="students-container">
      <div className="form-section">
        <h2 className="gradient-text">Manage Students</h2>
        
        <form onSubmit={formik.handleSubmit} className="student-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter full name"
              />
              {formik.touched.name && formik.errors.name && (
                <div className="error-message">{formik.errors.name}</div>
              )}
            </div>

            <div className="form-group">
              <label>Roll No</label>
              <input
                name="rollno"
                value={formik.values.rollno}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter roll number"
              />
              {formik.touched.rollno && formik.errors.rollno && (
                <div className="error-message">{formik.errors.rollno}</div>
              )}
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter username"
              />
              {formik.touched.username && formik.errors.username && (
                <div className="error-message">{formik.errors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter password"
              />
              {formik.touched.password && formik.errors.password && (
                <div className="error-message">{formik.errors.password}</div>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter email"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="error-message">{formik.errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                name="mobile"
                value={formik.values.mobile}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter mobile number"
              />
              {formik.touched.mobile && formik.errors.mobile && (
                <div className="error-message">{formik.errors.mobile}</div>
              )}
            </div>

            <div className="form-group">
              <label>Class & Section</label>
              <input
                name="classSection"
                value={formik.values.classSection}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Eg: 3A, 2B etc."
              />
              {formik.touched.classSection && formik.errors.classSection && (
                <div className="error-message">{formik.errors.classSection}</div>
              )}
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formik.values.department}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {formik.touched.department && formik.errors.department && (
                <div className="error-message">{formik.errors.department}</div>
              )}
            </div>

            <div className="form-group">
              <label>CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={formik.values.cgpa}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter CGPA"
              />
              {formik.touched.cgpa && formik.errors.cgpa && (
                <div className="error-message">{formik.errors.cgpa}</div>
              )}
            </div>

            <div className="form-group">
              <label>Registration No</label>
              <input
                name="regno"
                value={formik.values.regno}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter registration number"
              />
              {formik.touched.regno && formik.errors.regno && (
                <div className="error-message">{formik.errors.regno}</div>
              )}
            </div>
          </div>
          <div className="d-flex justify-content-end ">
            <button className="upload-csv-btn btn  me-4 submit-btn" onClick={(e) => { handleUploadClick(e) }}>
        <i className="bi bi-file-earmark-arrow-up-fill"></i> Upload from Excel
      </button>
      <input
        type="file"
        accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
          <button type="submit" className="submit-btn">
            Add Student
          </button>
          </div>
        
        </form>
      </div>

      <div className="students-list-section">
        <h3 className="gradient-text">Existing Students ({students.length})</h3>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="students-grid">
            {students.map((student, index) => (
              <div key={student._id} className="student-card animate__animated animate__fadeInUp" 
                style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="student-info">
                  <h4>{student.name}</h4>
                  <p>{student.department} - {student.classSection}</p>
                  <div className="student-meta">
                    <span>Roll: {student.rollno}</span>
                    <span>CGPA: {student.cgpa}</span>
                  </div>
                </div>
                <button 
                  className="view-details-btn"
                  onClick={() => handleViewDetails(student)}
                >
                  <i className="bi bi-eye-fill"></i> View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal-sadd animate__animated animate__zoomIn">
            <div className="success-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h3>Student Added Successfully!</h3>
            <p>The new student has been added to the database.</p>
            <button 
              className="close-modal-btn"
              onClick={() => setShowSuccessModal(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="student-details-modal animate__animated animate__zoomIn">
            <button className="close-btn" onClick={closeModal}>
              <i className="bi bi-x-lg"></i>
            </button>
            <div className="modal-header">
              <h3>{selectedStudent.name}</h3>
              <p className=" text-black">{selectedStudent.department} Department</p>
            </div>
            
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Username:</span>
                  <span className="detail-value">{selectedStudent.username}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Roll No:</span>
                  <span className="detail-value">{selectedStudent.rollno}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Registration No:</span>
                  <span className="detail-value">{selectedStudent.regno}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedStudent.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mobile:</span>
                  <span className="detail-value">{selectedStudent.mobile}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Class & Section:</span>
                  <span className="detail-value">{selectedStudent.classSection}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">CGPA:</span>
                  <span className="detail-value">{selectedStudent.cgpa}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}