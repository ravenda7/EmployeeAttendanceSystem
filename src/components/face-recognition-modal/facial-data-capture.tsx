'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import * as faceapi from 'face-api.js';

interface FacialDataCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onDataCaptured: (data: number[]) => void;
}

const FacialDataCapture: React.FC<FacialDataCaptureProps> = ({
  isOpen,
  onClose,
  onDataCaptured
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStep, setCaptureStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [capturedData, setCapturedData] = useState<Float32Array[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const captureSteps = [
    'Look straight ahead',
    'Turn slightly left',
    'Turn slightly right',
    'Tilt head up slightly',
    'Processing facial features...'
  ];

useEffect(() => {
  const loadModelsAndStart = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector_model'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68_model'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition_model'),
      ]);
      
      if (isOpen) {
        await loadModelsAndStartCamera(); // your own function
      }
    } catch (err) {
      console.error("Model loading failed:", err);
    }
  };

  if (isOpen) {
    loadModelsAndStart();
  } else {
    stopCamera();
  }

  return () => {
    stopCamera();
  };
}, [isOpen]);


  const loadModelsAndStartCamera = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector_model');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68_model');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition_model');

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Failed to load models or access camera.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  const captureCurrentFrame = async () => {
    if (!videoRef.current) return;

    setIsCapturing(true);

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.warning('No face detected. Try again.');
        setIsCapturing(false);
        return;
      }

      const descriptor = detection.descriptor;
      setCapturedData(prev => [...prev, descriptor]);

      if (captureStep < captureSteps.length - 2) {
        setCaptureStep(prev => prev + 1);
        setProgress((captureStep + 1) * 20);
        setIsCapturing(false);
      } else {
        setCaptureStep(captureSteps.length - 1);
        setProgress(100);
        setTimeout(() => {
          const averaged = averageDescriptors([...capturedData, descriptor]);
          onDataCaptured(averaged);
          resetCapture();
          onClose();
        }, 2000);
      }
    } catch (err) {
      toast.error('Error capturing face data.');
      console.error(err);
    }
  };

  const averageDescriptors = (descriptors: Float32Array[]): number[] => {
    const avg = new Float32Array(128).fill(0);
    descriptors.forEach(desc => {
      for (let i = 0; i < 128; i++) {
        avg[i] += desc[i];
      }
    });
    return Array.from(avg.map(val => val / descriptors.length));
  };

  const resetCapture = () => {
    setCaptureStep(0);
    setProgress(0);
    setCapturedData([]);
    setIsCapturing(false);
  };

  const handleClose = () => {
    resetCapture();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Facial Data Capture
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-scroll max-h-[80vh] no-scrollbar">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Current Step */}
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">
              Step {captureStep + 1} of {captureSteps.length}
            </h3>
            <p className="text-gray-600">{captureSteps[captureStep]}</p>
          </div>

          {/* Camera Feed */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-64 border-2 border-blue-500 rounded-lg opacity-70">
                <div className="w-full h-full border border-blue-300 rounded-lg m-1"></div>
              </div>
            </div>
            {isCapturing && (
              <div className="absolute inset-0 bg-white bg-opacity-20 flex items-center justify-center">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                  <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </div>
              </div>
            )}
          </div>

          {/* Step Dots */}
          <div className="flex justify-center space-x-2">
            {captureSteps.slice(0, -1).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index < captureStep
                    ? 'bg-green-500'
                    : index === captureStep
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {captureStep < captureSteps.length - 1 && (
              <Button 
                onClick={captureCurrentFrame}
                disabled={isCapturing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCapturing ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Position your face within the outlined area</li>
              <li>• Ensure good lighting on your face</li>
              <li>• Follow the prompts for each capture angle</li>
              <li>• Stay still during each capture</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacialDataCapture;
