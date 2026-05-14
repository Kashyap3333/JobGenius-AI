// src/services/aiService.js

import API from "./api"; // reuse your existing Axios instance

/**
 * Fetches AI career insights from the backend.
 *
 * @param {string}   targetRole    - e.g. "Backend Developer"
 * @param {string[]} matchedSkills - e.g. ["Java", "Spring Boot"]
 * @param {string[]} missingSkills - e.g. ["SQL", "GitHub"]
 * @returns {Promise<string[]>} array of insight strings
 */
export async function fetchCareerInsights(
  targetRole,
  matchedSkills,
  missingSkills,
) {
  const res = await API.post("/api/ai/career-insights", {
    targetRole,
    matchedSkills,
    missingSkills,
  });
  return res.data; // { success, insights, error }
}
