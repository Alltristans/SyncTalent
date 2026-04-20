import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import { TextAnalysisClient, AzureKeyCredential as LangKeyCredential } from "@azure/ai-language-text";

const docEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT ?? "";
const docKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY ?? "";
const langEndpoint = process.env.AZURE_LANGUAGE_ENDPOINT ?? "";
const langKey = process.env.AZURE_LANGUAGE_KEY ?? "";

export const isAzureConfigured = () =>
  Boolean(docEndpoint && docKey && langEndpoint && langKey);

export const getDocumentClient = () => {
  if (!docEndpoint || !docKey) {
    throw new Error("Azure Document Intelligence not configured.");
  }
  return new DocumentAnalysisClient(docEndpoint, new AzureKeyCredential(docKey));
};

export const getLanguageClient = () => {
  if (!langEndpoint || !langKey) {
    throw new Error("Azure Language Service not configured.");
  }
  return new TextAnalysisClient(langEndpoint, new LangKeyCredential(langKey));
};

export type CVAnalysisResult = {
  text: string;
  skills: string[];
  score: number;
};

async function extractTextFromCV(fileBuffer: Buffer): Promise<string> {
  const client = getDocumentClient();
  const poller = await client.beginAnalyzeDocument("prebuilt-read", fileBuffer);
  const result = await poller.pollUntilDone();

  if (!result?.content) {
    throw new Error("Azure Document Intelligence returned no content.");
  }

  return result.content;
}

async function extractSkillsFromText(text: string): Promise<string[]> {
  const client = getLanguageClient();

  const [keyPhraseResult] = await client.analyze("KeyPhraseExtraction", [
    { id: "1", language: "en", text }
  ]);

  if (keyPhraseResult.error) {
    throw new Error(`Azure Language error: ${keyPhraseResult.error.message}`);
  }

  const keyPhrases = (keyPhraseResult as { keyPhrases: string[] }).keyPhrases ?? [];

  // Filter key phrases that look like skills/technologies (2-40 chars, not pure sentences)
  const skills = keyPhrases
    .filter((phrase) => phrase.length >= 2 && phrase.length <= 40 && !phrase.includes("."))
    .map((phrase) => phrase.trim())
    .filter(Boolean);

  return Array.from(new Set(skills));
}

function computeAssessmentScore(skills: string[], resumeText: string): number {
  // Heuristic: score based on skill diversity and resume depth
  const skillCount = skills.length;
  const wordCount = resumeText.split(/\s+/).length;

  // Scale: 0-100
  // More skills = higher score, capped at 40 points
  const skillScore = Math.min(skillCount * 3, 40);
  // Longer resume = more experience signal, capped at 40 points
  const depthScore = Math.min(Math.floor(wordCount / 50), 40);
  // Base 20 for any valid CV
  return Math.min(20 + skillScore + depthScore, 100);
}

export async function analyzeCV(fileBuffer: Buffer): Promise<CVAnalysisResult> {
  if (!isAzureConfigured()) {
    throw new Error(
      "Azure credentials are not configured. Set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT, " +
      "AZURE_DOCUMENT_INTELLIGENCE_KEY, AZURE_LANGUAGE_ENDPOINT, and AZURE_LANGUAGE_KEY in your .env file."
    );
  }

  const text = await extractTextFromCV(fileBuffer);
  const skills = await extractSkillsFromText(text);
  const score = computeAssessmentScore(skills, text);

  return { text, skills, score };
}
