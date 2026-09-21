export interface GigMatchInput {
  gigId: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  roleName?: string;
  requiredSkills?: string[];
  hourlyRate?: number;
}

export interface ApplicantMatchInput {
  applicationId: string;
  workerId: string;
  name: string;
  bio?: string;
  skills?: string[];
  experienceYears?: number;
  averageRating?: number;
  completedGigsCount?: number;
  roleApplied?: string;
}

export interface ApplicantMatchResult {
  applicationId: string;
  workerId: string;
  matchScore: number; // 0 - 100
  fitRecommendation: 'Top Fit' | 'Strong Match' | 'Moderate Match' | 'Potential Match';
  strengths: string[];
  summary: string;
}

export interface IAIService {
  matchApplicants(
    gig: GigMatchInput,
    applicants: ApplicantMatchInput[]
  ): Promise<ApplicantMatchResult[]>;
}
