"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const getWeather = action({
  args: {
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
        }
      }

      // Weather API Fetch (Open-Meteo)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error("Weather API failed");
      const weatherData = await weatherRes.json();

      // Helper to map WMO codes to Hindi conditions
      const getCondition = (code: number) => {
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

      const forecast = daily.time.map((time: string, index: number) => {
        const date = new Date(time);
        const dayName = date.toLocaleDateString('hi-IN', { weekday: 'long' });
        const code = daily.weather_code[index];
        const maxTemp = daily.temperature_2m_max[index];
        const minTemp = daily.temperature_2m_min[index];
        const avgTemp = (maxTemp + minTemp) / 2;
        
        return {
          day: dayName,
          temp: Math.round(avgTemp),
          condition: getCondition(code)
        };
      });

      return {
        temp: Math.round(current.temperature_2m),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        rainChance: Math.round(daily.precipitation_probability_max?.[0] ?? 0),
        condition: getCondition(current.weather_code),
        location: locationName,
        forecast: forecast
      };

    } catch (error) {
      console.error("Weather API Error, falling back to simulation:", error);
      
      // Fallback Simulation
      const temp = 24 + Math.random() * 5;
      const humidity = 60 + Math.random() * 20;
      const wind = 5 + Math.random() * 10;
      const rain = Math.random() * 30;

      const forecast = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayName = date.toLocaleDateString('hi-IN', { weekday: 'long' });
        const fTemp = 24 + Math.random() * 10 - 5; 
        const fRain = Math.random() * 100;
        
        let condition = "धूप";
        if (fRain > 60) condition = "बारिश";
        else if (fRain > 30) condition = "बादल";

        return {
          day: dayName,
          temp: Math.round(fTemp),
          condition: condition
        };
      });

      return {
        temp: Math.round(temp * 10) / 10,
        humidity: Math.round(humidity),
        windSpeed: Math.round(wind * 10) / 10,
        rainChance: Math.round(rain),
        condition: rain > 20 ? "बादल छाए रहेंगे" : "धूप",
        location: args.location || "IIT Dhanbad, Jharkhand",
        forecast: forecast
      };
    }
  },
});