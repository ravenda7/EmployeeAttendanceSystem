"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (success: boolean) => void;
  isCheckIn: boolean;
}

const FaceRecognitionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  isCheckIn,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<"success" | "failed" | null>(null);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(startCamera, 200);
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log("Camera stream started");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Please allow camera access.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const simulateRecognition = () => {
    setScanning(true);
    setConfidence(0);
    setResult(null);

    const interval = setInterval(() => {
      setConfidence((prev) => {
        const next = prev + Math.random() * 10;
        return Math.min(next, 100);
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      const isSuccess = Math.random() > 0.1;

      const finalConfidence = isSuccess
        ? 90 + Math.random() * 10
        : 40 + Math.random() * 30;

      setConfidence(finalConfidence);
      setResult(isSuccess ? "success" : "failed");

      if (isSuccess) {
        toast.success(`Successfully ${isCheckIn ? "checked in" : "checked out"}!`);
        setTimeout(() => {
          onSuccess(true);
          handleClose();
        }, 2000);
      } else {
        toast.error("Face not recognized. Try again.");
      }

      setScanning(false);
    }, 3000);
  };

  const handleClose = () => {
    setScanning(false);
    setResult(null);
    setConfidence(0);
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            {isCheckIn ? "Check In" : "Check Out"} with Face Recognition
          </DialogTitle>
          <DialogDescription>
            Please align your face within the camera frame.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded-md overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-48 h-64 border-2 rounded-lg transition-colors duration-300 ${
                  scanning
                    ? "border-blue-400 animate-pulse"
                    : result === "success"
                    ? "border-green-400"
                    : result === "failed"
                    ? "border-red-400"
                    : "border-white"
                }`}
              />
            </div>
            {(scanning || result) && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 rounded-lg p-3 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {scanning && <Loader2 className="w-4 h-4 animate-spin" />}
                    {result === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    {result === "failed" && (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm">
                      {scanning
                        ? "Analyzing..."
                        : result === "success"
                        ? "Face recognized!"
                        : "Recognition failed"}
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    {confidence.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={simulateRecognition}
              disabled={scanning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Recognition
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaceRecognitionModal;
