import {transcribe} from "../../../lib/providers.mjs";
export const runtime="nodejs";
export const POST=(req:Request)=>transcribe(req);
