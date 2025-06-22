import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, User, Camera, Clock, CheckCircle } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to the Attendance System",
      icon: <User className="w-12 h-12 text-blue-500" />,
      content: "This system uses facial recognition to track your attendance securely and accurately. Let's walk through how to use it.",
      image: "👋"
    },
    {
      title: "Step 1: Select Your Department",
      icon: <User className="w-12 h-12 text-green-500" />,
      content: "First, choose your department from the dropdown menu. This helps us organize attendance records properly.",
      image: "🏢"
    },
    {
      title: "Step 2: Choose Check-in or Check-out",
      icon: <Clock className="w-12 h-12 text-orange-500" />,
      content: "Click 'Check In' when you arrive at work, and 'Check Out' when you're leaving. The system will remember your last action.",
      image: "⏰"
    },
    {
      title: "Step 3: Face Recognition",
      icon: <Camera className="w-12 h-12 text-purple-500" />,
      content: "Position your face within the camera frame. Keep still while the system analyzes your face. Good lighting helps with accuracy.",
      image: "📸"
    },
    {
      title: "Step 4: Confirmation",
      icon: <CheckCircle className="w-12 h-12 text-green-600" />,
      content: "Wait for the green confirmation message. Your attendance has been recorded successfully!",
      image: "✅"
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetAndClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            How to Use the Attendance System
          </DialogTitle>
          <DialogDescription className="text-center">
            Step {currentStep + 1} of {tutorialSteps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex justify-center">
                {tutorialSteps[currentStep].icon}
              </div>
              
              <div className="text-6xl">{tutorialSteps[currentStep].image}</div>
              
              <h3 className="text-xl font-semibold">
                {tutorialSteps[currentStep].title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {tutorialSteps[currentStep].content}
              </p>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            ></div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} / {tutorialSteps.length}
            </span>

            {currentStep < tutorialSteps.length - 1 ? (
              <Button onClick={nextStep} className="flex items-center">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={resetAndClose} className="bg-green-600 hover:bg-green-700">
                Get Started!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialModal;