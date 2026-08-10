import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function WinPredictionChart({
  team1Name,
  team2Name,
  team1Amount,
  team2Amount,
}) {
  const percentage = (a = 0, b = 0) => {
    const total = a + b;
    if (total == 0) return 50;
    return Math.round((a / total) * 100);
  };

  const chartConfig = {
    team1: { label: team1Name || "Team 1", color: "var(--chart-1)" },
    team2: { label: team2Name || "Team 2", color: "var(--chart-2)" },
  };

  const chartData = [
    {
      team1: percentage(team1Amount, team2Amount),
      team2: percentage(team2Amount, team1Amount),
    },
  ];

  const winpercentage = [
    { name: team1Name || "Team 1", value: percentage(team1Amount, team2Amount) },
    { name: team2Name || "Team 2", value: percentage(team2Amount, team1Amount) },
  ];

  const leader = winpercentage[0].value > 50 ? winpercentage[0] : winpercentage[1];

  return (
    <Card className="flex flex-col border-base-content/20">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-poppins">Radial Chart</CardTitle>
        <div className="flex justify-start items-center gap-2 font-poppins font-medium text-sm">
          <div className="inline-grid *:[grid-area:1/1]">
            <div className="status status-error animate-ping"></div>
            <div className="status status-error"></div>
          </div>{" "}
          LIVE WIN PREDICTION
        </div>
      </CardHeader>

      <CardContent className="flex flex-col md:flex-row flex-1 items-center justify-center gap-6 pb-0">
        <ChartContainer config={chartConfig} className="aspect-square min-w-[280px] min-h-[250px]">
          <RadialBarChart data={chartData} endAngle={360} innerRadius={120} outerRadius={220}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" className="font-poppins">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 10}
                          className="fill-base-content text-2xl font-poppins font-bold"
                        >
                          {leader.value}%
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 8} className="fill-gray-400">
                          {" "}
                          {leader.name} is leading bets count
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="team1"
              stackId="a"
              name={winpercentage[0].name}
              cornerRadius={6}
              fill="var(--color-team1)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="team2"
              fill="var(--color-team2)"
              name={winpercentage[1].name}
              stackId="a"
              cornerRadius={6}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>

        <div className="flex flex-col gap-2 font-poppins text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-chart-1"></span>
            <span className="font-bold">
              {team1Name} : {team1Amount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-chart-2"></span>
            <span className="font-bold">
              {team2Name} : {team2Amount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}