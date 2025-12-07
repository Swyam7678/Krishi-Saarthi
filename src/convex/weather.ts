"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const getWeather = action({
  args: {
    location: v.optional(v.string()),
    lang: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lang = args.lang || 'hi';
    try {
      let lat = 23.8143;
      let lon = 86.4412;
      let locationName = "IIT Dhanbad, Jharkhand";

      if (args.location) {
        // Geocoding API to get coordinates
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.location)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        
        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
          locationName = `${geoData.results[0].name}, ${geoData.results[0].country}`;
        } else {
          throw new Error("Location not found");
        }
      }

      // Weather API Fetch (Open-Meteo) - Added past_days=30 and precipitation_sum
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,relative_humidity_2m_mean&timezone=auto&past_days=30`;
      
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error("Weather API failed");
      const weatherData = await weatherRes.json();

      // Helper to map WMO codes to Hindi/English conditions
      const getCondition = (code: number) => {
        if (lang === 'en') {
            if (code === 0) return "Clear";
            if (code >= 1 && code <= 3) return "Cloudy";
            if (code >= 45 && code <= 48) return "Fog";
            if (code >= 51 && code <= 67) return "Rain";
            if (code >= 71 && code <= 77) return "Snow";
            if (code >= 80 && code <= 82) return "Showers";
            if (code >= 95 && code <= 99) return "Thunderstorm";
            return "Clear";
        }
        // Hindi (Default)
        if (code === 0) return "धूप (Clear)";
        if (code >= 1 && code <= 3) return "बादल (Cloudy)";
        if (code >= 45 && code <= 48) return "कोहरा (Fog)";
        if (code >= 51 && code <= 67) return "बारिश (Rain)";
        if (code >= 71 && code <= 77) return "बर्फ (Snow)";
        if (code >= 80 && code <= 82) return "तेज़ बारिश (Showers)";
        if (code >= 95 && code <= 99) return "तूफान (Thunderstorm)";
        return "साफ़ (Clear)";
      };

      const current = weatherData.current;
      const daily = weatherData.daily;
      const todayStr = new Date().toISOString().split('T')[0];

      const forecast: any[] = [];
      const history: any[] = [];
      const alerts: string[] = [];

      // Generate Alerts based on current conditions
      if (lang === 'en') {
        if (current.temperature_2m > 40) alerts.push("Heatwave Alert");
        else if (current.temperature_2m > 35) alerts.push("High Temperature Alert");
        if (current.temperature_2m < 5) alerts.push("Cold Wave Alert");
        if (current.precipitation > 50) alerts.push("Heavy Rain Alert");
        else if (current.precipitation > 10) alerts.push("Rain Expected");
        if (current.wind_speed_10m > 30) alerts.push("High Wind Alert");
        if (current.relative_humidity_2m > 90) alerts.push("High Humidity: Risk of fungal diseases.");
      } else {
        if (current.temperature_2m > 40) alerts.push("अत्यधिक गर्मी की चेतावनी (Heatwave Alert)");
        else if (current.temperature_2m > 35) alerts.push("गर्मी की चेतावनी: तापमान अधिक है।");
        if (current.temperature_2m < 5) alerts.push("शीत लहर की चेतावनी (Cold Wave Alert)");
        if (current.precipitation > 50) alerts.push("भारी बारिश की चेतावनी (Heavy Rain Alert)");
        else if (current.precipitation > 10) alerts.push("बारिश की संभावना है।");
        if (current.wind_speed_10m > 30) alerts.push("तेज़ हवाओं की चेतावनी (High Wind Alert)");
        if (current.relative_humidity_2m > 90) alerts.push("उच्च आर्द्रता: फफूंद रोगों का खतरा।");
      }

      daily.time.forEach((time: string, index: number) => {
        const date = new Date(time);
        const dayName = date.toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', { weekday: 'long' });
        const shortDate = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const code = daily.weather_code[index];
        const maxTemp = daily.temperature_2m_max[index];
        const minTemp = daily.temperature_2m_min[index];
        const avgTemp = (maxTemp + minTemp) / 2;
        const rainSum = daily.precipitation_sum[index];
        const humidity = daily.relative_humidity_2m_mean ? daily.relative_humidity_2m_mean[index] : 0;

        const item = {
          date: time,
          day: dayName,
          shortDate,
          temp: Math.round(avgTemp),
          maxTemp: Math.round(maxTemp),
          minTemp: Math.round(minTemp),
          rain: rainSum,
          humidity: Math.round(humidity),
          condition: getCondition(code)
        };

        if (time < todayStr) {
          history.push(item);
        } else {
          forecast.push(item);
        }
      });

      return {
        temp: Math.round(current.temperature_2m),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        rainChance: Math.round(daily.precipitation_probability_max?.[forecast.length > 0 ? daily.time.indexOf(forecast[0].date) : 0] ?? 0),
        condition: getCondition(current.weather_code),
        location: locationName,
        forecast: forecast.slice(0, 7), // Next 7 days
        history: history, // Past 30 days
        alerts: alerts
      };

    } catch (error: any) {
      if (error.message === "Location not found") {
        throw new Error("Location not found");
      }
      console.error("Weather API Error, falling back to simulation:", error);
      
      // Fallback Simulation
      const temp = 24 + Math.random() * 5;
      const humidity = 60 + Math.random() * 20;
      const wind = 5 + Math.random() * 10;
      const rain = Math.random() * 30;

      const generateDays = (count: number, isPast: boolean) => {
        return Array.from({ length: count }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + (isPast ? -count + i : i));
          const dayName = date.toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', { weekday: 'long' });
          const shortDate = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          const fTemp = 24 + Math.random() * 10 - 5; 
          const fRain = Math.random() * 20;
          const fHumidity = 50 + Math.random() * 40;
          
          let condition = lang === 'en' ? "Sunny" : "धूप";
          if (fRain > 10) condition = lang === 'en' ? "Rain" : "बारिश";
          else if (fRain > 5) condition = lang === 'en' ? "Cloudy" : "बादल";

          return {
            date: date.toISOString().split('T')[0],
            day: dayName,
            shortDate,
            temp: Math.round(fTemp),
            maxTemp: Math.round(fTemp + 5),
            minTemp: Math.round(fTemp - 5),
            rain: Math.round(fRain),
            humidity: Math.round(fHumidity),
            condition: condition
          };
        });
      };

      const alerts = [];
      if (temp > 35) alerts.push(lang === 'en' ? "Heat Alert (Simulation)" : "गर्मी की चेतावनी (Simulation)");
      if (rain > 10) alerts.push(lang === 'en' ? "Rain Expected (Simulation)" : "बारिश की संभावना (Simulation)");

      return {
        temp: Math.round(temp * 10) / 10,
        humidity: Math.round(humidity),
        windSpeed: Math.round(wind * 10) / 10,
        rainChance: Math.round(rain),
        condition: rain > 20 ? (lang === 'en' ? "Cloudy" : "बादल छाए रहेंगे") : (lang === 'en' ? "Sunny" : "धूप"),
        location: args.location || "IIT Dhanbad, Jharkhand",
        forecast: generateDays(7, false),
        history: generateDays(30, true),
        alerts: alerts
      };
    }
  },
});