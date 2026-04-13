import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Users, MapPin, Flame, BookOpen, Globe } from "lucide-react";

// Convert lat/lng to 3D coordinates on a sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

const specialtyColors: Record<string, string> = {
  Cardiology: "#ef4444",
  Oncology: "#f59e0b",
  Neurology: "#8b5cf6",
  Pharmacology: "#3b82f6",
  Immunology: "#10b981",
  Orthopedics: "#6b7280",
  Ophthalmology: "#0ea5e9",
  Pediatrics: "#ec4899",
};

interface LearnerPoint {
  id: string;
  position: THREE.Vector3;
  color: string;
  name: string;
  specialty: string;
  streak: number;
  papers: number;
  isOnline: boolean;
}

function GlobeCore() {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#1a1a2e"
        wireframe={false}
        transparent
        opacity={0.9}
        roughness={0.8}
        metalness={0.2}
      />
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.05, 32, 32]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Grid lines */}
      <mesh>
        <sphereGeometry args={[2.01, 32, 32]} />
        <meshBasicMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>
    </mesh>
  );
}

function LearnerPoints({ learners }: { learners: LearnerPoint[] }) {
  const pointsRef = useRef<THREE.Group>(null);
  const [hoveredLearner, setHoveredLearner] = useState<LearnerPoint | null>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={pointsRef}>
      {learners.map((learner) => (
        <group key={learner.id} position={learner.position}>
          {/* Point */}
          <mesh
            onPointerOver={() => setHoveredLearner(learner)}
            onPointerOut={() => setHoveredLearner(null)}
          >
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color={learner.color} />
          </mesh>
          {/* Pulse effect for online learners */}
          {learner.isOnline && (
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={learner.color} transparent opacity={0.3} />
            </mesh>
          )}
          {/* Tooltip */}
          {hoveredLearner?.id === learner.id && (
            <Html distanceFactor={5} style={{ pointerEvents: "none" }}>
              <div className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 min-w-[180px] shadow-xl">
                <p className="text-white font-semibold text-sm">{learner.name}</p>
                <p className="text-gray-400 text-xs mb-2">{learner.specialty}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-orange-400">
                    <Flame className="w-3 h-3" /> {learner.streak}
                  </span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <BookOpen className="w-3 h-3" /> {learner.papers}
                  </span>
                  {learner.isOnline && (
                    <span className="flex items-center gap-1 text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      Online
                    </span>
                  )}
                </div>
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

function Scene({ learners }: { learners: LearnerPoint[] }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 5);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <GlobeCore />
      <LearnerPoints learners={learners} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function DiscoverTab() {
  const globalLearners = useQuery(api.discover.getGlobalLearners);
  const updateLocation = useMutation(api.profiles.updateLocation);
  const [stats, setStats] = useState({ total: 0, online: 0, countries: 0 });

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location permission denied");
          // Use random location for demo
          updateLocation({
            latitude: 40.7128 + (Math.random() - 0.5) * 40,
            longitude: -74.006 + (Math.random() - 0.5) * 100,
          });
        }
      );
    }
  }, [updateLocation]);

  const learnerPoints: LearnerPoint[] = useMemo(() => {
    if (!globalLearners) {
      // Generate demo data
      return Array.from({ length: 50 }).map((_, i) => {
        const lat = (Math.random() - 0.5) * 140;
        const lng = Math.random() * 360 - 180;
        const specialties = Object.keys(specialtyColors);
        const specialty = specialties[i % specialties.length];
        return {
          id: `demo-${i}`,
          position: latLngToVector3(lat, lng, 2),
          color: specialtyColors[specialty],
          name: `Learner ${i + 1}`,
          specialty,
          streak: Math.floor(Math.random() * 30),
          papers: Math.floor(Math.random() * 100),
          isOnline: Math.random() > 0.7,
        };
      });
    }

    return globalLearners.map((learner: typeof globalLearners[0]) => ({
      id: learner._id,
      position: latLngToVector3(learner.latitude, learner.longitude, 2),
      color: specialtyColors[learner.specialty] || "#8b5cf6",
      name: learner.name,
      specialty: learner.specialty,
      streak: learner.currentStreak,
      papers: learner.papersThisWeek,
      isOnline: learner.isOnline,
    }));
  }, [globalLearners]);

  useEffect(() => {
    const online = learnerPoints.filter((l) => l.isOnline).length;
    setStats({
      total: learnerPoints.length,
      online,
      countries: Math.floor(learnerPoints.length / 3),
    });
  }, [learnerPoints]);

  return (
    <div className="h-[calc(100vh-140px)] relative">
      {/* Stats overlay */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 md:gap-6"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-[#12121a]/80 backdrop-blur-xl rounded-full border border-white/10">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-white font-semibold text-sm">{stats.total}</span>
            <span className="text-gray-400 text-sm">Learners</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#12121a]/80 backdrop-blur-xl rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white font-semibold text-sm">{stats.online}</span>
            <span className="text-gray-400 text-sm">Online</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#12121a]/80 backdrop-blur-xl rounded-full border border-white/10">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-white font-semibold text-sm">{stats.countries}</span>
            <span className="text-gray-400 text-sm">Countries</span>
          </div>
        </motion.div>
      </div>

      {/* 3D Globe */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: "#0a0a12" }}
      >
        <Suspense fallback={null}>
          <Scene learners={learnerPoints} />
        </Suspense>
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 md:gap-4"
        >
          {Object.entries(specialtyColors).slice(0, 5).map(([specialty, color]) => (
            <div
              key={specialty}
              className="flex items-center gap-1.5 px-2 py-1 bg-[#12121a]/60 backdrop-blur-sm rounded-full"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-gray-400 text-xs">{specialty}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-16 left-0 right-0 text-center">
        <p className="text-gray-500 text-xs">Drag to rotate • Scroll to zoom • Hover for details</p>
      </div>
    </div>
  );
}
