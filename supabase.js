// supabase.js

const supabaseUrl = "https://vfzyenkbmccasevhgypr.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmenllbmtibWNjYXNldmhneXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY1NTAyMDUsImV4cCI6MjAyMjEyNjIwNX0.DHkrqOGJjb4QAXaqayUfis4CtPjBW-0cnzDYg3IGubc";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Отображение результатов при загрузке страницы
displayResults();

async function saveDataToSupabase(
  sum,
  hours,
  result,
  com,
  additionalValue,
  hourlySalary,
  additionalResult,
  additionalBrut,
  additionalNalog
) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  const { data, error } = await supabaseClient.from("peon").upsert([
    {
      sum,
      hours,
      result,
      com,
      hourlySalary,
      additionalValue,
      date: formattedDate,
      ADtotal: additionalResult,
      ADbrut: additionalBrut,
      ADnalog: additionalNalog,
      bigtotal: hourlySalary + additionalNalog,
    },
  ]);

  if (error) {
    console.error("Error saving data to Supabase:", error.message);
    alert("An error occurred while saving data to the database.");
  } else {
    // Дополнительные действия при успешном сохранении данных
  }
}
