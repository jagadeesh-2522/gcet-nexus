"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function TagInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s),
  );

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/[0.08] px-2.5 py-1 text-[12px] font-medium text-accent"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
              className="rounded-sm text-accent/70 transition-colors hover:bg-accent/15 hover:text-accent"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </span>
        ))}
      </div>

      <input
        className="input mt-2.5"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag(input);
          }
        }}
      />

      {input && filteredSuggestions.length > 0 && (
        <div className="mt-1.5 max-h-36 overflow-auto rounded-lg border border-border bg-surface shadow-sm">
          {filteredSuggestions.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13.5px] text-foreground transition-colors hover:bg-accent/[0.08]"
            >
              <Plus className="h-3.5 w-3.5 text-muted" strokeWidth={2.25} />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
