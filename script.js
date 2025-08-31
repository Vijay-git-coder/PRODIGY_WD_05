const API_KEY = "YOUR_OPENWEATHER_API_KEY"; // <-- replace with your key
const BASE = "https://api.openweathermap.org/data/2.5/weather";

const $ = (id) => document.getElementById(id);
$("year").textContent = new Date().getFullYear();

const card = $("card");
const note = $("note");

function setNote(msg){ note.textContent = msg; }
function clearNote(){ note.textContent = "Tip: enable location permission, or type a city."; }

async function fetchAndRender(url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error(`API error ${res.status}`);
    const d = await res.json();
    render(d);
    clearNote();
  }catch(err){
    setNote(`⚠ ${err.message}. Check API key/city.`);
  }
}

async function fetchByCity(city){
  if(!city){ setNote("Please enter a city name."); return; }
  setNote(`Fetching weather for "${city}"…`);
  const url = `${BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  await fetchAndRender(url);
}

async function fetchByCoords(lat, lon){
  setNote("Fetching weather for your location…");
  const url = `${BASE}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  await fetchAndRender(url);
}

function render(d){
  $("cityName").textContent = d.name ?? "Unknown";
  $("country").textContent = d.sys?.country ? `(${d.sys.country})` : "";
  $("temp").textContent = `${Math.round(d.main?.temp)}°C`;
  $("feels").textContent = Math.round(d.main?.feels_like) + "°C";
  $("humidity").textContent = d.main?.humidity ?? "—";
  $("wind").textContent = d.wind?.speed ?? "—";
  $("pressure").textContent = d.main?.pressure ?? "—";
  $("desc").textContent = d.weather?.[0]?.description ?? "—";
  $("updated").textContent = `• updated ${new Date().toLocaleTimeString()}`;
  card.classList.remove("hidden");
}

// events
$("useLocation").addEventListener("click", ()=>{
  if(!navigator.geolocation){
    setNote("Geolocation not supported. Type a city instead.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    () => setNote("Permission denied. Type a city instead.")
  );
});

$("searchBtn").addEventListener("click", ()=>{
  const city = $("cityInput").value.trim();
  fetchByCity(city);
});

$("cityInput").addEventListener("keydown", (e)=>{
  if(e.key === "Enter") $("searchBtn").click();
});
