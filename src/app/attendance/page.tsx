"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, HelpCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import FaceRecognitionModal from '@/components/face-recognition-modal';
import TutorialModal from '@/components/modal-tutorial';


const EmployeeAttendance = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isCheckIn, setIsCheckIn] = useState(true);
  const [lastAction, setLastAction] = useState<'checkin' | 'checkout' | null>(null);


  // Mock departments
  const departments = [
    { id: 'dept-1', name: 'Engineering' },
    { id: 'dept-2', name: 'Marketing' },
    { id: 'dept-3', name: 'Sales' },
    { id: 'dept-4', name: 'HR' },
    { id: 'dept-5', name: 'Finance' },
  ];

  const handleCheckIn = () => {
    if (!selectedDepartment) {
      toast.error("Please select your department first.");
      return;
    }
    setIsCheckIn(true);
    setShowFaceRecognition(true);
  };

  const handleCheckOut = () => {
    if (!selectedDepartment) {
        toast.error("Please select your department first.");
      return;
    }
    setIsCheckIn(false);
    setShowFaceRecognition(true);
  };

  const handleAttendanceSuccess = (success: boolean) => {
    if (success) {
      setLastAction(isCheckIn ? 'checkin' : 'checkout');
      const action = isCheckIn ? 'checked in' : 'checked out';

      toast.success(`${isCheckIn ? 'Check-in' : 'Check-out'} successful!`)
    }
    setShowFaceRecognition(false);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Employee Attendance
          </h1>
          <p className="text-lg text-gray-600">
            Secure facial recognition attendance system
          </p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
            <p className="text-2xl font-semibold text-blue-600">{getCurrentTime()}</p>
            <p className="text-sm text-gray-500">{getCurrentDate()}</p>
          </div>
        </div>

        {/* Tutorial Button */}
        <div className="flex justify-center mb-6">
          <Button
            variant="outline"
            onClick={() => setShowTutorial(true)}
            className="flex items-center space-x-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>How to use this system?</span>
          </Button>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center justify-center space-x-2">
              <User className="w-6 h-6" />
              <span>Employee Check-in/Check-out</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Department Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Select Your Department
              </label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleCheckIn}
                size="lg"
                className="h-16 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center space-y-1"
                disabled={!selectedDepartment}
              >
                <Clock className="w-6 h-6" />
                <span>Check In</span>
              </Button>
              
              <Button
                onClick={handleCheckOut}
                size="lg"
                variant="destructive"
                className="h-16 flex flex-col items-center justify-center space-y-1"
                disabled={!selectedDepartment}
              >
                <Clock className="w-6 h-6" />
                <span>Check Out</span>
              </Button>
            </div>

            {/* Status Display */}
            {lastAction && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    lastAction === 'checkin' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    Last Action: {lastAction === 'checkin' ? 'Checked In' : 'Checked Out'} at {getCurrentTime()}
                  </span>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. Select your department from the dropdown</li>
                <li>2. Click "Check In" when arriving or "Check Out" when leaving</li>
                <li>3. Position your face in the camera frame for recognition</li>
                <li>4. Wait for confirmation before leaving</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Face Recognition Modal */}
        <FaceRecognitionModal
          isOpen={showFaceRecognition}
          onClose={() => setShowFaceRecognition(false)}
          onSuccess={handleAttendanceSuccess}
          isCheckIn={isCheckIn}
        />

        {/* Tutorial Modal */}
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
        />
      </div>
    </div>
  );
};

export default EmployeeAttendance;