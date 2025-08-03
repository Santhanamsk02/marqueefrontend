import { useState } from "react";
import Step1 from "../components/Step1";
import MCQForm from "../components/MCQForm";
import CodingForm from "../components/CodingForm";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    testName: "",
    duration: "",
    type: "",
    numQuestions: 0,
    questions: []
  });

  const submitTest = async (data) => {
  const payload = {
    Time: data.duration,
    TestName: data.testName,
    TestType: data.type,
    TotalQuestions: data.numQuestions.toString(),
    MCQ: data.type === "MCQ"
      ? data.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        }))
      : [],
    Coding: data.type === "Coding"
      ? data.questions.map(q => ({
          question: q.title,
          expectedOutput: q.expected_output
        }))
      : []
  };

  console.log("Submitting test payload:", payload); // Debug log

  const response = await fetch("https://marqueebackend.onrender.com/admin/tests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error uploading test:", error);
    alert("Failed to upload test: " + error.detail);
    return;
  }

  alert("Test uploaded successfully!");
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Create Test</h2>
      {step === 1 && <Step1 formData={formData} setFormData={setFormData} nextStep={() => setStep(2)} />}
      {step === 2 && formData.type === "MCQ" && (
        <MCQForm formData={formData} setFormData={setFormData} submitTest={submitTest} />
      )}
      {step === 2 && formData.type === "Coding" && (
        <CodingForm formData={formData} setFormData={setFormData} submitTest={submitTest} />
      )}
    </div>
  );
}