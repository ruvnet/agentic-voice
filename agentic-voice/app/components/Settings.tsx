// app/components/Settings.tsx - Settings component

import { CogIcon } from "./icons/CogIcon";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { DEFAULT_TTS_MODEL, useDeepgram, voiceMap, voices } from "../context/Deepgram";
import { Dispatch, SetStateAction, useState } from "react";
import { useToast } from "../context/Toast";
import { Key } from 'react';


const arrayOfVoices = Object.entries(voices).map((e) => ({
  ...e[1],
  model: e[0],
}));

const ModelSelection = ({
  model,
  setModel,
}: {
  model: string;
  setModel: Dispatch<SetStateAction<string>>;
}) => {
  const arrayOfVoices = Object.entries(voices).map((e) => ({
    ...e[1],
    model: e[0],
  }));

  return (
    <Select
      defaultSelectedKeys={[DEFAULT_TTS_MODEL]}
      selectedKeys={[model || DEFAULT_TTS_MODEL]}
      onSelectionChange={(keys: any) =>
        setModel(keys.entries().next().value[0])
      }
      items={arrayOfVoices}
      label="Selected voice"
      color="default"
      variant="bordered"
      aria-label="Voice selection dropdown"
      classNames={{
        label: "group-data-[filled=true]:-translate-y-5",
        trigger: "min-h-unit-16",
        listboxWrapper: "max-h-[400px]",
      }}
      listboxProps={{
        itemClasses: {
          base: [
            "rounded-md",
            "text-default-500",
            "transition-opacity",
            "data-[hover=true]:text-foreground",
            "data-[hover=true]:bg-default-100",
            "data-[hover=true]:bg-default-50",
            "data-[selectable=true]:focus:bg-default-50",
            "data-[pressed=true]:opacity-70",
            "data-[focus-visible=true]:ring-default-500",
          ],
        },
      }}
      popoverProps={{
        classNames: {
          base: "before:bg-default-200",
          content: "p-0 border-small border-divider bg-background",
        },
      }}
      renderValue={(items) => {
        return items.map((item) => {
          const voice = voiceMap(item.key as string);
          if (!voice) {
            return null;
          }
          return (
            <div key={item.key as string} className="flex items-center gap-2">
              <Avatar
                alt={voice.name}
                aria-label={`Avatar of ${voice.name}`}
                className="flex-shrink-0"
                size="sm"
                src={voice.avatar}
              />
              <div className="flex flex-col">
                <span>{voice.name}</span>
                <span className="text-default-500 text-tiny">
                  ({item.key as string} - {voice.language} {voice.accent})
                </span>
              </div>
            </div>
          );
        });
      }}
    >
      {(model) => (
        <SelectItem key={model.model} textValue={model.model} color="default">
          <div className="flex gap-2 items-center">
            <Avatar
              alt={model.name}
              aria-label={`Avatar of ${model.name}`}
              className="flex-shrink-0"
              size="sm"
              src={model.avatar}
            />
            <div className="flex flex-col">
              <span className="text-small">{model.name}</span>
              <span className="text-tiny text-default-400">
                {model.model} - {model.language} {model.accent}
              </span>
            </div>
          </div>
        </SelectItem>
      )}
    </Select>
  );
};

const VoiceSettings = ({
  model,
  setModel,
  ttsOptions,
  setTtsOptions
}: {
  model: string,
  setModel: Dispatch<SetStateAction<string>>,
  ttsOptions: any,
  setTtsOptions: Dispatch<SetStateAction<any>>
}) => (
  <>
    <h2>Text-to-Speech Settings</h2>
    <ModelSelection model={model} setModel={setModel} />
    <div className="flex items-center gap-2 mt-4">
      <label htmlFor="auto-voice" className="text-sm">
        Auto Voice
      </label>
      <Select
        id="auto-voice"
        items={[
          { key: "on", name: "On" },
          { key: "off", name: "Off" },
        ]}
        selectedKeys={[ttsOptions.autoVoice]}
        onSelectionChange={(keys: any) =>
          setTtsOptions({ ...ttsOptions, autoVoice: keys.entries().next().value[0] })
        }
      >
        {(item) => <SelectItem key={item.key}>{item.name}</SelectItem>}
      </Select>
    </div>
  </>
);

const PromptSettings = () => (
  <>
    <h2>Prompt Settings</h2>
    <div className="flex flex-col gap-4">
      <label htmlFor="memory" className="text-sm">
        Memory
      </label>
      <input
        type="text"
        id="memory"
        className="border p-2 rounded"
        // add corresponding state and event handler for memory setting
      />
      <label htmlFor="other-prompt" className="text-sm">
        Other Prompt Configurations
      </label>
      <textarea
        id="other-prompt"
        className="border p-2 rounded"
        // add corresponding state and event handler for other prompt configurations
      />
    </div>
  </>
);

const PresentationModeSettings = ({
  presentationMode,
  setPresentationMode
}: {
  presentationMode: string,
  setPresentationMode: Dispatch<SetStateAction<string>>
}) => (
  <>
    <h2>Presentation Mode</h2>
    <div className="flex items-center gap-2 mt-4">
      <label htmlFor="presentation-mode" className="text-sm">
        Hide Default Chat UI
      </label>
      <Select
        id="presentation-mode"
        items={[
          { key: "on", name: "On" },
          { key: "off", name: "Off" },
        ]}
        selectedKeys={[presentationMode]}
        onSelectionChange={(keys: any) =>
          setPresentationMode(keys.entries().next().value[0])
        }
      >
        {(item) => <SelectItem key={item.key}>{item.name}</SelectItem>}
      </Select>
    </div>
  </>
);

export const Settings = () => {
  const { toast } = useToast();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { ttsOptions, setTtsOptions } = useDeepgram();
  const [model, setModel] = useState<string>(ttsOptions?.model as string);
  const [presentationMode, setPresentationMode] = useState<string>("off");
  const [selectedTab, setSelectedTab] = useState("voice");

  const handleTabChange = (key: Key) => {
    setSelectedTab(key as string);
  };

  return (
    <>
      <div className="flex items-center gap-2.5 text-sm">
        <span className="bg-gradient-to-r to-[#13EF93]/50 from-[#149AFB]/80 rounded-full flex">
          <a
            className={`relative m-px bg-black md:w-[9.25rem] w-10 h-10 rounded-full text-sm p-2.5 group md:hover:w-[9.25rem] transition-all ease-in-out duration-1000 overflow-hidden whitespace-nowrap`}
            href="#"
            onClick={onOpen}
          >
            <CogIcon className="w-5 h-5 transition-transform ease-in-out duration-2000 group-hover:rotate-180" />
            <span className="ml-2.5 text-xs">Change settings</span>
          </a>
        </span>
        <span className="hidden md:inline-block text-white/50 font-inter">
          Voice:{" "}
          <span className="text-white">
            {voiceMap(ttsOptions?.model as string).name}
          </span>
        </span>
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        className="glass"
      >
        <ModalContent>
          {(onClose) => {
            const saveAndClose = () => {
              setTtsOptions({ ...ttsOptions, model });

              toast("Options saved.");

              onClose();
            };

            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Settings
                </ModalHeader>
                <ModalBody>
                <Tabs selectedKey={selectedTab} onSelectionChange={handleTabChange}>
                  <Tab key="voice" title="Voice Settings">
                    <VoiceSettings
                      model={model}
                      setModel={setModel}
                      ttsOptions={ttsOptions}
                      setTtsOptions={setTtsOptions}
                    />
                  </Tab>
                  <Tab key="prompt" title="Prompt Settings">
                    <PromptSettings />
                  </Tab>
                  <Tab key="presentation" title="Presentation Mode">
                    <PresentationModeSettings
                      presentationMode={presentationMode}
                      setPresentationMode={setPresentationMode}
                    />
                  </Tab>
                </Tabs>
              </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={saveAndClose}>
                    Save
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </>
  );
};
