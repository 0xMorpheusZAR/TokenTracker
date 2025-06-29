import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MarketNode {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  label: string;
  value: number;
  velocity: { x: number; y: number; z: number };
}

export function Market3DVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<MarketNode | null>(null);
  
  const generateMarketNodes = (): MarketNode[] => {
    const categories = [
      { id: "defi", label: "DeFi", size: 45, color: "#3b82f6", value: 45.2 },
      { id: "gaming", label: "Gaming", size: 35, color: "#ef4444", value: -89.5 },
      { id: "layer2", label: "Layer 2", size: 40, color: "#f59e0b", value: -76.3 },
      { id: "infra", label: "Infrastructure", size: 30, color: "#8b5cf6", value: -82.1 },
      { id: "ai", label: "AI/ML", size: 25, color: "#10b981", value: 23.4 },
      { id: "perps", label: "Perpetuals", size: 50, color: "#22c55e", value: 125.6 },
    ];
    
    return categories.map((cat, i) => ({
      ...cat,
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
      z: (Math.random() - 0.5) * 300,
      velocity: {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5,
      },
    }));
  };
  
  const [nodes] = useState<MarketNode[]>(generateMarketNodes());
  
  const project3D = (x: number, y: number, z: number, centerX: number, centerY: number) => {
    const scale = 400 / (400 + z);
    const projectedX = centerX + x * scale;
    const projectedY = centerY + y * scale;
    return { x: projectedX, y: projectedY, scale };
  };
  
  const rotatePoint = (x: number, y: number, z: number, angleX: number, angleY: number) => {
    // Rotate around Y axis
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    
    // Rotate around X axis
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    
    return { x: x1, y: y1, z: z2 };
  };
  
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Auto-rotate
    rotationRef.current.y += 0.002;
    
    // Sort nodes by depth for proper rendering
    const sortedNodes = [...nodes].sort((a, b) => {
      const rotatedA = rotatePoint(a.x, a.y, a.z, rotationRef.current.x, rotationRef.current.y);
      const rotatedB = rotatePoint(b.x, b.y, b.z, rotationRef.current.x, rotationRef.current.y);
      return rotatedB.z - rotatedA.z;
    });
    
    // Draw connections
    ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
    ctx.lineWidth = 1;
    
    for (let i = 0; i < sortedNodes.length; i++) {
      for (let j = i + 1; j < sortedNodes.length; j++) {
        const nodeA = sortedNodes[i];
        const nodeB = sortedNodes[j];
        
        const rotatedA = rotatePoint(nodeA.x, nodeA.y, nodeA.z, rotationRef.current.x, rotationRef.current.y);
        const rotatedB = rotatePoint(nodeB.x, nodeB.y, nodeB.z, rotationRef.current.x, rotationRef.current.y);
        
        const projectedA = project3D(rotatedA.x, rotatedA.y, rotatedA.z, centerX, centerY);
        const projectedB = project3D(rotatedB.x, rotatedB.y, rotatedB.z, centerX, centerY);
        
        const distance = Math.sqrt(
          Math.pow(nodeA.x - nodeB.x, 2) +
          Math.pow(nodeA.y - nodeB.y, 2) +
          Math.pow(nodeA.z - nodeB.z, 2)
        );
        
        if (distance < 200) {
          ctx.globalAlpha = (200 - distance) / 200 * 0.3;
          ctx.beginPath();
          ctx.moveTo(projectedA.x, projectedA.y);
          ctx.lineTo(projectedB.x, projectedB.y);
          ctx.stroke();
        }
      }
    }
    
    ctx.globalAlpha = 1;
    
    // Draw nodes
    sortedNodes.forEach(node => {
      const rotated = rotatePoint(node.x, node.y, node.z, rotationRef.current.x, rotationRef.current.y);
      const projected = project3D(rotated.x, rotated.y, rotated.z, centerX, centerY);
      
      // Update position with velocity
      node.x += node.velocity.x;
      node.y += node.velocity.y;
      node.z += node.velocity.z;
      
      // Bounce off boundaries
      if (Math.abs(node.x) > 150) node.velocity.x *= -1;
      if (Math.abs(node.y) > 150) node.velocity.y *= -1;
      if (Math.abs(node.z) > 150) node.velocity.z *= -1;
      
      // Draw node
      const radius = node.size * projected.scale;
      
      // Glow effect
      const gradient = ctx.createRadialGradient(
        projected.x, projected.y, 0,
        projected.x, projected.y, radius * 2
      );
      gradient.addColorStop(0, node.color + "40");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Main circle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Label
      ctx.fillStyle = "#fff";
      ctx.font = `${12 * projected.scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(node.label, projected.x, projected.y + radius + 15 * projected.scale);
      
      // Performance indicator
      const perfColor = node.value > 0 ? "#22c55e" : "#ef4444";
      ctx.fillStyle = perfColor;
      ctx.font = `${10 * projected.scale}px sans-serif`;
      ctx.fillText(
        `${node.value > 0 ? "+" : ""}${node.value.toFixed(1)}%`,
        projected.x,
        projected.y
      );
    });
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      rotationRef.current.x = (y - canvas.height / 2) * 0.001;
      rotationRef.current.y = (x - canvas.width / 2) * 0.001;
    };
    
    canvas.addEventListener("mousemove", handleMouseMove);
    animate();
    
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <Card className="bg-slate-900/80 border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white">3D Market Sector Analysis</h3>
        <Badge variant="outline" className="border-green-500/50 text-green-400">
          Real-time
        </Badge>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full border border-slate-700 rounded-lg bg-black/80"
          style={{ maxHeight: "600px" }}
        />
        
        <div className="absolute bottom-4 left-4 bg-black/80 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs text-gray-400">
            Move mouse to rotate • Node size = market cap • Color = performance
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {nodes.map(node => (
          <div
            key={node.id}
            className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: node.color }}
            />
            <span className="text-sm text-gray-300">{node.label}</span>
            <span
              className={`text-sm font-semibold ml-auto ${
                node.value > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {node.value > 0 ? "+" : ""}{node.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}