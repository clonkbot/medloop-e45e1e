import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Check, ChevronRight, Stethoscope, Heart, Brain, Pill, Shield, Bone, Eye, Baby } from "lucide-react";

const specialties = [
  { id: "Cardiology", name: "Cardiology", icon: Heart, color: "from-red-500 to-rose-600" },
  { id: "Neurology", name: "Neurology", icon: Brain, color: "from-purple-500 to-violet-600" },
  { id: "Oncology", name: "Oncology", icon: Shield, color: "from-amber-500 to-orange-600" },
  { id: "Pharmacology", name: "Pharmacology", icon: Pill, color: "from-blue-500 to-cyan-600" },
  { id: "Immunology", name: "Immunology", icon: Shield, color: "from-green-500 to-emerald-600" },
  { id: "Orthopedics", name: "Orthopedics", icon: Bone, color: "from-gray-400 to-slate-500" },
  { id: "Ophthalmology", name: "Ophthalmology", icon: Eye, color: "from-sky-500 to-blue-600" },
  { id: "Pediatrics", name: "Pediatrics", icon: Baby, color: "from-pink-500 to-rose-600" },
];

export function OnboardingScreen() {
  const createProfile = useMutation(api.profiles.create);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [hospital, setHospital] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!selectedSpecialty || !name) return;

    setIsLoading(true);
    try {
      await createProfile({
        name,
        email,
        specialty: selectedSpecialty,
        hospital: hospital || undefined,
        licenseNumber: licenseNumber || undefined,
      });
    } catch (err) {
      console.error("Failed to create profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Progress bar */}
        <div className="p-6">
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    s <= step ? "bg-gradient-to-r from-purple-500 to-indigo-500" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-3">Step {step} of 3</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Let's get started</h1>
                <p className="text-gray-400 mb-8">Tell us a bit about yourself</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Your name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="Dr. Jane Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="jane@hospital.com"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!name}
                  className="mt-8 w-full py-3 px-4 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2">Choose your specialty</h1>
                <p className="text-gray-400 mb-8">We'll curate papers just for you</p>

                <div className="grid grid-cols-2 gap-3">
                  {specialties.map((specialty) => {
                    const isSelected = selectedSpecialty === specialty.id;
                    return (
                      <button
                        key={specialty.id}
                        onClick={() => setSelectedSpecialty(specialty.id)}
                        className={`relative p-4 rounded-xl border transition-all text-left ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${specialty.color} flex items-center justify-center mb-2`}>
                          <specialty.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-white font-medium text-sm">{specialty.name}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 bg-transparent border border-white/10 text-gray-400 font-medium rounded-xl hover:bg-white/5 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedSpecialty}
                    className="flex-1 py-3 px-4 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2">Verification</h1>
                <p className="text-gray-400 mb-8">Optional — verify your credentials for badge</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Hospital / Institution</label>
                    <input
                      type="text"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="Massachusetts General Hospital"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Medical License Number</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="License number (optional)"
                    />
                  </div>

                  <p className="text-gray-500 text-sm">
                    Verification helps build trust in our community. You can skip this step and verify later.
                  </p>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 px-4 bg-transparent border border-white/10 text-gray-400 font-medium rounded-xl hover:bg-white/5 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50"
                  >
                    {isLoading ? "Setting up..." : "Start Learning"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
