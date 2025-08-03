import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Test from "./pages/Test";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Students";
import Results from "./pages/Results";

import Dashboard from "./pages/Dashboard";
import MultiStepForm from "./pages/MultistepForm";
import MCQTest from "./pages/MCQTest";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <Test />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/students" element={<Students />} />
<Route path="/admin/results" element={<Results />} />
        <Route path="/admin/questions" element={<MultiStepForm/>} />
        <Route path="/test" element={<Test />} />
        <Route path="/mcqtest" element={<MCQTest/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
