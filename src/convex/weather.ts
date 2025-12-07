"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const getWeather = action({
  args: {
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // In a real app, we would use process.env.OPENWEATHER_API_KEY
    // For now, we will simulate realistic weather data if no key is present or just return mock data
    // to ensure the UI works beautifully for the user immediately.
    
    // Mock data for "Live" feel
    const temp = 24 + Math.random() * 5; // 24-29 degrees
    const humidity = 60 + Math.random() * 20; // 60-80%
    const wind = 5 + Math.random() * 10; // 5-15 km/h
    const rain = Math.random() * 30; // 0-30% chance

    return {
      temp: Math.round(temp * 10) / 10,
      humidity: Math.round(humidity),
      windSpeed: Math.round(wind * 10) / 10,
      rainChance: Math.round(rain),
      condition: rain > 20 ? "Cloudy" : "Sunny",
      location: args.location || "New Delhi, India"
    };
  },
});
