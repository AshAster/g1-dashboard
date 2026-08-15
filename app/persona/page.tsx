"use client";

import React from "react";
import { PersonaProvider } from "@/app/features/persona/context";
import { PersonaHeader } from "@/app/features/persona/header";
import { PersonaChangeModule } from "@/app/features/persona-change";
import { GenerativePersonaModule } from "@/app/features/generative-persona";
import { PrebuiltPersonasModule } from "@/app/features/prebuilt-personas";
import { PersonaLibraryModule } from "@/app/features/persona-library";
import { EmotionsModule } from "@/app/features/emotions";

export default function PersonaManagerPage() {
  return (
    <PersonaProvider>
      <div className="max-w-7xl mx-auto w-full space-y-10 sm:space-y-12 lg:space-y-16 pb-20 sm:pb-28 lg:pb-32 pt-2 sm:pt-4 lg:pt-6">
        <PersonaHeader />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full">
          <PersonaChangeModule />
          <GenerativePersonaModule />
          <PrebuiltPersonasModule />
        </div>

        <PersonaLibraryModule />
        <EmotionsModule />
      </div>
    </PersonaProvider>
  );
}