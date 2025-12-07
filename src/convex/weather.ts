"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const getWeather = action({
  args: {
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const temp = 24 + Math.random() * 5;
    const humidity = 60 + Math.random() * 20;
    const wind = 5 + Math.random() * 10;
    const rain = Math.random() * 30;

    const forecast = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      // Get Hindi day name
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
      location: "IIT Dhanbad, Jharkhand",
      forecast: forecast
    };
  },
});