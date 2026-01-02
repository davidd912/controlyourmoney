import React from 'react';
import { Check } from "lucide-react";

export default function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-300
                  ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span 
                className={`
                  text-xs mt-2 font-medium whitespace-nowrap
                  ${isActive ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`
                  w-16 h-1 rounded-full mx-2 -mt-6
                  ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}