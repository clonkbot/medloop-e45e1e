import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Clock, Star, ArrowRight, Play } from "lucide-react";
import { PaperArtwork } from "./PaperArtwork";

interface HomeTabProps {
  profile: Doc<"profiles">;
  onSelectPaper: (id: Id<"papers">) => void;
}

type Paper = Doc<"papers">;
type Progress = Doc<"paperProgress">;

export function HomeTab({ profile, onSelectPaper }: HomeTabProps) {
  const featuredPaper = useQuery(api.papers.getFeatured);
  const allPapers = useQuery(api.papers.list, {});
  const userProgress = useQuery(api.progress.getUserProgress);

  const getProgressForPaper = (paperId: Id<"papers">) => {
    return userProgress?.find((p: Progress) => p.paperId === paperId);
  };

  const continueReading = allPapers?.filter((p: Paper) => {
    const progress = getProgressForPaper(p._id);
    return progress && progress.progress > 0 && progress.progress < 100;
  }) || [];

  const todaysPicks = allPapers?.filter((p: Paper) => p._id !== featuredPaper?._id).slice(0, 4) || [];
  const forYou = allPapers?.filter((p: Paper) => p.specialty === profile.specialty).slice(0, 5) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Featured Paper - Hero */}
      {featuredPaper && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-8 cursor-pointer group"
          onClick={() => onSelectPaper(featuredPaper._id)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
          <div className="absolute inset-0 opacity-60">
            <PaperArtwork specialty={featuredPaper.specialty} size="large" />
          </div>
          <div className="relative z-20 p-6 md:p-10 min-h-[300px] md:min-h-[400px] flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
                Featured Today
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full">
                {featuredPaper.specialty}
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 max-w-2xl leading-tight">
              {featuredPaper.title}
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-xl mb-4 line-clamp-2">
              {featuredPaper.abstract}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                {featuredPaper.readTime} min read
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Star className="w-4 h-4" />
                {featuredPaper.citations} citations
              </div>
            </div>
            <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-all w-fit group-hover:border-white/50">
              <Play className="w-4 h-4" /> Start Reading
            </button>
          </div>
        </motion.div>
      )}

      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Continue Reading</h3>
            <button className="text-purple-400 text-sm font-medium hover:text-purple-300 flex items-center gap-1">
              See all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {continueReading.map((paper: Paper, index: number) => {
              const progress = getProgressForPaper(paper._id);
              return (
                <motion.div
                  key={paper._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelectPaper(paper._id)}
                  className="flex-shrink-0 w-40 cursor-pointer group"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                    <PaperArtwork specialty={paper.specialty} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${progress?.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {paper.title}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* For You Row */}
      {forYou.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {profile.specialty} Papers
            </h3>
            <button className="text-purple-400 text-sm font-medium hover:text-purple-300 flex items-center gap-1">
              See all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {forYou.map((paper: Paper, index: number) => {
              const progress = getProgressForPaper(paper._id);
              return (
                <motion.div
                  key={paper._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelectPaper(paper._id)}
                  className="flex-shrink-0 w-40 cursor-pointer group"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                    <PaperArtwork specialty={paper.specialty} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {progress && progress.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {paper.title}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Today's Picks - Grid */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Today's Picks</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {todaysPicks.map((paper: Paper, index: number) => {
            const progress = getProgressForPaper(paper._id);
            return (
              <motion.div
                key={paper._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelectPaper(paper._id)}
                className="cursor-pointer group"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                  <PaperArtwork specialty={paper.specialty} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                    <span className="text-xs text-white/80">{paper.readTime} min</span>
                  </div>
                  {progress && progress.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {paper.title}
                </p>
                <p className="text-gray-500 text-xs mt-1">{paper.specialty}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
