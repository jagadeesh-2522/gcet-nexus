-- Fix JOIN REQUESTS RLS policy for INSERT
-- Simplified policy that allows authenticated users to create join requests for themselves

-- Drop the existing policy
DROP POLICY IF EXISTS "a student can request to join a project they don't lead or belong to" ON join_requests;

-- Create a simpler, more permissive policy
-- Additional validation (not already member/leader) happens in application code
CREATE POLICY "authenticated users can create join requests for themselves"
  ON join_requests FOR INSERT
  WITH CHECK (
    applicant_id = auth.uid()
  );
