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

  /* ===== BASIC VALIDATION ===== */

  if (age <= 0 || age > 120) return showError("Age must be between 1 and 120.");

  const bpMatch = bpRaw.match(/^(\d{2,3})\/(\d{2,3})$/);
  if (!bpMatch) return showError("Blood Pressure must follow format like 120/80.");

  const systolic = Number(bpMatch[1]);
  const diastolic = Number(bpMatch[2]);

  if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150)
    return showError("Blood Pressure values are outside valid physiological limits.");

  if (heightCm < 80 || heightCm > 250)
    return showError("Please enter a valid height in centimeters.");

  if (weightKg < 20 || weightKg > 300)
    return showError("Please enter a valid weight in kilograms.");

  if (glucose <= 0 || glucose > 500)
    return showError("Glucose value appears invalid.");

  /* ===== BMI CALCULATION ===== */

  const heightM = heightCm / 100;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);

  let bmiCategory = "Normal";
  let bmiAdvice = `
    <ul>
      <li>Maintain a balanced diet with adequate fruits, vegetables, and protein sources.</li>
      <li>Continue regular physical activity and healthy daily routines.</li>
    </ul>
  `;

  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    bmiAdvice = `
      <ul>
        <li>Increase calorie intake using nutrient-dense foods.</li>
        <li>Include adequate proteins, healthy fats, and complex carbohydrates.</li>
        <li>Ensure regular meals and sufficient rest.</li>
      </ul>
    `;
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = "Overweight";
    bmiAdvice = `
      <ul>
        <li>Adopt portion control and balanced meal planning.</li>
        <li>Increase physical activity and reduce sedentary time.</li>
        <li>Limit processed and high-sugar foods.</li>
      </ul>
    `;
  } else if (bmi >= 30) {
    bmiCategory = "Obese";
    bmiAdvice = `
      <ul>
        <li>Structured lifestyle modification is recommended.</li>
        <li>Engage in regular low-impact physical activity.</li>
        <li>Consult a healthcare professional for personalized guidance.</li>
      </ul>
    `;
  }

  /* ===== AGE-AWARE BP ASSESSMENT ===== */

  let bpCategory = "Normal Blood Pressure";
  let bpAdvice = `
    <ul>
      <li>Maintain heart-healthy dietary habits.</li>
      <li>Continue regular monitoring during routine checkups.</li>
    </ul>
  `;

  if (systolic < 90 || diastolic < 60) {
    bpCategory = "Low Blood Pressure";
    bpAdvice = `
      <ul>
        <li>Ensure adequate hydration and regular meals.</li>
        <li>Avoid sudden posture changes.</li>
        <li>Seek medical advice if symptoms occur.</li>
      </ul>
    `;
  } else if (systolic >= 140 || diastolic >= 90) {
    bpCategory = age < 30
      ? "Mildly Elevated Blood Pressure (Age-adjusted)"
      : "High Blood Pressure";

    bpAdvice = `
      <ul>
        <li>Reduce salt and processed food intake.</li>
        <li>Engage in consistent physical activity.</li>
        <li>Stress management and adequate sleep are recommended.</li>
        <li>Clinical consultation is advised for persistent elevation.</li>
      </ul>
    `;
  } else if (systolic >= 130 || diastolic >= 80) {
    bpCategory = "Moderately Elevated Blood Pressure";
    bpAdvice = `
      <ul>
        <li>Monitor blood pressure periodically.</li>
        <li>Adopt dietary and lifestyle improvements.</li>
        <li>Early preventive measures can improve outcomes.</li>
      </ul>
    `;
  }

  /* ===== GLUCOSE ADVICE ===== */

  let glucoseAdvice = `
    <ul>
      <li>Maintain stable meal timings and balanced nutrition.</li>
      <li>Limit excessive sugar and refined carbohydrate intake.</li>
    </ul>
  `;

  if (glucose > 200) {
    glucoseAdvice = `
      <ul>
        <li>Consult a healthcare professional for further evaluation.</li>
        <li>Adopt dietary control and physical activity.</li>
        <li>Regular monitoring is recommended.</li>
      </ul>
    `;
  }

  /* ===== FETCH DIABETES RISK FROM ML ===== */

  let diabetesRisk = "Unavailable";
  let diabetesAdvice = `
    <ul>
      <li>Maintain healthy dietary habits and physical activity.</li>
      <li>Periodic screening is advised.</li>
    </ul>
  `;

  try {
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age,
        glucose,
        bloodPressure: bpRaw,
        heightCm,
        weightKg
      })
    });

    const data = await response.json();
    diabetesRisk = data.diabetesRisk;

    if (diabetesRisk === "High") {
      diabetesAdvice = `
        <ul>
          <li>Consult a physician or endocrinologist promptly.</li>
          <li>Implement strict dietary control and daily exercise.</li>
          <li>Routine glucose monitoring is strongly recommended.</li>
        </ul>
      `;
    } else if (diabetesRisk === "Medium") {
      diabetesAdvice = `
        <ul>
          <li>Adopt preventive lifestyle modifications.</li>
          <li>Reduce refined carbohydrates and sugar intake.</li>
          <li>Follow-up screening is advised.</li>
        </ul>
      `;
    }
  } catch {
    diabetesRisk = "Prediction Service Unavailable";
  }

  /* ===== FINAL DISPLAY ===== */

  result.innerHTML = `
    <h3>Personalized Health Overview</h3>

    <p><strong>AI-Based Diabetes Risk:</strong> ${diabetesRisk}</p>
    ${diabetesAdvice}

    <hr>

    <p><strong>Glucose Guidance:</strong></p>
    ${glucoseAdvice}

    <hr>
    <p><strong>Calculated BMI:</strong> ${bmi} (${bmiCategory})</p>
    ${bmiAdvice}

    <hr>

    <p><strong>Blood Pressure Assessment:</strong> ${bpCategory}</p>
    ${bpAdvice}

    <hr>

    <small>
      ⚠️ This system provides educational insights and does not replace professional medical consultation.
    </small>
  `;

  result.classList.remove("hidden");
});

/* ===== ERROR HANDLER ===== */
function showError(message) {
  const result = document.getElementById("result");
  result.innerHTML = `
    <h3 style="color:#dc2626;">Input Error</h3>
    <p>${message}</p>
  `;
  result.classList.remove("hidden");
  /* ===== RESET RESULT ON INPUT CHANGE ===== */
const formInputs = document.querySelectorAll("#healthForm input, #healthForm select");

formInputs.forEach(input => {
  input.addEventListener("input", () => {
    const result = document.getElementById("result");
    result.classList.add("hidden");
    result.innerHTML = "";
  });
});
}