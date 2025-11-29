/**
 * Neural Network Visualization
 * Minimalist brain-like network with tasks as neurons
 */

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

const NeuralNetworkVisualization = ({ tasks = [], agents = [] }) => {
  const graphData = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { nodes: [], links: [] };
    }

    // Create central hub (brain center)
    const centerNode = {
      id: "center",
      name: "Control Central",
      category: 0,
      value: tasks.length,
      symbolSize: 40,
      x: 0,
      y: 0,
      itemStyle: {
        color: "#6b7280",
      },
      label: {
        show: false,
      },
    };

    // Create agent nodes (clustered around center)
    const agentNodes = agents.slice(0, 6).map((agent, idx) => {
      const angle = (idx / agents.length) * 2 * Math.PI;
      const radius = 120;
      return {
        id: `agent-${agent.agent_id}`,
        name: agent.name.substring(0, 15),
        category: 1,
        value: 1,
        symbolSize: 20,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        itemStyle: {
          color: "#3b82f6",
        },
        label: {
          show: true,
          fontSize: 9,
          color: "#6b7280",
        },
      };
    });

    // Create task nodes (neurons) - distributed around agents
    const taskNodes = tasks.slice(0, 30).map((task) => {
      const agentIdx = agents.findIndex((a) => a.agent_id === task.agent_id);
      const baseAngle =
        agentIdx >= 0 ? (agentIdx / agents.length) * 2 * Math.PI : 0;
      const angle = baseAngle + (Math.random() - 0.5) * 0.8;
      const radius = 180 + Math.random() * 80;

      const statusColors = {
        completed: "#10b981",
        processing: "#f59e0b",
        pending: "#6b7280",
        failed: "#ef4444",
        awaiting_approval: "#8b5cf6",
      };

      return {
        id: `task-${task.task_id}`,
        name: "",
        category: 2,
        value: task.confidence_score || 0.5,
        symbolSize: 8 + (task.confidence_score || 0.5) * 8,
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 30,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 30,
        itemStyle: {
          color: statusColors[task.status] || "#6b7280",
          borderColor: "#ffffff",
          borderWidth: 1,
        },
        label: {
          show: false,
        },
        status: task.status,
        confidence: task.confidence_score,
      };
    });

    // Links: center -> agents -> tasks
    const links = [];

    // Center to agents
    agentNodes.forEach((agent) => {
      links.push({
        source: "center",
        target: agent.id,
        value: 1,
        lineStyle: {
          color: "#9ca3af",
          width: 1,
          opacity: 0.3,
        },
      });
    });

    // Agents to tasks
    tasks.slice(0, 30).forEach((task) => {
      const agent = agents.find((a) => a.agent_id === task.agent_id);
      if (agent) {
        const statusColors = {
          completed: "#10b981",
          processing: "#f59e0b",
          pending: "#6b7280",
          failed: "#ef4444",
          awaiting_approval: "#8b5cf6",
        };
        links.push({
          source: `agent-${agent.agent_id}`,
          target: `task-${task.task_id}`,
          value: task.confidence_score || 0.5,
          lineStyle: {
            color: statusColors[task.status] || "#6b7280",
            width: 0.5 + (task.confidence_score || 0.5) * 1.5,
            opacity: 0.2,
          },
        });
      }
    });

    return {
      nodes: [centerNode, ...agentNodes, ...taskNodes],
      links,
      categories: [
        { name: "Centro", itemStyle: { color: "#6b7280" } },
        { name: "Agentes", itemStyle: { color: "#3b82f6" } },
        { name: "Tareas", itemStyle: { color: "#6b7280" } },
      ],
    };
  }, [tasks, agents]);

  const option = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#6b7280",
        borderWidth: 1,
        textStyle: {
          color: "#ffffff",
          fontSize: 11,
        },
        formatter: (params) => {
          if (params.dataType === "node") {
            const node = params.data;
            if (node.id === "center") {
              return `<div style="padding: 4px;">Control Central<br/>${node.value} tareas</div>`;
            } else if (node.category === 1) {
              return `<div style="padding: 4px;">${node.name}</div>`;
            } else {
              return `<div style="padding: 4px;">Tarea<br/>${
                node.status
              }<br/>${((node.confidence || 0) * 100).toFixed(0)}%</div>`;
            }
          }
          return "";
        },
      },
      series: [
        {
          type: "graph",
          layout: "force",
          data: graphData.nodes,
          links: graphData.links,
          categories: graphData.categories,
          roam: true,
          label: {
            show: true,
            position: "right",
            formatter: "{b}",
            fontSize: 9,
            color: "#6b7280",
          },
          labelLayout: {
            hideOverlap: true,
          },
          lineStyle: {
            color: "source",
            curveness: 0,
            width: 1,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: {
              width: 2,
              opacity: 0.6,
            },
            itemStyle: {
              borderWidth: 2,
            },
          },
          force: {
            repulsion: 200,
            gravity: 0.05,
            edgeLength: 80,
            layoutAnimation: true,
          },
        },
      ],
    }),
    [graphData]
  );

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg">
        <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
          No hay tareas para visualizar
        </p>
      </div>
    );
  }

  return (
    <div className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-4">
      <ReactECharts
        option={option}
        style={{ height: "500px", width: "100%" }}
        opts={{ renderer: "svg" }}
      />
    </div>
  );
};

export default NeuralNetworkVisualization;
