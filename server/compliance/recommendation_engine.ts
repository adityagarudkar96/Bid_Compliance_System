import { GoogleGenAI } from '@google/genai';
import { EvaluatedCheck } from './rule_engine.ts';
import { RiskClassification, ScoreCalculationResult } from './score_engine.ts';

export interface RecommendationOutput {
  recommendation_text: string;
  reasoning: string[];
  discrepancies: string[];
  generated_by: 'GEMINI_AI' | 'DETERMINISTIC_RULES';
}

export async function generateExplainableRecommendation(
  companyName: string,
  checks: EvaluatedCheck[],
  scoreResult: ScoreCalculationResult,
  riskResult: RiskClassification
): Promise<RecommendationOutput> {
  const reviewChecks = checks.filter((c) => c.result === 'REVIEW');
  const failedChecks = checks.filter((c) => c.result === 'FAIL');
  const discrepancies: string[] = [];

  for (const c of reviewChecks) {
    discrepancies.push(`${c.requirement_name}: ${c.reason}`);
  }
  for (const c of failedChecks) {
    discrepancies.push(`${c.requirement_name}: ${c.reason}`);
  }

  // Construct deterministic baseline reasoning
  const deterministicReasoning: string[] = [];
  if (failedChecks.length > 0) {
    for (const f of failedChecks) {
      deterministicReasoning.push(`Non-compliance identified in ${f.requirement_name}: ${f.reason}`);
    }
  }
  if (reviewChecks.length > 0) {
    for (const r of reviewChecks) {
      deterministicReasoning.push(`Discrepancy in ${r.requirement_name}: ${r.reason}`);
    }
  }
  if (failedChecks.length === 0 && reviewChecks.length === 0) {
    deterministicReasoning.push('All statutory and tender criteria verified with official government sources.');
    deterministicReasoning.push('Entity identifiers (GSTIN, PAN, Udyam) match with high confidence.');
  }

  deterministicReasoning.push('No automatic qualification or disqualification has been applied.');
  deterministicReasoning.push('Final qualification decision rests exclusively with the Procurement Officer.');

  let defaultRecommendationText = '';
  if (riskResult.risk_level === 'LOW') {
    defaultRecommendationText = 'Proceed with procurement qualification. All mandatory statutory and regulatory checks have verified successfully.';
  } else if (riskResult.risk_level === 'MEDIUM') {
    defaultRecommendationText = 'Manual review recommended before final qualification. Specific entity name variations or declaration confirmations require officer inspection.';
  } else {
    defaultRecommendationText = 'Rejection or formal explanation clarification recommended due to critical non-compliance or debarment flags.';
  }

  // If Gemini API Key is available, augment with natural language structured explanation
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are the AI Compliance Explainer for the Government e-Marketplace (GeM) Procurement Platform.
CRITICAL MANDATE:
- You must ONLY explain the structured verification facts provided below.
- Do NOT invent evidence, penalties, or assumptions.
- You must NOT make the final qualification decision.
- State clearly: "AI verifies. Evidence supports. Rules evaluate. Procurement Officer decides."

Structured Facts:
Bidder Name: ${companyName}
Score: ${scoreResult.score}/100
Risk Level: ${riskResult.risk_level} (${riskResult.compliance_status})
Passed Checks: ${scoreResult.passed_count}
Review Required Checks: ${scoreResult.review_count}
Failed Checks: ${scoreResult.failed_count}
Discrepancies / Attention Points:
${discrepancies.length > 0 ? discrepancies.map((d) => `- ${d}`).join('\n') : 'None'}

Return ONLY a JSON object with this exact shape:
{
  "recommendation_text": "One concise sentence summarizing the AI advisory",
  "reasoning": ["Bullet point 1", "Bullet point 2", "Bullet point 3"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.recommendation_text && Array.isArray(parsed.reasoning)) {
          return {
            recommendation_text: parsed.recommendation_text,
            reasoning: [
              ...parsed.reasoning,
              'No automatic disqualification has been applied.',
              'Final decision remains with the Procurement Officer.',
            ],
            discrepancies,
            generated_by: 'GEMINI_AI',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini recommendation call failed or timed out, using deterministic fallback:', err);
    }
  }

  return {
    recommendation_text: defaultRecommendationText,
    reasoning: deterministicReasoning,
    discrepancies,
    generated_by: 'DETERMINISTIC_RULES',
  };
}
