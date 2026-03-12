import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Standard express-on-vercel logic
    return app(req as any, res as any);
  } catch (error: any) {
    console.error("FUNCTION_ERROR:", error);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
}
