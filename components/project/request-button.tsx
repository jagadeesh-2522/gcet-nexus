import Link from "next/link";
import type { ProjectStatus } from "@/lib/types";

export type ViewerRelation = "none" | "requested" | "member" | "leader";

// Encodes the exact CTA rules from the brief (section 9): the button's
// label and target change with both project status and the viewer's
// relationship to it — never a generic "Join" button.
export function RequestButton({
  projectId,
  status,
  relation,
}: {
  projectId: string;
  status: ProjectStatus;
  relation: ViewerRelation;
}) {
  if (relation === "leader" || relation === "member") {
    return (
      <Link href={`/projects/${projectId}`} className="btn-secondary w-full sm:w-auto">
        Open Project
      </Link>
    );
  }

  if (relation === "requested") {
    return (
      <button disabled className="btn-secondary w-full cursor-not-allowed opacity-70 sm:w-auto">
        Request Sent
      </button>
    );
  }

  if (status !== "recruiting") {
    return (
      <button disabled className="btn-secondary w-full cursor-not-allowed opacity-70 sm:w-auto">
        Recruitment Closed
      </button>
    );
  }

  return (
    <Link href={`/projects/${projectId}?join=1`} className="btn-primary w-full sm:w-auto">
      Request to Join
    </Link>
  );
}
