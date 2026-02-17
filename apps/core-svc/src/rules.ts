import type { ClaimStatus, ConfidenceLevel } from '@prisma/client';

export function assertClaimEvidenceConsistency(
  status: ClaimStatus,
  confidence: ConfidenceLevel,
  evidenceCount: number
): void {
  if ((status === 'verified' || status === 'rejected') && evidenceCount < 1) {
    throw new Error('CLAIM_EVIDENCE_REQUIRED_FOR_VERIFIED_OR_REJECTED');
  }

  if (evidenceCount === 0 && !(status === 'candidate' && confidence === 'low')) {
    throw new Error('ONLY_CANDIDATE_LOW_ALLOWED_WHEN_EVIDENCE_EMPTY');
  }
}

export function assertBulletVariantRequiresClaims(target: string, claimIds: string[]): void {
  if (target === 'bullet' && claimIds.length < 1) {
    throw new Error('BULLET_VARIANT_REQUIRES_AT_LEAST_ONE_CLAIM');
  }
}
