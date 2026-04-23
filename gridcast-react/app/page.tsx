"use client";

import dynamic from "next/dynamic";

const GridCastApp = dynamic(() => import("@/components/GridCastApp"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        background: "#020f1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        color: "#06b6d4",
        fontSize: 13,
        letterSpacing: 2,
      }}
    >
      GRIDCAST · INITIALISING…
    </div>
  ),
});

export default function RootPage() {
  return <GridCastApp />;
}
