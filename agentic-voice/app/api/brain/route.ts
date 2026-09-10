import {brain} from "../../../lib/providers.mjs";
export const runtime="nodejs";
export const POST=(req:Request)=>brain(req);
