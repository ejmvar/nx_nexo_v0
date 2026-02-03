# Option 1: Verify RLS policies
psql $DATABASE_URL -f testing/test-rls-verification.sql

# Option 2: Run full CI/CD suite
./testing/run-ci-tests.sh

# Option 3: Pre-release validation
./testing/run-pre-release-validation.sh

