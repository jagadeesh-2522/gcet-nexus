"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { ProjectStatus } from "@/lib/types";
import { JoinRequestDialog } from "./join-request-dialog";
import type { ViewerRelation } from "./request-button";

// Wraps RequestButton's "Request to Join" link target (?join=1) with the
// actual dialog, so the server-rendered card can stay a plain link.
export function RequestButtonInteractive({
  projectId,
  status,
  relation,
}: {
  projectId: string;
  status: ProjectStatus;
  relation: ViewerRelation;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("join") === "1" && status === "recruiting" && relation === "none") {
      setOpen(true);
    }
  }, [searchParams, status, relation]);

  function close() {
    setOpen(false);
    router.replace(pathname);
  }

  return <JoinRequestDialog projectId={projectId} open={open} onClose={close} />;
}
