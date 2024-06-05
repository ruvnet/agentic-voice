"use client";

import Image from "next/image";
import GitHubButton from "react-github-btn";

export const runtime = "edge";
import { init } from "@fullstory/browser";
import { useEffect } from "react";
import { XIcon } from "./components/icons/XIcon";
import { FacebookIcon } from "./components/icons/FacebookIcon";
import { LinkedInIcon } from "./components/icons/LinkedInIcon";
import Conversation from "./components/Conversation";

export default function Home() {
  useEffect(() => {
    init({ orgId: "5HWAN" });
  }, []);

  return (
    <>
      <div className="h-full overflow-hidden">
        {/* height 4rem */}
        <div className="bg-gradient-to-b from-black/50 to-black/10 backdrop-blur-[2px] h-[4rem] flex items-center">
          <header className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-between pt-4 md:pt-0 gap-2">
            <div>
            <a className="flex items-center justify-start" href="/" style={{ marginLeft: '-20px' }}>
            <Image
              className="w-auto h-auto max-w-full sm:max-w-none"
              src="/agentic-voice-logo-white.png"
              alt="Agentic Voice"
              width={100} // Adjust width as needed
              height={40} // Adjust height as needed
              priority
            />
          </a>
            </div>
            <div className="flex items-center justify-center md:gap-6 text-sm">
              <span className="mt-1">
               
              </span>

              <span className="gradient-shadow bg-gradient-to-r to-[#13EF93]/50 from-[#149AFB]/80 rounded">
                
              </span>
            </div>
          </header>
        </div>

        {/* height 100% minus 8rem */}
        <main className="mx-auto max-w-7xl  px-4 md:px-6 lg:px-8 h-[calc(100%-8rem)]">
          <Conversation />
        </main>

        {/* height 4rem */}
        <div className=" backdrop-blur-[2px] h-[4rem] flex items-center">
          <footer className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-center gap-4 md:text-xl font-inter text-[#8a8a8e]">
             
          </footer>
        </div>
      </div>
    </>
  );
}
