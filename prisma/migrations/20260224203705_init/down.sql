-- Drop foreign keys
ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE "Visit" DROP CONSTRAINT IF EXISTS "Visit_userId_fkey";

-- Drop tables
DROP TABLE IF EXISTS "Visit";
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "Account";
DROP TABLE IF EXISTS "VerificationToken";
DROP TABLE IF EXISTS "User";

-- Drop enums
DROP TYPE IF EXISTS "VisitStatus";
DROP TYPE IF EXISTS "Role";
