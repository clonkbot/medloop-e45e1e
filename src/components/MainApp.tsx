import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Doc } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Compass, Brain, User, LogOut, Flame, BookOpen, Target, Trophy } from "lucide-react";
import { HomeTab } from "./HomeTab";
import { DiscoverTab } from "./DiscoverTab";
import { BrainTab } from "./BrainTab";
import { ProfileTab } from "./ProfileTab";
import { PaperPage } from "./PaperPage";
import { Id } from "../../convex/_generated/dataModel";

type Tab = "home" | "discover" | "brain" | "profile";

interface MainAppProps {
  profile: Doc<"profiles">;
}

export function MainApp({ profile }: MainAppProps) {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedPaperId, setSelectedPaperId] = useState<Id<"papers"> | null>(null);

  const tabs = [
    { id: "home" as Tab, label: "Home", icon: Home },
    { id: "discover" as Tab, label: "Discover", icon: Compass },
    { id: "brain" as Tab, label: "Brain", icon: Brain },
    { id: "profile" as Tab, label: "Profile", icon: User },
  ];

  // If a paper is selected, show the paper page
  if (selectedPaperId) {
    return (
      <PaperPage
        paperId={selectedPaperId}
        onBack={() => setSelectedPaperId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a12]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight hidden sm:block">MedLoop</span>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-white font-semibold text-sm">{profile.streak}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-white font-semibold text-sm">{profile.papersRead}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-white font-semibold text-sm">{profile.quizAccuracy}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-white font-semibold text-sm">#{profile.rank || "—"}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HomeTab
                profile={profile}
                onSelectPaper={(id) => setSelectedPaperId(id)}
              />
            </motion.div>
          )}
          {activeTab === "discover" && (
            <motion.div
              key="discover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DiscoverTab />
            </motion.div>
          )}
          {activeTab === "brain" && (
            <motion.div
              key="brain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BrainTab />
            </motion.div>
          )}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProfileTab profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#12121a]/95 backdrop-blur-xl border-t border-white/5 z-50 safe-area-pb">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-all ${
                  isActive ? "text-purple-400" : "text-gray-500"
                }`}
              >
                <tab.icon className={`w-6 h-6 ${isActive ? "scale-110" : ""} transition-transform`} />
                <span className="text-xs font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 w-12 h-0.5 bg-purple-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="fixed bottom-16 left-0 right-0 text-center pb-2 pointer-events-none">
        <p className="text-gray-700 text-[10px]">
          Requested by @web-user · Built by @clonkbot
        </p>
      </div>
    </div>
  );
}
