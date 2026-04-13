import { useRef, useEffect, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Share2, Brain, Sparkles, Zap } from "lucide-react";
import * as d3 from "d3";

interface GraphNode {
  id: string;
  topic: string;
  specialty: string;
  strength: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
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

export function BrainTab() {
  const knowledgeNodes = useQuery(api.knowledge.getNodes);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [totalStrength, setTotalStrength] = useState(0);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight - 100,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "My MedLoop Knowledge Graph",
        text: `I've learned ${knowledgeNodes?.length || 0} topics on MedLoop! Check out my knowledge graph.`,
        url: window.location.href,
      });
    }
  };

  // Build graph data
  useEffect(() => {
    if (!svgRef.current || !dimensions.width || !dimensions.height) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    let nodes: GraphNode[] = [];
    let links: GraphLink[] = [];

    if (knowledgeNodes && knowledgeNodes.length > 0) {
      // Use real data
      nodes = knowledgeNodes.map((node: typeof knowledgeNodes[0]) => ({
        id: node._id,
        topic: node.topic,
        specialty: node.specialty,
        strength: node.strength,
      }));

      // Create links based on connected topics
      knowledgeNodes.forEach((node: typeof knowledgeNodes[0]) => {
        node.connectedTopics.forEach((connectedTopic: string) => {
          const targetNode = nodes.find((n) => n.topic === connectedTopic);
          if (targetNode && node._id !== targetNode.id) {
            const linkExists = links.some(
              (l) =>
                (l.source === node._id && l.target === targetNode.id) ||
                (l.source === targetNode.id && l.target === node._id)
            );
            if (!linkExists) {
              links.push({ source: node._id, target: targetNode.id });
            }
          }
        });
      });

      setTotalStrength(nodes.reduce((sum, n) => sum + n.strength, 0));
    } else {
      // Demo data
      const demoTopics = [
        { topic: "SGLT2 Inhibitors", specialty: "Cardiology", strength: 0.8 },
        { topic: "Heart Failure", specialty: "Cardiology", strength: 0.6 },
        { topic: "CAR-T Therapy", specialty: "Oncology", strength: 0.7 },
        { topic: "Immunotherapy", specialty: "Oncology", strength: 0.5 },
        { topic: "Neuroplasticity", specialty: "Neurology", strength: 0.9 },
        { topic: "Alzheimer's", specialty: "Neurology", strength: 0.4 },
        { topic: "GLP-1 Agonists", specialty: "Pharmacology", strength: 0.75 },
        { topic: "mRNA Vaccines", specialty: "Immunology", strength: 0.85 },
        { topic: "Cytokines", specialty: "Immunology", strength: 0.55 },
        { topic: "Ablation", specialty: "Cardiology", strength: 0.65 },
      ];

      nodes = demoTopics.map((t, i) => ({
        id: `demo-${i}`,
        topic: t.topic,
        specialty: t.specialty,
        strength: t.strength,
      }));

      // Create some demo links
      links = [
        { source: "demo-0", target: "demo-1" },
        { source: "demo-1", target: "demo-9" },
        { source: "demo-2", target: "demo-3" },
        { source: "demo-3", target: "demo-8" },
        { source: "demo-4", target: "demo-5" },
        { source: "demo-6", target: "demo-0" },
        { source: "demo-7", target: "demo-8" },
        { source: "demo-8", target: "demo-3" },
        { source: "demo-0", target: "demo-6" },
        { source: "demo-7", target: "demo-2" },
      ];

      setTotalStrength(nodes.reduce((sum, n) => sum + n.strength, 0));
    }

    const { width, height } = dimensions;

    // Create gradient definitions
    const defs = svg.append("defs");

    Object.entries(specialtyColors).forEach(([specialty, color]) => {
      const gradient = defs
        .append("radialGradient")
        .attr("id", `glow-${specialty}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");

      gradient.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 1);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0);
    });

    // Add filter for glow effect
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "coloredBlur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Create container group
    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create links with animated dashes
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#444")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .style("stroke-linecap", "round");

    // Animated dashes
    link
      .append("animate")
      .attr("attributeName", "stroke-dashoffset")
      .attr("values", "8;0")
      .attr("dur", "1s")
      .attr("repeatCount", "indefinite");

    // Create node groups
    const node = g
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (_, d) => {
        setSelectedNode(d);
      });

    // Outer glow circle
    node
      .append("circle")
      .attr("r", (d) => 20 + d.strength * 15)
      .attr("fill", (d) => specialtyColors[d.specialty] || "#8b5cf6")
      .attr("opacity", 0.2)
      .attr("filter", "url(#glow)");

    // Main circle
    node
      .append("circle")
      .attr("r", (d) => 12 + d.strength * 8)
      .attr("fill", (d) => specialtyColors[d.specialty] || "#8b5cf6")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.3);

    // Pulsing animation for active nodes
    node
      .filter((d) => d.strength > 0.6)
      .select("circle:last-child")
      .append("animate")
      .attr("attributeName", "r")
      .attr("values", (d) => `${12 + d.strength * 8};${14 + d.strength * 8};${12 + d.strength * 8}`)
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite");

    // Labels
    node
      .append("text")
      .text((d) => d.topic.length > 15 ? d.topic.slice(0, 15) + "..." : d.topic)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => 30 + d.strength * 10)
      .attr("fill", "#fff")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .style("pointer-events", "none");

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x || 0)
        .attr("y1", (d) => (d.source as GraphNode).y || 0)
        .attr("x2", (d) => (d.target as GraphNode).x || 0)
        .attr("y2", (d) => (d.target as GraphNode).y || 0);

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [knowledgeNodes, dimensions]);

  return (
    <div ref={containerRef} className="h-[calc(100vh-140px)] relative">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Knowledge Graph
            </h2>
            <p className="text-gray-400 text-sm">Your learning network visualized</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-full border border-purple-500/30">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium text-sm">
                {knowledgeNodes?.length || 10} Topics
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full border border-amber-500/30">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-white font-medium text-sm">
                {Math.round(totalStrength * 100)}% Mastery
              </span>
            </div>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Graph */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ background: "radial-gradient(circle at center, #12121a 0%, #0a0a12 100%)" }}
      />

      {/* Selected node details */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-4 right-4 z-20"
        >
          <div className="max-w-sm mx-auto bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold">{selectedNode.topic}</h3>
                <p className="text-gray-400 text-sm">{selectedNode.specialty}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                ×
              </button>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">Mastery</span>
                <span className="text-white font-medium">{Math.round(selectedNode.strength * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${selectedNode.strength * 100}%`,
                    backgroundColor: specialtyColors[selectedNode.specialty] || "#8b5cf6",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="flex flex-wrap justify-center gap-2">
          {Object.entries(specialtyColors).slice(0, 5).map(([specialty, color]) => (
            <div
              key={specialty}
              className="flex items-center gap-1.5 px-2 py-1 bg-[#12121a]/60 backdrop-blur-sm rounded-full"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-gray-400 text-xs">{specialty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-gray-500 text-xs">Drag nodes to rearrange • Scroll to zoom • Click for details</p>
      </div>
    </div>
  );
}
