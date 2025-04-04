import React from "react";
import { View, Dimensions, Platform } from "react-native";
import type {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
} from "victory-native";

// Import the appropriate victory package based on platform
const Victory =
  Platform.OS === "web" ? require("victory") : require("victory-native");

interface ProfitChartProps {
  data: { x: number; y: number }[];
  color?: string;
}

const ProfitChart: React.FC<ProfitChartProps> = ({
  data,
  color = "#4CAF50",
}) => {
  const { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } = Victory;

  return (
    <View
      style={{
        height: 200,
        width: Dimensions.get("window").width - 32,
        pointerEvents: "none",
      }}
    >
      <VictoryChart
        theme={VictoryTheme.material}
        height={200}
        padding={{ top: 10, bottom: 30, left: 40, right: 20 }}
      >
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: "#8899aa" },
            tickLabels: { fill: "#8899aa", fontSize: 10 },
            grid: { stroke: "#2a3744" },
          }}
        />
        <VictoryAxis
          style={{
            axis: { stroke: "#8899aa" },
            tickLabels: { fill: "#8899aa", fontSize: 10 },
            grid: { stroke: "#2a3744" },
          }}
        />
        <VictoryLine
          data={data}
          style={{
            data: {
              stroke: color,
              strokeWidth: 2,
            },
          }}
          animate={
            Platform.OS === "web"
              ? undefined
              : {
                  duration: 1000,
                  onLoad: { duration: 500 },
                }
          }
        />
      </VictoryChart>
    </View>
  );
};

export default ProfitChart;
