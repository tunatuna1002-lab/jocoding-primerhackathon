CREATE TYPE "ClaimStatus" AS ENUM ('candidate', 'verified', 'rejected');
CREATE TYPE "ConfidenceLevel" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "VariantTarget" AS ENUM ('draft', 'section', 'bullet');

CREATE TABLE "Claim" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "inputId" TEXT NOT NULL,
  "confidence" "ConfidenceLevel" NOT NULL,
  "status" "ClaimStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Evidence" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "claimId" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Evidence_claim_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE
);

CREATE TABLE "Provenance" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "claimId" TEXT NOT NULL,
  "actorType" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Provenance_claim_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE
);

CREATE TABLE "Draft" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Section" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "draftId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "index" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Section_draft_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE CASCADE
);

CREATE TABLE "Bullet" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sectionId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "index" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bullet_section_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE
);

CREATE TABLE "Variant" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "target" "VariantTarget" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "VariantClaim" (
  "variantId" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  CONSTRAINT "VariantClaim_pk" PRIMARY KEY ("variantId", "claimId"),
  CONSTRAINT "VariantClaim_variant_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE,
  CONSTRAINT "VariantClaim_claim_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE
);

CREATE TABLE "ExportVersion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ExportVersionVariant" (
  "exportVersionId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  CONSTRAINT "ExportVersionVariant_pk" PRIMARY KEY ("exportVersionId", "variantId"),
  CONSTRAINT "ExportVersionVariant_export_fkey" FOREIGN KEY ("exportVersionId") REFERENCES "ExportVersion"("id") ON DELETE CASCADE,
  CONSTRAINT "ExportVersionVariant_variant_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE
);
