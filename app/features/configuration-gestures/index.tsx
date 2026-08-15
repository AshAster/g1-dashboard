"use client";

import React, { useState } from "react";
import { FeatureGate } from "@/app/components/feature-gate";
import { FiPlay, FiTrash2, FiActivity, FiServer, FiSettings, FiSave } from "react-icons/fi";
import { useGestures } from "./useGestures";

export function ConfigurationGesturesModule() {
  const {
    robotIp,
    updateRobotIp,
    isHealthy,
    gestures,
    isRecording,
    recordingName,
    loading,
    startRecording,
    stopRecording,
    playGesture,
    deleteGesture,
    refresh
  } = useGestures();

  const [newName, setNewName] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const handleStart = () => {
    if (!newName.trim()) return alert("Enter a gesture name first");
    startRecording(newName.trim());
  };

  return (
    <FeatureGate featureKey="configurationGestures">
      <div className="space-y-6 sm:space-y-8">
        
        {/* Header & Connection Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/30 p-4 sm:p-5 lg:p-6 rounded-2xl border border-border">
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 mb-1 flex-wrap">
              <span className="text-primary font-mono text-xs sm:text-sm bg-primary/10 px-2 py-1 rounded shrink-0">[CFG]</span>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold uppercase tracking-wide text-foreground">Custom Gestures</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Train the physical robot by guiding its arms.</p>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border ${isHealthy ? 'bg-success/10 border-success/20 text-success' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
              <span className="relative flex h-3 w-3">
                {isHealthy && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isHealthy ? 'bg-success' : 'bg-destructive'}`}></span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest whitespace-nowrap">{isHealthy ? 'Robot Connected' : 'Disconnected'}</span>
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 shrink-0 border border-border rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
            >
              <FiSettings />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 sm:p-5 lg:p-6 bg-card border border-border rounded-xl space-y-4 animate-in slide-in-from-top-2">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <FiServer /> Connection Settings
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input 
                type="text" 
                value={robotIp}
                onChange={(e) => updateRobotIp(e.target.value)}
                placeholder="192.168.1.50"
                className="flex-1 min-w-0 min-h-11 bg-background border border-border rounded-lg px-3 sm:px-4 py-2 text-base sm:text-sm focus:outline-none focus:border-primary font-mono"
              />
              <button onClick={refresh} className="w-full sm:w-auto shrink-0 min-h-11 px-5 sm:px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                Reconnect
              </button>
            </div>
          </div>
        )}

        {/* Recording Studio */}
        <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl border transition-all duration-500 ${isRecording ? 'bg-destructive/5 border-destructive/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'bg-card/50 border-border'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <FiActivity className={isRecording ? 'text-destructive animate-pulse' : 'text-primary'} /> 
                {isRecording ? 'Recording in Progress' : 'Record New Gesture'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl text-pretty">
                {isRecording 
                  ? "The robot's motors are now in compliant mode. Physically move the robot's arms to teach the gesture. Click Stop & Save when finished."
                  : "Put the robot in compliant mode to physically guide its arms and record a new kinematic trajectory."}
              </p>
            </div>
          </div>

          <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <input 
              type="text" 
              placeholder="Gesture name (e.g., wave_hello)"
              value={isRecording ? recordingName : newName}
              onChange={(e) => !isRecording && setNewName(e.target.value)}
              disabled={isRecording}
              className="w-full sm:flex-1 sm:max-w-md min-h-11 bg-background border border-border rounded-lg px-3 sm:px-4 py-3 focus:outline-none focus:border-primary disabled:opacity-50 font-mono text-base sm:text-sm"
            />
            
            {isRecording ? (
              <button 
                onClick={stopRecording}
                className="w-full sm:w-auto min-h-11 flex justify-center items-center gap-2 px-6 sm:px-8 py-3 bg-destructive text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-destructive transition-colors animate-pulse"
              >
                <FiSave /> Stop & Save
              </button>
            ) : (
              <button 
                onClick={handleStart}
                disabled={!isHealthy || !newName.trim()}
                className="w-full sm:w-auto min-h-11 flex justify-center items-center gap-2 px-6 sm:px-8 py-3 bg-primary text-primary-foreground text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse"></span>
                Start Recording
              </button>
            )}
          </div>
        </div>

        {/* Gesture Library */}
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 sm:mb-6">Saved Gestures</h3>
          
          {loading && gestures.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4 border border-border border-dashed rounded-xl text-muted-foreground text-xs sm:text-sm text-balance">
              Loading gestures from robot...
            </div>
          ) : gestures.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4 border border-border border-dashed rounded-xl text-muted-foreground text-xs sm:text-sm text-balance">
              No custom gestures recorded yet. Connect to a robot to view saved macros.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {gestures.map((gesture) => (
                <div key={gesture.name} className="p-4 sm:p-5 lg:p-6 border border-border bg-card/30 rounded-xl hover:bg-card/60 transition-colors group">
                  <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4 min-w-0">
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-foreground font-mono break-words">{gesture.name}</h4>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                        {gesture.duration_s} • {gesture.samples} samples
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-[10px] sm:text-xs text-muted-foreground font-mono mb-4 sm:mb-6 break-words">
                    Last modified: {new Date(gesture.modified).toLocaleString()}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => playGesture(gesture.name)}
                      disabled={!isHealthy}
                      className="flex-1 min-h-10 flex justify-center items-center gap-2 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      <FiPlay /> Play
                    </button>
                    <button 
                      onClick={() => deleteGesture(gesture.name)}
                      className="p-2.5 shrink-0 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10 rounded-lg transition-all"
                      title="Delete Gesture"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </FeatureGate>
  );
}
