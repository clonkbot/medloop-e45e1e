import { useConvexAuth } from "convex/react";
import { useState, useEffect } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { MainApp } from "./components/MainApp";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.profiles.get);
  const seedPapers = useMutation(api.papers.seed);
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !hasSeeded) {
      seedPapers().then(() => setHasSeeded(true));
    }
  }, [isAuthenticated, hasSeeded, seedPapers]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">Loading MedLoop...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <OnboardingScreen />;
  }

  return <MainApp profile={profile} />;
}
