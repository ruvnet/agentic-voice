import {speak} from "../../../lib/providers.mjs";
export const runtime="nodejs";
export const POST=(req:Request)=>speak(req);
