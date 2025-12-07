"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const getLiveNPK = action({
  args: {
    sheetUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Default to the provided sheet if no URL is passed
    let SHEET_CSV_URL = args.sheetUrl || "https://docs.google.com/spreadsheets/d/1zPrbxe8NP2tovaqZLKKj0edoGIZGvjwXyZ_fbmMEefw/export?format=csv";
    
    // Helper to convert standard Google Sheet URL to CSV export URL
    if (args.sheetUrl) {
       const match = args.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
       if (match && match[1]) {
         SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
       }
    }

    try {
      const response = await fetch(SHEET_CSV_URL);
      if (!response.ok) throw new Error("Failed to fetch sheet");
      const text = await response.text();
      
      // Parse CSV
      const rows = text.split('\n').map(row => row.split(','));
      
      if (rows.length < 2) throw new Error("Sheet is empty");

      // Get headers to find indices (case insensitive)
      const headers = rows[0].map(h => h.trim().toLowerCase());
      const nIndex = headers.findIndex(h => h.includes('nitrogen'));
      const pIndex = headers.findIndex(h => h.includes('phosphorus'));
      const kIndex = headers.findIndex(h => h.includes('potassium'));
      
      if (nIndex === -1 || pIndex === -1 || kIndex === -1) {
        throw new Error("NPK columns not found in sheet");
      }

      // Find last valid row with data
      let lastRow = null;
      let prevRow = null;
      
      // Iterate backwards to find the latest data
      for (let i = rows.length - 1; i > 0; i--) {
        const row = rows[i];
        // Ensure row has enough columns and data is not empty
        if (row.length > Math.max(nIndex, pIndex, kIndex) && 
            row[nIndex]?.trim() && 
            row[pIndex]?.trim() && 
            row[kIndex]?.trim()) {
            
            if (!lastRow) {
                lastRow = row;
            } else {
                prevRow = row;
                break; // Found both last and previous rows
            }
        }
      }

      if (!lastRow) throw new Error("No valid data found in sheet");

      const n = parseFloat(lastRow[nIndex]);
      const p = parseFloat(lastRow[pIndex]);
      const k = parseFloat(lastRow[kIndex]);

      // Validate values
      if (isNaN(n) || isNaN(p) || isNaN(k)) {
        throw new Error("Invalid number format in NPK columns");
      }
      if (n < 0 || p < 0 || k < 0) {
        throw new Error("NPK values cannot be negative");
      }

      // Calculate trend if previous row exists
      let trendN: "up" | "down" = "up";
      let trendP: "up" | "down" = "up";
      let trendK: "up" | "down" = "up";

      if (prevRow) {
          const prevN = parseFloat(prevRow[nIndex]);
          const prevP = parseFloat(prevRow[pIndex]);
          const prevK = parseFloat(prevRow[kIndex]);
          
          trendN = n >= prevN ? "up" : "down";
          trendP = p >= prevP ? "up" : "down";
          trendK = k >= prevK ? "up" : "down";
      }

      return {
        n: Math.round(n * 10) / 10,
        p: Math.round(p * 10) / 10,
        k: Math.round(k * 10) / 10,
        timestamp: Date.now(),
        status: {
          n: n < 100 ? "Low" : n > 200 ? "High" : "Optimal",
          p: p < 100 ? "Low" : p > 200 ? "High" : "Optimal",
          k: k < 150 ? "Low" : k > 300 ? "High" : "Optimal",
        },
        trend: {
          n: trendN,
          p: trendP,
          k: trendK,
        },
        isFallback: false
      };

    } catch (error: any) {
      console.error("Error fetching sheet data, falling back to simulation:", error);
      
      // Fallback Simulation
      const n = 173 + (Math.random() * 4 - 2); 
      const p = 192 + (Math.random() * 4 - 2); 
      const k = 240 + (Math.random() * 4 - 2); 

      const getTrend = () => Math.random() > 0.5 ? "up" : "down";

      return {
        n: Math.round(n * 10) / 10,
        p: Math.round(p * 10) / 10,
        k: Math.round(k * 10) / 10,
        timestamp: Date.now(),
        status: {
          n: n < 100 ? "Low" : n > 200 ? "High" : "Optimal",
          p: p < 100 ? "Low" : p > 200 ? "High" : "Optimal",
          k: k < 150 ? "Low" : k > 300 ? "High" : "Optimal",
        },
        trend: {
          n: getTrend(),
          p: getTrend(),
          k: getTrend(),
        },
        isFallback: true,
        error: error.message || "Failed to fetch data"
      };
    }
  },
});