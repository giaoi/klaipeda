let myChart;

function showError() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
    setTimeout(() => (input.style.backgroundColor = ""), 1000);
  });
}

function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const statusBarMeta = document.getElementById("statusBarStyle");

  body.classList.toggle("dark-theme");
  themeToggle.src = body.classList.contains("dark-theme")
    ? "./logo-black.ico"
    : "./logo.ico";
  statusBarMeta.setAttribute(
    "content",
    body.classList.contains("dark-theme") ? "black" : "white",
  );
}

async function calculateSalary() {
  const sumInput = document.getElementById("sum").value;
  const hoursInput = document.getElementById("hours").value;
  const additionalValueInput = document.getElementById("additionalValue").value;

  const sum = parseFloat(sumInput);
  const hours = parseFloat(hoursInput);
  const additionalValue = parseFloat(additionalValueInput);

  if (isNaN(sum) || isNaN(hours) || isNaN(additionalValue)) {
    showError();
    return;
  }

  let brut, result, com;
  if (sum === 0 && hours === 0) {
    brut = 38.5 * 15.75;
    result = brut - 0.21 * brut;
    com = 0;
  } else {
    const y = hours * 15.75;
    const z = y * 2;
    const t = sum - z;
    com = t - 0.6 * t;
    const w = com + y;
    brut = w;
    result = w - 0.21 * w;
  }

  const additionalResult = additionalValue + result;
  const additionalBrut = additionalValue + brut;
  const additionalNalog = additionalValue + 0.21 * brut + result;

  let hourlySalary =
    sum === 0 && hours === 0 ? 15.75 : hours !== 0 ? brut / hours : 0;
  if (!isFinite(hourlySalary)) hourlySalary = 0;

  await saveDataToSupabase(
    sum,
    hours,
    result,
    com,
    additionalValue,
    hourlySalary,
    additionalResult,
    additionalBrut,
    additionalNalog,
  );
  await fetchResults();
  displayResults();
  await updateChart();
}

async function displayResults() {
  try {
    const { data, error } = await supabaseClient
      .from("peon")
      .select("*")
      .order("id", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Supabase:", error.message);
      showError();
      return;
    }

    const resultsList = document.getElementById("resultsList");
    const resultsList2 = document.getElementById("resultsList2");
    const resultsList3 = document.getElementById("resultsList3");
    const hourlySalaryResult1 = document.getElementById("hourlySalaryResult1");
    const hourlySalaryResult2 = document.getElementById("hourlySalaryResult2");

    resultsList.innerHTML = "";
    resultsList2.innerHTML = "";
    resultsList3.innerHTML = "";

    if (data.length >= 2) {
      const firstEntry = data[1];
      hourlySalaryResult2.textContent = `Hourly (Prev): $${(firstEntry.bigtotal / firstEntry.hours).toFixed(2)}`;
      hourlySalaryResult1.textContent = `Hourly: $${firstEntry.hourlySalary.toFixed(2)}`;
    }

    data.forEach((entry, index) => {
      const listItem = document.createElement("li");
      listItem.classList.add(index === 1 ? "blueunderline" : "redunderline");
      listItem.innerHTML = `
        <strong>Total</strong>: $${entry.sum}<br>
        <strong>Hours</strong>: ${entry.hours}<br>
        <strong>Commission</strong>: $${entry.com.toFixed(2)}<br>
        <strong>Salary</strong>: $${entry.result.toFixed(2)}<br>
        <strong>Grand Total</strong>: $${entry.ADtotal.toFixed(2)}
      `;
      if (index < 1) resultsList.appendChild(listItem);
      else if (index < 2) resultsList2.appendChild(listItem.cloneNode(true));
      else resultsList3.appendChild(listItem.cloneNode(true));
    });
  } catch (error) {
    console.error("Error:", error.message);
    showError();
  }
}

function createChart(results) {
  const labels = results.map((result) => `$${result.sum}, ${result.hours}h`);
  const data = results.map((result) =>
    result.result ? result.result.toFixed(2) : 0,
  );
  const ADtotalData = results.map((result) =>
    result.ADtotal ? result.ADtotal.toFixed(2) : 0,
  );
  const additionalValue = results.map((result) =>
    result.additionalValue ? result.additionalValue.toFixed(2) : 0,
  );

  const ctx = document.getElementById("myChart").getContext("2d");
  if (myChart) myChart.destroy();

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Salary",
          data: data,
          borderColor: "rgba(2, 132, 199, 1)",
          backgroundColor: "rgba(2, 132, 199, 0.2)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "rgba(2, 132, 199, 1)",
        },
        {
          label: "Total",
          data: ADtotalData,
          borderColor: "rgba(249, 115, 22, 1)",
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "rgba(249, 115, 22, 1)",
        },
        {
          label: "Tips",
          data: additionalValue,
          borderColor: "rgba(16, 185, 129, 1)",
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "rgba(16, 185, 129, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            font: { family: "Quicksand", size: 14 },
            color: document.body.classList.contains("dark-theme")
              ? "#F9FAFB"
              : "#1F2937",
          },
        },
        tooltip: {
          backgroundColor: document.body.classList.contains("dark-theme")
            ? "#374151"
            : "#FFFFFF",
          titleFont: { family: "Quicksand" },
          bodyFont: { family: "Quicksand" },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: { family: "Quicksand" },
            color: document.body.classList.contains("dark-theme")
              ? "#F9FAFB"
              : "#1F2937",
          },
          grid: {
            color: document.body.classList.contains("dark-theme")
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          },
        },
        x: {
          ticks: {
            font: { family: "Quicksand" },
            color: document.body.classList.contains("dark-theme")
              ? "#F9FAFB"
              : "#1F2937",
          },
          grid: {
            display: false,
          },
        },
      },
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
    },
  });
}

async function fetchResults() {
  const { data, error } = await supabaseClient
    .from("peon")
    .select("sum, hours, result, date, ADtotal, additionalValue")
    .order("id", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching data from Supabase:", error.message);
  } else {
    createChart(data.reverse());
  }
}

async function updateChart() {
  await fetchResults();
}

const quitDate = new Date("2024-08-27T10:00:00");

function calculateDays() {
  const now = new Date();
  const diff = now - quitDate;
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  document.getElementById("elapsedTime").innerHTML = `
    <strong><p>${totalDays} Days Smoke-Free</p></strong>
  `;
}

calculateDays();
window.onload = fetchResults;
