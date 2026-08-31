import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/gcet-nexus-logo.png"
      alt="GCET Nexus logo"
      width={40}
      height={40}
      className={className}
      style={{ objectFit: "contain" }}
      priority
    />
  );
}
