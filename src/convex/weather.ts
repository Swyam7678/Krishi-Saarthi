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

    return {
      temp: Math.round(temp * 10) / 10,
      humidity: Math.round(humidity),
      windSpeed: Math.round(wind * 10) / 10,
      rainChance: Math.round(rain),
      condition: rain > 20 ? "बादल छाए रहेंगे" : "धूप",
      location: "IIT Dhanbad, Jharkhand"
    };
  },
});