import React from "react";

const softSkillData = [
  {
    title: "Verbal and Written Communication",
    description: "Compellingly articulate ideas to diverse audiences.",
  },
  {
    title: "Software Requirements",
    description:
      "Masterfully translate requirements into functional specifications.",
  },
  {
    title: "Teaching Skills",
    description: "Effectively impart knowledge and facilitate learning.",
  },
  {
    title: "Focus and Productivity",
    description: "Maintain unwavering focus and optimize task management.",
  },
  {
    title: "Social Skills",
    description:
      "Foster positive relationships and resolve conflicts constructively.",
  },
  {
    title: "Problem-Solving Skills",
    description: "Creatively address challenges and continuously innovate.",
  },
  {
    title: "Teamwork Skills",
    description:
      "Collaborate effectively and foster a supportive team environment.",
  },
  {
    title: "Troubleshooting Skills",
    description: "Analyze and resolve software issues with precision.",
  },
  {
    title: "Patience and Perseverance",
    description:
      "Maintain composure under pressure and pursue goals relentlessly.",
  },
  {
    title: "Passion",
    description:
      "Devote oneself to software development and share knowledge willingly.",
  },
];

const TechCarrousel = () => {
  return (
    <>
      <h1>Hello from TechCarrousel</h1>
      <div className="grid place-items-center">
        <div className="my-[10px] p-2 max-w-1xl grid gap-4 xs:grid-cols-2 h-[200px] lg:overflow-x-scroll bg-yellow-300"></div>
      </div>
    </>
  );
};

export default TechCarrousel;
