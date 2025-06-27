import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function UnlockCalendar() {
  const majorUnlocks = [
    {
      token: "AEVO",
      date: "May 15, 2024",
      impact: "-74% in 1 day",
      description: "878M tokens unlocked (753% supply increase)",
      percentage: 87.8,
      impactClass: "text-loss-red"
    },
    {
      token: "ALT",
      date: "July 25, 2024",
      impact: "-50% in 1 week",
      description: "684M tokens unlocked ($109M value)",
      percentage: 42.1,
      impactClass: "text-loss-red"
    },
    {
      token: "STRK",
      date: "Monthly since Apr 2024",
      impact: "Ongoing decline",
      description: "64M tokens/month through 2027",
      percentage: 64,
      impactClass: "text-warning-orange"
    }
  ];

  const vestingSchedules = [
    {
      token: "PIXEL",
      schedule: "60-month vesting",
      initialFloat: "15.4%",
      unlocks: "Continuous",
      performance: "-97%"
    },
    {
      token: "REZ",
      schedule: "Complex vesting",
      initialFloat: "11.5%",
      unlocks: "+144% in 1 year",
      performance: "-96%"
    },
    {
      token: "SAGA",
      schedule: "6-month pause",
      initialFloat: "9%",
      unlocks: "176% annual",
      performance: "-97%"
    }
  ];

  return (
    <Card className="bg-dark-card border-dark-border mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Token Unlock Events & Price Impact</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Major Unlock Events */}
          <div>
            <h3 className="text-sm font-medium text-neutral-gray mb-4">MAJOR UNLOCK DISASTERS</h3>
            <div className="space-y-4">
              {majorUnlocks.map((unlock) => (
                <div 
                  key={unlock.token + unlock.date}
                  className={`border ${unlock.impactClass === 'text-loss-red' ? 'border-loss-red/30 bg-loss-red/5' : 'border-warning-orange/30 bg-warning-orange/5'} rounded-lg p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{unlock.token} - {unlock.date}</span>
                    <span className={`text-sm font-bold ${unlock.impactClass}`}>{unlock.impact}</span>
                  </div>
                  <div className="text-sm text-neutral-gray mb-2">{unlock.description}</div>
                  <Progress 
                    value={unlock.percentage} 
                    className="w-full h-2 mb-1"
                  />
                  <div className="text-xs text-neutral-gray">{unlock.percentage}% of supply {unlock.token === 'STRK' ? 'continuous' : 'dumped'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Vesting Schedule Impact */}
          <div>
            <h3 className="text-sm font-medium text-neutral-gray mb-4">VESTING SCHEDULE IMPACT</h3>
            <div className="space-y-4">
              {vestingSchedules.map((schedule) => (
                <div key={schedule.token} className="bg-dark-bg rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">{schedule.token}</span>
                    <span className="text-sm text-loss-red">{schedule.schedule}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-gray">Initial Float:</span>
                      <span>{schedule.initialFloat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-gray">Supply Growth:</span>
                      <span className="text-warning-orange">{schedule.unlocks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-gray">Performance:</span>
                      <span className="text-loss-red">{schedule.performance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
