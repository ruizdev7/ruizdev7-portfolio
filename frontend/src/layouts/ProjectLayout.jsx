import React from "react";
import { useState } from "react";

import Stepper from "../components/Stepper";
import StepperControl from "../components/StepperControl";

import Feature from "../components/project_steps/Feature";
import Complete from "../components/project_steps/Complete";
import SoftwareRequirement from "../components/project_steps/SoftwareRequirement";
import DataAnalyticDashboard from "../components/project_steps/DataAnalyticDashboard";
import EntityRelationshipModel from "../components/project_steps/EntityRelationshipModel";

const ProjectLayout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ["Account Information", "Personal Details", "complete"];

  const displaySteps = (step) => {
    switch (step) {
      case 1:
        return <SoftwareRequirement />;
      case 2:
        return <EntityRelationshipModel />;
      case 3:
        return <Feature />;
      case 4:
        return <DataAnalyticDashboard />;
      case 5:
        return <Complete />;
      default:
    }
  };

  return (
    <div className="mx-auto shadow-xl rounded-2xl pb-2 bg-white">
      <div>
        {/* Stepper */}
        <div className="container horizontal mt-5">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>
        {/* Stepper Navigation Control */}
        <div>
          <StepperControl />
        </div>
      </div>
    </div>
  );
};

export default ProjectLayout;
