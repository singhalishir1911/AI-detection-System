function startApp() {
  document.getElementById("landing").classList.remove("active");
  document.getElementById("formPage").classList.add("active");
}

document.getElementById("healthForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const inputs = document.querySelectorAll("#healthForm input, #healthForm select");

  const age = Number(inputs[0].value);
  const gender = inputs[1].value;
  const bpRaw = inputs[2].value.trim();
  const heightCm = Number(inputs[3].value);
  const weightKg = Number(inputs[4].value);
  const glucose = Number(inputs[5].value);

  const result = document.getElementById("result");

  /* ===== INPUT VALIDATION ===== */

  if (age <= 0 || age > 120) return showError("Age must be between 1 and 120.");

  const bpMatch = bpRaw.match(/^(\d{2,3})\/(\d{2,3})$/);
  if (!bpMatch) return showError("Blood Pressure must be in 120/80 format.");

  const systolic = Number(bpMatch[1]);
  const diastolic = Number(bpMatch[2]);

  if (
    systolic < 70 || systolic > 250 ||
    diastolic < 40 || diastolic > 150
  ) return showError("Blood Pressure values are not physiologically valid.");

  if (heightCm < 80 || heightCm > 250) return showError("Invalid height value.");
  if (weightKg < 20 || weightKg > 300) return showError("Invalid weight value.");
  if (glucose <= 0 || glucose > 500) return showError("Invalid glucose value.");

  /* ===== BMI CALCULATION ===== */

  const heightM = heightCm / 100;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);

  /* ===== AGE-AWARE BP ASSESSMENT (FRONTEND ONLY) ===== */

  let bpCategory = "Normal Blood Pressure";
  let bpAdvice = `
    <ul>
      <li>Maintain heart-healthy lifestyle habits.</li>
      <li>Continue routine blood pressure monitoring.</li>
    </ul>
  `;

  if (systolic < 90 || diastolic < 60) {
    bpCategory = "Low Blood Pressure";
    bpAdvice = `
      <ul>
        <li>Ensure adequate hydration and regular meals.</li>
        <li>Avoid sudden postural changes.</li>
      </ul>
    `;
  } else if (systolic >= 140 || diastolic >= 90) {
    bpCategory = age < 30
      ? "Mildly Elevated Blood Pressure (Age-adjusted)"
      : "High Blood Pressure";

    bpAdvice = `
      <ul>
        <li>Reduce dietary sodium and processed food intake.</li>
        <li>Increase physical activity and manage stress.</li>
        <li>Medical consultation is recommended if persistent.</li>
      </ul>
    `;
  } else if (systolic >= 130 || diastolic >= 80) {
    bpCategory = "Moderately Elevated Blood Pressure";
    bpAdvice = `
      <ul>
        <li>Adopt preventive lifestyle modifications.</li>
        <li>Monitor blood pressure periodically.</li>
      </ul>
    `;
  }

  /* ===== SEND DATA TO BACKEND (PRIMA MODEL) ===== */

  result.innerHTML = "<p>Analyzing data using AI model...</p>";
  result.classList.remove("hidden");

  try {
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age,
        glucose,
        bmi,
        blood_pressure: diastolic,
        insulin: 0,            // optional placeholder
        skin_thickness: 0,     // optional placeholder
        pregnancies: 0         // optional placeholder
      })
    });

    const data = await response.json();

    const diabetesRisk =
      data.diabetes_risk ||
      (data.prediction === 1 ? "High" : "Low");

    const probability = data.probability
      ? (data.probability * 100).toFixed(1)
      : "N/A";

    /* ===== DISPLAY FINAL RESULT ===== */

    result.innerHTML = `
      <h3>AI-Based Health Assessment</h3>

      <p><strong>Diabetes Risk:</strong> ${diabetesRisk}</p>
      <p><strong>Model Confidence:</strong> ${probability}%</p>

      <hr>

      <p><strong>Calculated BMI:</strong> ${bmi}</p>

      <hr>

      <p><strong>Blood Pressure Assessment:</strong> ${bpCategory}</p>
      <p><strong>Blood Pressure Guidance:</strong></p>
      ${bpAdvice}

      <hr>

      <small>
        ⚠️ Disclaimer: AI-based predictions are intended for educational and
        screening purposes only and do not replace professional medical diagnosis.
      </small>
    `;

  } catch (error) {
    showError("Unable to connect to AI prediction service.");
  }
});

/* ===== ERROR HANDLER ===== */
function showError(message) {
  const result = document.getElementById("result");
  result.innerHTML = `
    <h3 style="color:#dc2626;">Error</h3>
    <p>${message}</p>
  `;
  result.classList.remove("hidden");
}