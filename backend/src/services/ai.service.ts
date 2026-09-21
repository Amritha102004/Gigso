import { ENV } from "../config/env.config";
import {
  IAIService,
  GigMatchInput,
  ApplicantMatchInput,
  ApplicantMatchResult,
} from "../interfaces/services/ai.service.interface";

export class AIService implements IAIService {
  private genAIClient: any = null;

  constructor() {
    this.initGeminiClient();
  }

  private async initGeminiClient() {
    if (!ENV.GEMINI_API_KEY) {
      return;
    }
    try {
      // Dynamic import to handle environments gracefully
      const { GoogleGenAI } = await import("@google/genai");
      this.genAIClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    } catch (err) {
      console.warn("Could not initialize @google/genai SDK, will use heuristic engine:", err);
    }
  }

  public async matchApplicants(
    gig: GigMatchInput,
    applicants: ApplicantMatchInput[]
  ): Promise<ApplicantMatchResult[]> {
    if (!applicants || applicants.length === 0) {
      return [];
    }

    // Attempt to use Google Gemini if API key is present
    if (ENV.GEMINI_API_KEY) {
      try {
        if (!this.genAIClient) {
          const { GoogleGenAI } = await import("@google/genai");
          this.genAIClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
        }

        const aiResults = await this.matchWithGemini(gig, applicants);
        if (aiResults && aiResults.length > 0) {
          return aiResults;
        }
      } catch (err: any) {
        console.warn(
          "Gemini AI processing encountered an issue, falling back to intelligent heuristic engine:",
          err?.message || err
        );
      }
    }

    // Fallback heuristic scoring
    return this.fallbackHeuristicMatching(gig, applicants);
  }

  private async matchWithGemini(
    gig: GigMatchInput,
    applicants: ApplicantMatchInput[]
  ): Promise<ApplicantMatchResult[]> {
    const prompt = `
You are an expert AI Talent Matchmaker & Fit Evaluator for event and gig staffing platform Gigso.
Evaluate how well each applicant fits the gig requirements.
Generate objective match scores (0 to 100), key candidate strengths, fit recommendations, and a concise 1-2 sentence rationale for the gig owner.

Gig Details:
- Title: ${gig.title}
- Role Needed: ${gig.roleName || "General Staff"}
- Required Skills: ${(gig.requiredSkills || []).join(", ") || "None specified"}
- Description: ${gig.description || "N/A"}
- Location: ${gig.location || "N/A"}

Applicants:
${JSON.stringify(
  applicants.map((a) => ({
    applicationId: a.applicationId,
    workerId: a.workerId,
    name: a.name,
    roleApplied: a.roleApplied,
    bio: a.bio || "No bio",
    skills: a.skills || [],
    experienceYears: a.experienceYears || 0,
    averageRating: a.averageRating || 5.0,
    completedGigsCount: a.completedGigsCount || 0,
  })),
  null,
  2
)}

Return a JSON array of objects matching this exact structure:
[
  {
    "applicationId": "string",
    "workerId": "string",
    "matchScore": number (integer between 50 and 99),
    "fitRecommendation": "Top Fit" | "Strong Match" | "Moderate Match" | "Potential Match",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "summary": "Concise 1-2 sentence explanation of candidate fit and experience alignment."
  }
]
`;

    // Candidate models in preference order
    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
    ];

    let lastError: any = null;
    for (const modelName of candidateModels) {
      try {
        const response = await this.genAIClient.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = response?.text?.() || response?.text || "";
        if (text) {
          const parsed: ApplicantMatchResult[] = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err: any) {
        lastError = err;
        // If 404 model not found, continue to next candidate
        if (err?.message?.includes("404") || err?.status === "NOT_FOUND") {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error("Failed to generate content with available Gemini models");
  }

  private fallbackHeuristicMatching(
    gig: GigMatchInput,
    applicants: ApplicantMatchInput[]
  ): ApplicantMatchResult[] {
    const gigTerms = [
      gig.title,
      gig.roleName || "",
      gig.description || "",
      ...(gig.requiredSkills || []),
      gig.category || "",
    ]
      .join(" ")
      .toLowerCase();

    return applicants.map((app) => {
      let score = 70; // baseline
      const strengths: string[] = [];

      // 1. Rating evaluation
      const rating = app.averageRating ?? 4.8;
      if (rating >= 4.8) {
        score += 12;
        strengths.push(`Top Rated (★${rating.toFixed(1)})`);
      } else if (rating >= 4.2) {
        score += 6;
        strengths.push(`Reliable Rating (★${rating.toFixed(1)})`);
      }

      // 2. Experience & completed gigs
      const completedGigs = app.completedGigsCount ?? 0;
      if (completedGigs >= 5) {
        score += 8;
        strengths.push(`${completedGigs}+ Completed Gigs`);
      } else if (completedGigs > 0) {
        score += 4;
        strengths.push("Platform Experience");
      }

      // 3. Skill & Bio Keyword overlap
      const applicantTerms = [
        app.bio || "",
        ...(app.skills || []),
        app.roleApplied || "",
      ]
        .join(" ")
        .toLowerCase();

      let skillMatches = 0;
      if (gig.requiredSkills && gig.requiredSkills.length > 0) {
        for (const reqSkill of gig.requiredSkills) {
          if (applicantTerms.includes(reqSkill.toLowerCase())) {
            skillMatches++;
          }
        }
      }

      // Check role keyword match
      if (gig.roleName && applicantTerms.includes(gig.roleName.toLowerCase())) {
        score += 6;
        strengths.push(`Matches Role: ${gig.roleName}`);
      }

      if (skillMatches > 0) {
        score += Math.min(skillMatches * 4, 10);
        strengths.push(`${skillMatches} Direct Skill Matches`);
      }

      if (app.skills && app.skills.length > 0 && strengths.length < 3) {
        strengths.push(app.skills[0]);
      }

      if (strengths.length === 0) {
        strengths.push("Available & Verified");
      }

      // Clamp score between 65 and 98
      const finalScore = Math.min(98, Math.max(65, Math.round(score)));

      let fitRecommendation: ApplicantMatchResult["fitRecommendation"] = "Potential Match";
      if (finalScore >= 90) {
        fitRecommendation = "Top Fit";
      } else if (finalScore >= 80) {
        fitRecommendation = "Strong Match";
      } else if (finalScore >= 70) {
        fitRecommendation = "Moderate Match";
      }

      const summary = `${app.name} has an average rating of ${rating.toFixed(1)}★ with ${
        app.skills && app.skills.length > 0
          ? `skills in ${app.skills.slice(0, 2).join(" & ")}`
          : "verified profile availability"
      }, making them a ${fitRecommendation.toLowerCase()} for the ${gig.roleName || gig.title} role.`;

      return {
        applicationId: app.applicationId,
        workerId: app.workerId,
        matchScore: finalScore,
        fitRecommendation,
        strengths: strengths.slice(0, 3),
        summary,
      };
    });
  }
}
