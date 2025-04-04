import React from "react";
import { View, Platform } from "react-native";

const Victory =
  Platform.OS === "web" ? require("victory") : require("victory-native");

interface ProfitChartProps {
  data: { x: number; y: number }[];
  color: string;
}

const ProfitChart = ({ data, color }: ProfitChartProps) => {
  const { VictoryChart, VictoryLine, VictoryAxis } = Victory;

  return (
    <View>
      <VictoryChart
        height={200}
        padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: "#8899aa" },
            tickLabels: { fill: "#8899aa", fontSize: 10 },
            grid: { stroke: "transparent" },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: "#8899aa" },
            tickLabels: { fill: "#8899aa", fontSize: 10 },
            grid: { stroke: "#2a3744" },
          }}
          tickFormat={(t: number) => `$${t}`}
        />
        <VictoryLine
          data={data}
          style={{
            data: { stroke: color, strokeWidth: 2 },
          }}
          animate={Platform.OS === "web" ? undefined : { duration: 1000 }}
        />
      </VictoryChart>
    </View>
  );
};

export default ProfitChart;
