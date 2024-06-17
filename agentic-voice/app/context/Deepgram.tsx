"use client";

import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveSchema,
  LiveTranscriptionEvents,
  SpeakSchema,
} from "@deepgram/sdk";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useToast } from "./Toast";
import { useLocalStorage } from "../lib/hooks/useLocalStorage";

// Define the context type
interface DeepgramContextType {
  ttsOptions: {
    model: string;
    autoVoice: string;
  };
  setTtsOptions: Dispatch<SetStateAction<{
    model: string;
    autoVoice: string;
  }>>;
  sttOptions: LiveSchema | undefined;
  setSttOptions: Dispatch<SetStateAction<LiveSchema | undefined>>;
  connection: LiveClient | undefined;
  connectionReady: boolean;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(undefined);

const DEFAULT_TTS_MODEL = 'aura-asteria-en';
const DEFAULT_STT_MODEL = 'nova-2';

const defaultTtsOptions = {
  model: DEFAULT_TTS_MODEL,
  autoVoice: "off"
}

const defaultSttsOptions = {
  model: DEFAULT_STT_MODEL,
  interim_results: true,
  smart_format: true,
  endpointing: 550,
  utterance_end_ms: 1500,
  filler_words: true,
}

/**
 * TTS Voice Options
 */
const voices: {
  [key: string]: {
    name: string;
    avatar: string;
    language: string;
    accent: string;
  };
} = {
  [DEFAULT_TTS_MODEL]: {
    name: "Asteria",
    avatar: "/aura-asteria-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-luna-en": {
    name: "Luna",
    avatar: "/aura-luna-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-stella-en": {
    name: "Stella",
    avatar: "/aura-stella-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-athena-en": {
    name: "Athena",
    avatar: "/aura-athena-en.svg",
    language: "English",
    accent: "UK",
  },
  "aura-hera-en": {
    name: "Hera",
    avatar: "/aura-hera-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-orion-en": {
    name: "Orion",
    avatar: "/aura-orion-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-arcas-en": {
    name: "Arcas",
    avatar: "/aura-arcas-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-perseus-en": {
    name: "Perseus",
    avatar: "/aura-perseus-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-angus-en": {
    name: "Angus",
    avatar: "/aura-angus-en.svg",
    language: "English",
    accent: "Ireland",
  },
  "aura-orpheus-en": {
    name: "Orpheus",
    avatar: "/aura-orpheus-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-helios-en": {
    name: "Helios",
    avatar: "/aura-helios-en.svg",
    language: "English",
    accent: "UK",
  },
  "aura-zeus-en": {
    name: "Zeus",
    avatar: "/aura-zeus-en.svg",
    language: "English",
    accent: "US",
  },
};

const voiceMap = (model: string) => {
  return voices[model] || { name: "Unknown", avatar: "", language: "Unknown", accent: "Unknown" };
};

const getApiKey = async (): Promise<string> => {
  const hardCodedApiKey = 'bab95327fbe5eca16bf944edfd151104de7a1f1c';
  return hardCodedApiKey;
};

const DeepgramContextProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [ttsOptions, setTtsOptions] = useLocalStorage<{ model: string; autoVoice: string }>('ttsModel', defaultTtsOptions);
  const [sttOptions, setSttOptions] = useLocalStorage<LiveSchema | undefined>('sttModel', defaultSttsOptions);
  const [connection, setConnection] = useState<LiveClient>();
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectionReady, setConnectionReady] = useState<boolean>(false);

  const connect = useCallback(
    async (defaultSttsOptions: SpeakSchema) => {
      if (!connection && !connecting) {
        setConnecting(true);

        const connection = new LiveClient(
          await getApiKey(),
          {},
          defaultSttsOptions
        );

        setConnection(connection);
        setConnecting(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [connecting, connection]
  );

  useEffect(() => {
    if (!ttsOptions) {
      setTtsOptions(defaultTtsOptions);
    }

    if (!sttOptions) {
      setSttOptions(defaultSttsOptions);
    }
    if (!connection) {
      connect(defaultSttsOptions);
    }
  }, [connect, connection, setSttOptions, setTtsOptions, sttOptions, ttsOptions]);

  useEffect(() => {
    if (connection && connection?.getReadyState() !== undefined) {
      connection.addListener(LiveTranscriptionEvents.Open, () => {
        setConnectionReady(true);
      });

      connection.addListener(LiveTranscriptionEvents.Close, () => {
        toast("The connection to Deepgram closed, we'll attempt to reconnect.");
        setConnectionReady(false);
        connection.removeAllListeners();
        setConnection(undefined);
      });

      connection.addListener(LiveTranscriptionEvents.Error, () => {
        toast(
          "An unknown error occured. We'll attempt to reconnect to Deepgram."
        );
        setConnectionReady(false);
        connection.removeAllListeners();
        setConnection(undefined);
      });
    }

    return () => {
      setConnectionReady(false);
      connection?.removeAllListeners();
    };
  }, [connection, toast]);

  return (
    <DeepgramContext.Provider
      value={{
        ttsOptions,
        setTtsOptions,
        sttOptions,
        setSttOptions,
        connection,
        connectionReady,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram() {
  const context = useContext(DeepgramContext);
  if (!context) {
    throw new Error("useDeepgram must be used within a DeepgramContextProvider");
  }
  return context;
}

export { DeepgramContextProvider, useDeepgram, voiceMap, voices, DEFAULT_TTS_MODEL };
