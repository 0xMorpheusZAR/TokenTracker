import { Badge } from "@/components/ui/badge";

export default function RiskIndicators() {
  const riskFactors = [
    { name: "Ultra-Low Float", level: "CRITICAL", color: "bg-loss-red" },
    { name: "High FDV", level: "HIGH", color: "bg-warning-orange" },
    { name: "Large Unlocks", level: "CRITICAL", color: "bg-loss-red" },
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-gray mb-3">RISK INDICATORS</h3>
      <div className="space-y-2">
        {riskFactors.map((factor) => (
          <div key={factor.name} className="flex items-center justify-between text-sm">
            <span>{factor.name}</span>
            <Badge className={`${factor.color} text-white px-2 py-1 text-xs`}>
              {factor.level}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
