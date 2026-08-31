import type { Project, ProjectMember } from "@/lib/types";
import { PortfolioProjectCard } from "./portfolio-project-card";

export function PortfolioSection({
  projects,
}: {
  projects: Array<{
    project: Project;
    role: "lead" | "member";
  }>;
}) {
  // Separate current and completed projects
  const currentProjects = projects.filter(({ project }) =>
    ["recruiting", "in_progress", "paused"].includes(project.status)
  );

  const completedProjects = projects.filter(({ project }) =>
    ["completed", "closed"].includes(project.status)
  );

  // Don't render anything if no projects
  if (currentProjects.length === 0 && completedProjects.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-foreground">Projects</h2>

      {/* Current Projects */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Current Projects</h3>
        {currentProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {currentProjects.map(({ project, role }) => (
              <PortfolioProjectCard key={project.id} project={project} role={role} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Not working on any active projects yet.</p>
        )}
      </div>

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Completed Projects</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {completedProjects.map(({ project, role }) => (
              <PortfolioProjectCard key={project.id} project={project} role={role} />
            ))}
          </div>
        </div>
      )}

      {completedProjects.length === 0 && currentProjects.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Completed Projects</h3>
          <p className="text-sm text-muted">No completed projects yet.</p>
        </div>
      )}
    </section>
  );
}
