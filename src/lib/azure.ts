import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import { TextAnalysisClient } from "@azure/ai-language-text";

// Azure Document Intelligence (CV Parsing)
const docEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || "";
const docKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY || "";

// Azure AI Language (Matching & Classification)
const langEndpoint = process.env.AZURE_LANGUAGE_ENDPOINT || "";
const langKey = process.env.AZURE_LANGUAGE_KEY || "";

export const isAzureConfigured = () => {
  return docEndpoint && docKey && langEndpoint && langKey;
};

export const getDocumentClient = () => {
  if (!docEndpoint || !docKey) {
    throw new Error("Azure Document Intelligence not configured. Please add keys to .env");
  }
  return new DocumentAnalysisClient(docEndpoint, new AzureKeyCredential(docKey));
};

export const getLanguageClient = () => {
  if (!langEndpoint || !langKey) {
    throw new Error("Azure Language Service not configured. Please add keys to .env");
  }
  return new TextAnalysisClient(langEndpoint, new AzureKeyCredential(langKey));
};

/**
 * Example function to parse a CV and extract text/skills.
 * In a real prototype, you would call getDocumentClient().beginAnalyzeDocument(...)
 */
export async function analyzeCV(fileBuffer: Buffer) {
  if (!isAzureConfigured()) {
    console.warn("Using mock data because Azure is not configured.");
    return mockAnalyze();
  }

  // Implementation for Dicoding AI Impact Challenge
  // 1. Send CV to Azure Document Intelligence
  // 2. Use Text Analytics to extract Key Phrases (Skills)
  // 3. Return results
  return {
    text: "Extracted text content...",
    skills: ["Azure", "React", "Node.js"]
  };
}

function mockAnalyze() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        score: 85,
        matchedSkills: ["React", "TypeScript", "Node.js", "Logistics Operations"],
        missingSkills: ["Azure AI", "Kafka"],
        recommendations: [
          { title: "Azure AI Fundamentals", link: "https://learn.microsoft.com/en-us/training/paths/get-started-with-artificial-intelligence-on-azure/" },
          { title: "Event-Driven Microservices with Kafka", link: "#" }
        ]
      });
    }, 2000);
  });
}
