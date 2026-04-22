import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LeatherViewer } from "@/components/viewer/LeatherViewer";
import { LabSliderPanel } from "@/components/viewer/LabSliderPanel";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Recipe Studio — TannerySim" },
      { name: "description", content: "3D leather simulation studio" },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const [lab, setLab] = useState({ l: 55, a: 15, b: 20 });

  return (
    <AppShell
      rightPanel={<LabSliderPanel lab={lab} onChange={setLab} />}
    >
      <LeatherViewer lab={lab} />
    </AppShell>
  );
}
