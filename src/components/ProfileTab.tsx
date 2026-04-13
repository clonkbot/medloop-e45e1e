import { Doc } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  User,
  Flame,
  BookOpen,
  Target,
  Trophy,
  Award,
  Calendar,
  CheckCircle,
  Star,
  TrendingUp,
} from "lucide-react";

interface ProfileTabProps {
  profile: Doc<"profiles">;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const leaderboard = useQuery(api.profiles.getLeaderboard, { specialty: profile.specialty });
  const userProgress = useQuery(api.progress.getUserProgress);

  type ProgressItem = { completed: boolean; progress: number };
  const completedPapers = userProgress?.filter((p: ProgressItem) => p.completed).length || 0;
  const inProgressPapers = userProgress?.filter((p: ProgressItem) => !p.completed && p.progress > 0).length || 0;

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Calculate user's rank
  type LeaderboardItem = { _id: string };
  const userRank = leaderboard?.findIndex((p: LeaderboardItem) => p._id === profile._id) ?? -1;
  const displayRank = userRank >= 0 ? userRank + 1 : "-";

  const stats = [
    { label: "Streak", value: profile.streak, icon: Flame, color: "text-orange-500", bgColor: "bg-orange-500/20" },
    { label: "Papers Read", value: profile.papersRead, icon: BookOpen, color: "text-blue-400", bgColor: "bg-blue-500/20" },
    { label: "Quiz Accuracy", value: `${profile.quizAccuracy}%`, icon: Target, color: "text-green-400", bgColor: "bg-green-500/20" },
    { label: "Global Rank", value: `#${displayRank}`, icon: Trophy, color: "text-amber-400", bgColor: "bg-amber-500/20" },
  ];

  const achievements = [
    { title: "First Paper", desc: "Read your first research paper", unlocked: profile.papersRead >= 1 },
    { title: "Perfect Quiz", desc: "Score 100% on a quiz", unlocked: profile.quizAccuracy === 100 },
    { title: "Week Warrior", desc: "Maintain a 7-day streak", unlocked: profile.streak >= 7 },
    { title: "Scholar", desc: "Read 10 papers", unlocked: profile.papersRead >= 10 },
    { title: "Elite Learner", desc: "Reach top 10 in your specialty", unlocked: userRank >= 0 && userRank < 10 },
    { title: "Specialist", desc: "Master 5 topics", unlocked: false },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white truncate">{profile.name}</h2>
              {profile.isVerified && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-purple-300 text-sm font-medium">{profile.specialty}</p>
            {profile.hospital && (
              <p className="text-gray-400 text-sm truncate">{profile.hospital}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-gray-400 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Points */}
        <div className="mt-4 p-3 bg-black/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-white font-semibold">{profile.totalPoints}</span>
              <span className="text-gray-400 text-sm">points</span>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+{Math.floor(profile.totalPoints * 0.1)} this week</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-400 text-xs">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Learning Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-3xl font-bold text-green-400">{completedPapers}</p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-3xl font-bold text-amber-400">{inProgressPapers}</p>
            <p className="text-gray-400 text-sm">In Progress</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.title}
              className={`p-4 rounded-xl border transition-all ${
                achievement.unlocked
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "bg-white/5 border-white/10 opacity-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {achievement.unlocked ? (
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-500" />
                )}
                <span className={`text-sm font-medium ${achievement.unlocked ? "text-white" : "text-gray-400"}`}>
                  {achievement.title}
                </span>
              </div>
              <p className="text-gray-500 text-xs">{achievement.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          {profile.specialty} Leaderboard
        </h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {leaderboard?.slice(0, 10).map((user: Doc<"profiles">, index: number) => {
            const isCurrentUser = user._id === profile._id;
            return (
              <div
                key={user._id}
                className={`flex items-center gap-3 p-3 border-b border-white/5 last:border-0 ${
                  isCurrentUser ? "bg-purple-500/10" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? "bg-amber-500/20 text-amber-400"
                      : index === 1
                      ? "bg-gray-400/20 text-gray-300"
                      : index === 2
                      ? "bg-orange-600/20 text-orange-400"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isCurrentUser ? "text-purple-300" : "text-white"}`}>
                    {user.name}
                    {isCurrentUser && " (You)"}
                  </p>
                  <p className="text-gray-500 text-xs truncate">{user.hospital || "Independent"}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">{user.totalPoints}</p>
                  <p className="text-gray-500 text-xs">points</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
