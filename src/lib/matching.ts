// Skill alias map: normalizes common terminology variants to a canonical form
const SKILL_ALIASES: Record<string, string> = {
  "reactjs": "react",
  "react.js": "react",
  "react js": "react",
  "vuejs": "vue",
  "vue.js": "vue",
  "nodejs": "node.js",
  "node js": "node.js",
  "expressjs": "express",
  "express.js": "express",
  "nextjs": "next.js",
  "next js": "next.js",
  "typescript": "typescript",
  "ts": "typescript",
  "javascript": "javascript",
  "js": "javascript",
  "postgresql": "postgres",
  "postgres": "postgres",
  "mongodb": "mongodb",
  "mongo": "mongodb",
  "kubernetes": "kubernetes",
  "k8s": "kubernetes",
  "azure ai": "azure ai",
  "microsoft azure": "azure",
  "azure cloud": "azure",
  "python3": "python",
  "golang": "go",
  "ruby on rails": "rails",
  "ror": "rails",
  "machine learning": "machine learning",
  "ml": "machine learning",
  "artificial intelligence": "ai",
  "deep learning": "deep learning",
  "dl": "deep learning",
  "natural language processing": "nlp",
  "supply chain management": "supply chain",
  "scm": "supply chain",
  "data analysis": "data analysis",
  "data analytics": "data analysis",
};

type CandidateSkillEntry = {
  name: string;
  level?: number; // 1-5
};

type MatchingInput = {
  candidateSkills: CandidateSkillEntry[] | string[];
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

function canonicalize(skill: string): string {
  const normalized = skill.trim().toLowerCase();
  return SKILL_ALIASES[normalized] ?? normalized;
}

function normalizeSkills(items: string[]): string[] {
  return items.map(canonicalize).filter(Boolean);
}

function buildCandidateSkillMap(skills: CandidateSkillEntry[] | string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of skills) {
    if (typeof entry === "string") {
      map.set(canonicalize(entry), 3); // default mid-level when no level provided
    } else {
      map.set(canonicalize(entry.name), entry.level ?? 3);
    }
  }
  return map;
}

// Level multiplier: level 5 = 100%, level 1 = 60%, scale linearly
function levelMultiplier(level: number): number {
  return 0.6 + (level - 1) * 0.1;
}

export function computeMatch(input: MatchingInput): MatchResult {
  const candidateMap = buildCandidateSkillMap(input.candidateSkills);
  const required = normalizeSkills(input.requiredSkills);
  const preferred = normalizeSkills(input.preferredSkills);

  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];
  let requiredWeightedSum = 0;
  let requiredMaxWeight = 0;

  for (let i = 0; i < required.length; i++) {
    const skill = required[i];
    const originalName = input.requiredSkills[i];
    const level = candidateMap.get(skill);
    requiredMaxWeight += 1;
    if (level !== undefined) {
      matchedRequired.push(originalName);
      requiredWeightedSum += levelMultiplier(level);
    } else {
      missingRequired.push(originalName);
    }
  }

  const matchedPreferred: string[] = [];
  const missingPreferred: string[] = [];
  let preferredWeightedSum = 0;
  let preferredMaxWeight = 0;

  for (let i = 0; i < preferred.length; i++) {
    const skill = preferred[i];
    const originalName = input.preferredSkills[i];
    const level = candidateMap.get(skill);
    preferredMaxWeight += 1;
    if (level !== undefined) {
      matchedPreferred.push(originalName);
      preferredWeightedSum += levelMultiplier(level);
    } else {
      missingPreferred.push(originalName);
    }
  }

  const requiredScore =
    requiredMaxWeight === 0 ? 100 : Math.round((requiredWeightedSum / requiredMaxWeight) * 100);
  const preferredScore =
    preferredMaxWeight === 0 ? 100 : Math.round((preferredWeightedSum / preferredMaxWeight) * 100);
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
