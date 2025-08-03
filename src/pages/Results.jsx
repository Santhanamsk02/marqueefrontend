import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import * as XLSX from "xlsx"; 

export default function Results() {
  const handleExport = () => {
  if (!selectedStudent || !selectedStudent.details) return;
    console.log(selectedStudent.details)
    const worksheetData = selectedStudent.details.map((res, index) => (
      {
        "title": res?.title,        
        "code": res?.code,    
        "expected_output": res?.expected_output,    
        "language": res?.language,
        "output": res?.output,
        "success": res?.success,
        "timeTaken": res?.timeTaken,
        "Malpractice": res?.malpractice ? "Yes" : "No",
        "Malpractice Type": res?.malpractice_type.join(", ") || "N/A"
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  XLSX.writeFile(workbook, `${selectedStudent.username}_Results.xlsx`);
  };

  const handleCategoryExport = (studentsData) => {
     if (!studentsData) return;
    console.log(studentsData)
    const worksheetData = studentsData.map((res, index) => (
      {
        "username":res.username,
        "malpractice": res.malpractice,
        "submitted_at": res.submitted_at,
        "test_type": res.test_type,
        "total_marks": res.total_marks,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  XLSX.writeFile(workbook, `ExtractedData.xlsx`);
  }
  
    const [codingMark, setCodingMark] = useState('');
  const [mcqMark, setMcqMark] = useState('');
  const [top, setTop] = useState('');
  const [extractStudents, setExtractedStudents] = useState([]);

  const handleFilter = () => {
    const filtered = results.filter(student => {
      const hasNoMalpractice = !student.malpractice || student.malpractice === false;
      const isCodingPassed =
        student.test_type === 'Coding' && student.total_marks >= parseInt(codingMark);
      const isMcqPassed =
        student.test_type === 'MCQ' && student.total_marks >= parseInt(mcqMark);

      return hasNoMalpractice && (isCodingPassed || isMcqPassed);
    });

    const sorted = filtered.sort((a, b) => a.total_marks - b.total_marks);
    setExtractedStudents(sorted.slice(0, parseInt(top)));
  };
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  useEffect(() => {
    fetch("https://marqueebackend.onrender.com/admin/results")
      .then((res) => res.json())
      .then((data) => setResults(data));
  }, []);

  const totalStudents = results.length;
  const nonMalpracticeStudents = results.filter(s => s.malpractice === false || s.malpractice === undefined);
  const mcqMalpractice = results.filter(
    (r) => r.test_type === "MCQ" && r.malpractice && r.malpractice !== false
  );
  const codingMalpractice = results.filter(
    (r) => r.test_type === "Coding" && r.malpractice && r.malpractice !== false
  );

  const openCategoryDetails = (category) => {
    setSelectedCategory(category);
    if (category === "Total") {
      setFilteredStudents(results);
    } else if (category === "MCQ Malpractice") {
      setFilteredStudents(mcqMalpractice);
    } else if (category === "Coding Malpractice") {
      setFilteredStudents(codingMalpractice);
    }
    else if (category === "Non Malpractice Students") {
      setFilteredStudents(nonMalpracticeStudents);
    }
  };

  const openStudentDetails = (student) => {
    console.log(student.details);
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const barData = results.map((r) => ({
    name: r.username,
    marks: r.total_marks,
  }));

  const COLORS = ["#007bff", "#ff6384", "#36a2eb", "#ffc107", "#8e44ad"];

  const malpracticeStats = results.reduce((acc, r) => {
    const type = r.malpractice || "None";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(malpracticeStats).map(([key, value]) => ({
    name: key,
    value,
  }));

  return (
    <div className="results-dashboard p-4">
      <h2 className="text-center fw-bold mb-4">Student Test Dashboard</h2>
      <div className="row text-center mb-5">
        <div className="col-md-3">
          <div className="info-card shadow-sm rounded-4 p-4 animate-pop">
            <h6 className="text-muted">Total Students Attempted</h6>
            <h4 className="fw-bold text-primary">{totalStudents}</h4>
            <button
              className="btn btn-outline-primary mt-3"
              onClick={() => openCategoryDetails("Total")}
            >
              View Details
            </button>
          </div>
        </div>
        <div className="col-md-3">
          <div className="info-card shadow-sm rounded-4 p-4 animate-pop">
            <h6 className="text-muted">Non Malpractice Students</h6>
            <h4 className="fw-bold text-primary">{nonMalpracticeStudents.length}</h4>
            <button
              className="btn btn-outline-primary mt-3"
              onClick={() => openCategoryDetails("Non Malpractice Students")}
            >
              View Details
            </button>
          </div>
        </div>
        <div className="col-md-3">
          <div className="info-card shadow-sm rounded-4 p-4 animate-pop">
            <h6 className="text-muted">MCQ Malpractices</h6>
            <h4 className="fw-bold text-danger">{mcqMalpractice.length}</h4>
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() => openCategoryDetails("MCQ Malpractice")}
            >
              View Details
            </button>
          </div>
        </div>
        <div className="col-md-3">
          <div className="info-card shadow-sm rounded-4 p-4 animate-pop">
            <h6 className="text-muted">Coding Malpractices</h6>
            <h4 className="fw-bold text-danger">{codingMalpractice.length}</h4>
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() => openCategoryDetails("Coding Malpractice")}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Student List Section */}
      {selectedCategory && (
        <div className="student-list-section mb-5">
          <h4 className="mb-3">
            {selectedCategory} - Students ({filteredStudents.length})
          </h4>
          <div className="card shadow-sm">
            <div className="card-body">
              {filteredStudents.length === 0 ? (
                <p className="text-center text-muted">No students found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Test Type</th>
                        <th>Marks</th>
                        <th>Malpractice</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student, index) => {
                          
                        return(
                        <tr key={index}>
                          <td>{student.username}</td>
                          <td>{student.test_type}</td>
                          <td>{student.total_marks}</td>
                          <td>
                            {student.malpractice ? (
                              <span className="badge bg-danger">
                                {student.malpractice}
                              </span>
                            ) : (
                              <span className="badge bg-success">None</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openStudentDetails(student)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      )
                      } )}
                    </tbody>
                    </table>
                     <button className="btn btn-success mt-3 mb-4" onClick={() => { handleCategoryExport(filteredStudents) }}>
                Export to Excel
            </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
 <div className="container mt-5">
      <h2 className="mb-4">Top Students Filter</h2>
      <div className="row mb-3">
        <div className="col-md-4">
          <label>Coding Marks Greater Than</label>
          <input
            type="number"
            className="form-control"
            value={codingMark}
            onChange={e => setCodingMark(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label>MCQ Marks Greater Than</label>
          <input
            type="number"
            className="form-control"
            value={mcqMark}
            onChange={e => setMcqMark(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label>Top N Students</label>
          <input
            type="number"
            className="form-control"
            value={top}
            onChange={e => setTop(e.target.value)}
          />
        </div>
      </div>
      <button className="btn btn-primary mb-4" onClick={handleFilter}>Filter Students</button>

        {extractStudents.length > 0 && (
          <>
        <table className="table table-bordered table-striped table-hover">
          <thead>
            <tr>
              <th>S.no</th>
              <th>Username</th>
              <th>Test Type</th>
              <th>Total Marks</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {extractStudents.map((student, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{student.username}</td>
                <td>{student.test_type}</td>
                <td>{student.total_marks}</td>
                <td><button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openStudentDetails(student)}
                            >
                              View Details
                            </button></td>
              </tr>
            ))}
            </tbody>
          </table>
            <button className="btn btn-success mt-3 mb-4" onClick={() => { handleCategoryExport(extractStudents) }}>
                Export to Excel
            </button>
            </>
      )}
    </div>
      {/* Chart Row */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="chart-card p-4 rounded-4">
            <h5 className="fw-semibold mb-3">📊 Total Marks per Student</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="marks" fill="#007bff" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="chart-card p-4 rounded-4">
            <h5 className="fw-semibold mb-3">🚨 Malpractice Breakdown</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {selectedStudent.username} - Test Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowStudentDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p><strong>Test Type:</strong> {selectedStudent.test_type}</p>
                    <p><strong>Total Marks:</strong> {selectedStudent.total_marks}</p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Malpractice:</strong>{" "}
                      {selectedStudent.malpractice ? (
                        <span className="text-danger">
                          {selectedStudent.malpractice}
                        </span>
                      ) : (
                        "None"
                      )}
                    </p>
                    <p>
                      <strong>Submitted At:</strong>{" "}
                      {new Date(selectedStudent.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <h5 className="mb-3">Test Details:</h5>
                {selectedStudent.details.map((detail, index) => (
                  <div key={index} className="card mb-3">
                    <div className="card-body">
                      {selectedStudent.test_type === "Coding" && detail ?  (
                        <>
                          <h6 className="card-title">{detail.title}</h6>
                          <p><strong>Language:</strong> {detail.language}</p>
                          <p><strong>Expected Output:</strong> {detail.expected_output}</p>
                          {detail.output && <p><strong>Actual Output:</strong> {detail.output}</p>}
                          <p>
                            <strong>Status:</strong>{" "}
                            {detail.success ? (
                              <span className="text-success">Success</span>
                            ) : (
                              <span className="text-danger">Failed</span>
                            )}
                          </p>
                          {detail.malpractice && (
                            <p className="text-danger">
                              <strong>Malpractice:</strong> {detail.malpractice_type.join(", ")}
                            </p>
                          )}
                          <p><strong>Time Taken:</strong> {detail.timeTaken} seconds</p>
                          {detail.code && (
                            <div className="mt-2">
                              <h6>Code:</h6>
                              <pre className="bg-light p-2 rounded">{detail.code}</pre>
                            </div>
                          )}
                        </>
                      ) : detail ?(
                        <>
                          <h6 className="card-title">Question: {detail.question}</h6>
                          <p><strong>Correct Answer:</strong> {detail.correctAnswer}</p>
                          {detail.selected!=null && (
                            <p><strong>Selected Answer:</strong> {detail.selected}</p>
                          )}
                          <p>
                            <strong>Status:</strong>{" "}
                            {detail.success ? (
                              <span className="text-success">Correct</span>
                            ) : (
                              <span className="text-danger">Incorrect</span>
                            )}
                          </p>
                        </>
                      ):<></>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer d-flex">
                <button className="btn btn-success mt-3" onClick={handleExport}>
                Export to Excel
              </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowStudentDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}