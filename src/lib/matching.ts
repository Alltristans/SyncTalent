type MatchingInput = {
  candidateSkills: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  threshold: number;
  assessmentScore?: number;
};

export type MatchResult = {
  score: number;
  hardLocked: boolean;
  matchedRequired: string[];
  missingRequired: string[];
  matchedPreferred: string[];
  missingPreferred: string[];
  summary: string;
};

function normalize(items: string[]) {
  return items.map((item) => item.trim().toLowerCase()).filter(Boolean);
}

export function computeMatch(input: MatchingInput): MatchResult {
  const candidate = new Set(normalize(input.candidateSkills));
  const required = normalize(input.requiredSkills);
  const preferred = normalize(input.preferredSkills);

  const matchedRequired = required.filter((skill) => candidate.has(skill));
  const missingRequired = required.filter((skill) => !candidate.has(skill));
  const matchedPreferred = preferred.filter((skill) => candidate.has(skill));
  const missingPreferred = preferred.filter((skill) => !candidate.has(skill));

  const requiredScore = required.length === 0 ? 100 : Math.round((matchedRequired.length / required.length) * 100);
  const preferredScore = preferred.length === 0 ? 100 : Math.round((matchedPreferred.length / preferred.length) * 100);
  const assessmentScore = input.assessmentScore ?? 0;

  const blended = Math.round(requiredScore * 0.7 + preferredScore * 0.2 + assessmentScore * 0.1);
  const hardLocked = missingRequired.length > 0 || blended < input.threshold;

  const summary = hardLocked
    ? `Hard-lock: missing ${missingRequired.length} required skill(s) or score below threshold ${input.threshold}%.`
    : `Eligible: ${matchedRequired.length}/${required.length || 0} required and ${matchedPreferred.length}/${preferred.length || 0} preferred skills matched.`;

  return {
    score: blended,
    hardLocked,
    matchedRequired,
    missingRequired,
    matchedPreferred,
    missingPreferred,
    summary
  };
}

export function buildLearningRecommendations(missingSkills: string[]) {
  return missingSkills.map((skill) => ({
    title: `${skill} learning path`,
    link: `https://learn.microsoft.com/en-us/training/browse/?terms=${encodeURIComponent(skill)}`
  }));
}
