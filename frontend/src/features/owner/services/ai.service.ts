import apiClient from '../../../api/client';
import { AI_ROUTES } from '../../../constants/apiRoutes';

export interface ApplicantMatchResult {
  applicationId: string;
  workerId: string;
  matchScore: number;
  fitRecommendation: 'Top Fit' | 'Strong Match' | 'Moderate Match' | 'Potential Match';
  strengths: string[];
  summary: string;
}

export interface MatchApplicantsPayload {
  gig: {
    gigId: string;
    title: string;
    description?: string;
    category?: string;
    location?: string;
    roleName?: string;
    requiredSkills?: string[];
    hourlyRate?: number;
  };
  applicants: {
    applicationId: string;
    workerId: string;
    name: string;
    bio?: string;
    skills?: string[];
    experienceYears?: number;
    averageRating?: number;
    completedGigsCount?: number;
    roleApplied?: string;
  }[];
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export const aiService = {
  matchApplicants: async (payload: MatchApplicantsPayload) => {
    const response = await apiClient.post<ApiResponse<ApplicantMatchResult[]>>(
      AI_ROUTES.MATCH_APPLICANTS,
      payload
    );
    return response.data;
  },
};
