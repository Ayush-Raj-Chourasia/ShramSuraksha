import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Get current weather for a city
router.get('/current/:city', async (req, res) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const city = req.params.city || 'Mumbai';
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric`
    );
    
    const data = response.data;
    
    // Check for parametric triggers
    const triggers = [];
    if (data.main.temp > 42) triggers.push({ type: 'extreme_heat', value: data.main.temp, unit: '°C' });
    if (data.rain && data.rain['1h'] > 30) triggers.push({ type: 'heavy_rainfall', value: data.rain['1h'], unit: 'mm/hr' });
    if (data.wind && data.wind.speed > 80) triggers.push({ type: 'storm', value: data.wind.speed, unit: 'km/h' });
    
    res.json({
      city: data.name,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0]?.description,
      icon: data.weather[0]?.icon,
      windSpeed: data.wind?.speed,
      rain1h: data.rain?.['1h'] || 0,
      visibility: data.visibility,
      triggers,
      raw: data
    });
  } catch (err) {
    // Fallback mock data if API fails
    res.json({
      city: req.params.city || 'Mumbai',
      temp: 34,
      feelsLike: 38,
      humidity: 78,
      description: 'partly cloudy',
      icon: '02d',
      windSpeed: 12,
      rain1h: 0,
      visibility: 6000,
      triggers: [],
      mock: true
    });
  }
});

// Get AQI for a city
router.get('/aqi/:city', async (req, res) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const city = req.params.city || 'Mumbai';
    
    // First get coordinates
    const geoRes = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},IN&limit=1&appid=${apiKey}`
    );
    
    if (geoRes.data.length === 0) throw new Error('City not found');
    
    const { lat, lon } = geoRes.data[0];
    
    const aqiRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    
    const aqi = aqiRes.data.list[0];
    const aqiValue = aqi.main.aqi;
    const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    
    // Simulated detailed AQI (OWM only gives 1-5 scale)
    const detailedAqi = aqiValue * 60 + Math.floor(Math.random() * 40);
    
    const triggers = [];
    if (detailedAqi > 200) triggers.push({ type: 'severe_aqi', value: detailedAqi, unit: 'AQI' });
    
    res.json({
      city,
      aqi: detailedAqi,
      category: aqiLabels[aqiValue - 1] || 'Unknown',
      components: aqi.components,
      triggers,
      healthAdvice: detailedAqi > 200 ? 'Mask advisory. Avoid outdoor work.' : 'Air quality acceptable.'
    });
  } catch (err) {
    // Fallback
    const mockAqi = Math.floor(Math.random() * 200) + 80;
    res.json({
      city: req.params.city || 'Mumbai',
      aqi: mockAqi,
      category: mockAqi > 200 ? 'Poor' : mockAqi > 100 ? 'Moderate' : 'Fair',
      triggers: mockAqi > 200 ? [{ type: 'severe_aqi', value: mockAqi, unit: 'AQI' }] : [],
      healthAdvice: mockAqi > 200 ? 'Mask advisory. Avoid outdoor work.' : 'Air quality acceptable.',
      mock: true
    });
  }
});

// Get forecast (3-day)
router.get('/forecast/:city', async (req, res) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const city = req.params.city || 'Mumbai';
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},IN&appid=${apiKey}&units=metric&cnt=24`
    );
    
    const forecasts = response.data.list.map(item => ({
      time: item.dt_txt,
      temp: Math.round(item.main.temp),
      description: item.weather[0]?.description,
      icon: item.weather[0]?.icon,
      rain: item.rain?.['3h'] || 0,
      windSpeed: item.wind?.speed
    }));
    
    res.json({ city: response.data.city.name, forecasts });
  } catch (err) {
    res.json({ city: req.params.city, forecasts: [], mock: true });
  }
});

export default router;
