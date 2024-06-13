"use client";

import { useQueue } from "@uidotdev/usehooks";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type MicrophoneContext = {
  microphone: MediaRecorder | undefined;
  setMicrophone: Dispatch<SetStateAction<MediaRecorder | undefined>>;
  startMicrophone: () => void;
  stopMicrophone: () => void;
  microphoneOpen: boolean;
  enqueueBlob: (element: Blob) => void;
  removeBlob: () => Blob | undefined;
  firstBlob: Blob | undefined;
  queueSize: number;
  queue: Blob[];
  stream: MediaStream | undefined;
  adjustSensitivity: (value: number) => void;
};

interface MicrophoneContextInterface {
  children: React.ReactNode;
}

const MicrophoneContext = createContext({} as MicrophoneContext);

const DEFAULT_SENSITIVITY = 0.5; // Default sensitivity value to capture most sounds effectively
// Example values for different use cases:
// const DEFAULT_SENSITIVITY = 0.6; // Higher sensitivity for quieter environments
// const DEFAULT_SENSITIVITY = 0.3; // Lower sensitivity for louder environments

const VAD_THRESHOLD = 0.01; // Moderate threshold for detecting speech
// Example values for different use cases:
// const VAD_THRESHOLD = 0.005; // Lower threshold to capture softer speech
// const VAD_THRESHOLD = 0.015; // Higher threshold to filter out more background noise

const NOISE_GATE_THRESHOLD = 0.001; // Noise gate threshold to filter out non-speech sounds
// Example values for different use cases:
// const NOISE_GATE_THRESHOLD = 0.05; // Lower threshold for less strict noise filtering
// const NOISE_GATE_THRESHOLD = 0.2; // Higher threshold for more strict noise filtering

const MicrophoneContextProvider = ({
  children,
}: MicrophoneContextInterface) => {
  const [microphone, setMicrophone] = useState<MediaRecorder>();
  const [stream, setStream] = useState<MediaStream>();
  const [microphoneOpen, setMicrophoneOpen] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext>();
  const [gainNode, setGainNode] = useState<GainNode>();
  const [biquadFilter, setBiquadFilter] = useState<BiquadFilterNode>();

  const {
    add: enqueueBlob,
    remove: removeBlob,
    first: firstBlob,
    size: queueSize,
    queue,
  } = useQueue<Blob>([]);

  useEffect(() => {
    async function setupMicrophone() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      setStream(stream);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      const biquadFilter = audioContext.createBiquadFilter();

      // Configure the BiquadFilter to act as a low-pass filter
      biquadFilter.type = "lowpass";
      biquadFilter.frequency.setValueAtTime(1000, audioContext.currentTime); // Adjust frequency to target voice range

      // Set the initial gain value for loud environments
      gainNode.gain.setValueAtTime(DEFAULT_SENSITIVITY, audioContext.currentTime);

      // Connect the nodes
      source.connect(biquadFilter);
      biquadFilter.connect(gainNode);

      setAudioContext(audioContext);
      setGainNode(gainNode);
      setBiquadFilter(biquadFilter);

      const microphone = new MediaRecorder(stream);
      setMicrophone(microphone);
    }

    if (!microphone) {
      setupMicrophone();
    }
  }, [enqueueBlob, microphone, microphoneOpen]);

  useEffect(() => {
    if (!microphone || !audioContext) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const source = audioContext.createMediaStreamSource(stream!);
    source.connect(analyser);

    microphone.ondataavailable = (e) => {
      analyser.getByteTimeDomainData(dataArray);
      const rms = Math.sqrt(
        dataArray.reduce((sum, value) => sum + value * value, 0) / bufferLength
      );

      if (microphoneOpen && rms > VAD_THRESHOLD) {
        // Uncomment the line below to enable noise gate threshold
        // if (microphoneOpen && rms > VAD_THRESHOLD && rms < NOISE_GATE_THRESHOLD) {
        enqueueBlob(e.data);
      }
    };

    return () => {
      microphone.ondataavailable = null;
    };
  }, [enqueueBlob, microphone, microphoneOpen, audioContext, stream]);

  const stopMicrophone = useCallback(() => {
    if (microphone?.state === "recording") microphone?.pause();

    setMicrophoneOpen(false);
  }, [microphone]);

  const startMicrophone = useCallback(() => {
    if (microphone?.state === "paused") {
      microphone?.resume();
    } else {
      microphone?.start(250);
    }

    setMicrophoneOpen(true);
  }, [microphone]);

  const adjustSensitivity = useCallback((value: number) => {
    if (gainNode) {
      gainNode.gain.setValueAtTime(value, audioContext!.currentTime);
    }
  }, [gainNode, audioContext]);

  useEffect(() => {
    const eventer = () =>
      document.visibilityState !== "visible" && stopMicrophone();

    window.addEventListener("visibilitychange", eventer);

    return () => {
      window.removeEventListener("visibilitychange", eventer);
    };
  }, [stopMicrophone]);

  return (
    <MicrophoneContext.Provider
      value={{
        microphone,
        setMicrophone,
        startMicrophone,
        stopMicrophone,
        microphoneOpen,
        enqueueBlob,
        removeBlob,
        firstBlob,
        queueSize,
        queue,
        stream,
        adjustSensitivity,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

function useMicrophone() {
  return useContext(MicrophoneContext);
}

export { MicrophoneContextProvider, useMicrophone };
