"use client";

import Link from "next/link";
import { Search, X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { ProjectCard } from "@/components/project/project-card";
import type { Project } from "@/lib/types";
import type { ViewerRelation } from "@/components/project/request-button";
import { PROJECT_TYPES } from "@/lib/validations/project";
import { cn } from "@/lib/utils";

interface DiscoverClientProps {
  projects: Project[];
  user: { id: string } | null;
  requestedIds: Set<string>;
  memberIds: Set<string>;
  savedIds: Set<string>;
}

export function DiscoverClient({
  projects,
  user,
  requestedIds,
  memberIds,
  savedIds,
}: DiscoverClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [filteredProjects, setFilteredProjects] = useState(projects);

  // Filter projects based on search and type
  useEffect(() => {
    let filtered = projects;

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((p) => p.type === selectedType);
    }

    // Filter by search query (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.short_description.toLowerCase().includes(query) ||
          p.full_description.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
  }, [searchQuery, selectedType, projects]);

  function relationFor(project: Project): ViewerRelation {
    if (user && project.leader_id === user.id) return "leader";
    if (memberIds.has(project.id)) return "member";
    if (requestedIds.has(project.id)) return "requested";
    return "none";
  }

  const hasFilteredProjects = filteredProjects.length > 0;
  const isFiltered = searchQuery.trim() !== "" || selectedType !== "all";

  // Type labels
  const typeLabels: Record<string, string> = {
    all: "All Projects",
    hackathon: "Hackathon",
    personal: "Personal",
    academic: "Academic",
    open_source: "Open Source",
    startup: "Startup",
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Premium Page Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
            <Sparkles className="h-5 w-5 text-accent" strokeWidth={2} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Discover Projects
          </h1>
        </div>
        <p className="text-base text-muted pl-[52px]">
          Find projects and teams looking for students like you.
        </p>
      </header>

      {/* Premium Search & Filter Section */}
      <div className="mb-8 space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search projects by name, description, or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input h-12 w-full pl-12 pr-12 text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {["all", ...PROJECT_TYPES].map((type) => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  isActive
                    ? "bg-accent text-white shadow-sm scale-105"
                    : "border border-border bg-surface text-foreground hover:bg-surface-2 hover:border-accent/30"
                )}
              >
                {typeLabels[type] || type}
              </button>
            );
          })}
        </div>

        {/* Results Count & Clear */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {hasFilteredProjects
              ? `${filteredProjects.length} project${filteredProjects.length === 1 ? "" : "s"} found`
              : "No matching projects"}
          </p>
          
          {isFiltered && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* No Matching Results */}
      {!hasFilteredProjects ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 py-16 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/5 ring-1 ring-accent/10">
            <Search className="h-6 w-6 text-accent" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-base font-semibold text-foreground">
            No matching projects
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          {isFiltered && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
              }}
              className="btn-secondary mt-6 h-10 px-5 text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        /* Project Cards Grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              relation={relationFor(project)}
              saved={savedIds.has(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
