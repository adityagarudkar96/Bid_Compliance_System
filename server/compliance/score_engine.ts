import { ComplianceStatus, RiskLevel } from '../../src/types/index.ts';
import { EvaluatedCheck } from './rule_engine.ts';

export interface ScoreCalculationResult {
  score: number;
  total_possible_weight: number;
  passed_count: number;
  review_count: number;
  failed_count: number;
  pending_count: number;
  mandatory_failure: boolean;
  mandatory_failed_reasons: string[];
}

export function calculateComplianceScore(checks: EvaluatedCheck[]): ScoreCalculationResult {
  let earnedScore = 0;
  let totalPossibleWeight = 0;
  let passed_count = 0;
  let review_count = 0;
  let failed_count = 0;
  let pending_count = 0;
  let mandatory_failure = false;
  const mandatory_failed_reasons: string[] = [];

  for (const check of checks) {
    const w = check.weight > 0 ? check.weight : 10;
    totalPossibleWeight += w;

    if (check.result === 'PASS') {
      earnedScore += w;
      passed_count++;
    } else if (check.result === 'REVIEW') {
      earnedScore += w * 0.5; // Partial credit for review state
      review_count++;
    } else if (check.result === 'FAIL') {
      failed_count++;
      if (check.mandatory) {
        mandatory_failure = true;
        mandatory_failed_reasons.push(`${check.requirement_name}: ${check.reason}`);
      }
    } else {
      pending_count++;
    }
  }

  // Normalize to 100 scale
  const normalizedScore = totalPossibleWeight > 0
    ? Math.round((earnedScore / totalPossibleWeight) * 100)
    : 0;

  return {
    score: normalizedScore,
    total_possible_weight: totalPossibleWeight,
    passed_count,
    review_count,
    failed_count,
    pending_count,
    mandatory_failure,
    mandatory_failed_reasons,
  };
}

export interface RiskClassification {
  risk_level: RiskLevel;
  compliance_status: ComplianceStatus;
  summary_reason: string;
}

/**
 * Prototype Risk Classification Engine
 * 
 * Rules:
 * LOW: score >= 85 AND no mandatory failure AND review_count === 0
 * MEDIUM: score 60–84 OR important REVIEW flags (even if score >= 85 with review)
 * HIGH: score < 60 OR mandatory failure OR debarment flag
 */
export function classifyRisk(scoreResult: ScoreCalculationResult, hasDebarmentFlag = false): RiskClassification {
  const { score, mandatory_failure, review_count, failed_count } = scoreResult;

  if (mandatory_failure || score < 60 || hasDebarmentFlag) {
    return {
      risk_level: 'HIGH',
      compliance_status: 'HIGH_RISK',
      summary_reason: mandatory_failure
        ? 'Mandatory statutory eligibility failure detected.'
        : hasDebarmentFlag
        ? 'Active debarment / blacklisting flag recorded on government portal.'
        : 'Cumulative compliance score is below acceptable threshold (< 60%).',
    };
  }

  if (review_count > 0 || (score >= 60 && score < 85)) {
    return {
      risk_level: 'MEDIUM',
      compliance_status: 'REVIEW_REQUIRED',
      summary_reason: `${review_count} verification check(s) flagged for manual procurement officer attention.`,
    };
  }

  return {
    risk_level: 'LOW',
    compliance_status: 'COMPLIANT',
    summary_reason: 'All statutory, regulatory, and tender requirements satisfied with high confidence.',
  };
}
