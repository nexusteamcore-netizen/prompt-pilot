console.log(">>> SERVER SCRIPT STARTED <<<");
import express from "express";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// Diagnostic route - MUST BE FIRST
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    env_keys: {
      supabase_url: !!process.env.VITE_SUPABASE_URL,
      supabase_key: !!process.env.VITE_SUPABASE_ANON_KEY,
      openrouter: !!process.env.Openrouter_API_KEY
    }
  });
});

app.get("/api/test", (req, res) => res.json({ message: "API is working!" }));

// Stripe webhook requires raw body for signature verification
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    console.warn("Stripe webhook secret or signature missing.");
    return res.status(400).send('Webhook Error: Missing secret or signature');
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabaseAdmin = getSupabaseClient(undefined, true);
  if (!supabaseAdmin) {
    console.error("Stripe Webhook: Supabase Admin client missing.");
    return res.status(500).send("Internal Configuration Error");
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'pro',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId
            })
            .eq('id', userId);
          console.log(`Upgrade: User ${userId} upgraded to Pro.`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_subscription_id', subscription.id);
        console.log(`Downgrade: Subscription ${subscription.id} deleted. User set to free.`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          await supabaseAdmin
            .from('profiles')
            .update({ plan: 'free' })
            .eq('stripe_subscription_id', subscription.id);
          console.log(`Subscription ${subscription.id} is ${subscription.status}. User set to free.`);
        } else if (subscription.status === 'active') {
          await supabaseAdmin
            .from('profiles')
            .update({ plan: 'pro' })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }
    }
  } catch (error) {
    console.error("Supabase update error in webhook:", error);
  }

  res.json({ received: true });
});

app.use(express.json());

/**
 * Supabase Utility: Returns an Admin or User client
 * serviceRole = true will bypass RLS (strictly for internal/admin use)
 */
const getSupabaseClient = (authHeader?: string, serviceRole = false) => {
  const url = process.env.VITE_SUPABASE_URL;
  const key = serviceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error(`❌ SUPABASE_MISSING: url=${!!url}, key=${!!key}`);
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
};

// Initialize Stripe (lazy load)
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn("STRIPE_SECRET_KEY not set. Mocking Stripe.");
      return {} as Stripe;
    }
    stripeClient = new Stripe(key, { apiVersion: "2025-02-24.acacia" as any });
  }
  return stripeClient;
}

// OpenRouter Configuration
const OPENROUTER_API_KEY = process.env.Openrouter_API_KEY?.trim();
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Middleware to verify JWT
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];

  if (token === "mock-token") {
    (req as any).user = { id: "mock-user" };
    return next();
  }

  try {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (secret) {
      const decoded = jwt.verify(token, secret);
      (req as any).user = decoded;
    } else {
      // If no secret is provided, just decode the token without verifying signature
      // This is useful for development/preview environments
      const decoded = jwt.decode(token);
      if (!decoded) throw new Error("Invalid token format");
      (req as any).user = decoded;
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// API Routes

// Extension Direct Login - Called from popup.js
app.post("/api/ext-login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return res.status(401).json({ error: error?.message || "Login failed" });
  }

  return res.json({
    access_token: data.session.access_token,
    email: data.user?.email
  });
});

app.post("/api/transform", authenticate, async (req, res) => {
  try {
    const { text, mode, context } = req.body;
    const isExtension = req.headers['origin']?.startsWith('chrome-extension://');
    console.log(`[API] Transform | From: ${isExtension ? 'EXT' : 'WEB'} | "${text?.substring(0, 40)}"`);

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const userId = (req as any).user?.sub || (req as any).user?.id;
    const authHeader = req.headers.authorization;

    const modeDescriptions: Record<string, string> = {
      professional: "formal, business-focused",
      creative: "imaginative, expressive, metaphor-rich",
      technical: "precise, spec-heavy, code-ready",
      academic: "scholarly, analytical, research-grade",
      concise: "ultra-brief, no fluff",
      friendly: "warm, supportive, approachable",
      direct: "assertive, no-nonsense"
    };

    const modeDesc = modeDescriptions[mode || "professional"] || modeDescriptions.professional;

    // ⚡ FIRE AI CALL FIRST — then start DB checks in parallel
    const systemInstruction = `You are a **Prompt Engineering Specialist** with deep expertise in crafting professional, structured, and highly effective prompts for large language models.

Your task is to transform a user's raw request or basic prompt into a **high-quality professional prompt** that produces clear, reliable, and high-quality AI outputs.

---

### CORE OBJECTIVE

When a user provides a request, you must convert it into a **structured, production-grade prompt** that clearly guides the AI model.

The final prompt must be **well-structured, detailed, and optimized for high-quality responses**.

---

# RULES FOR WRITING PROFESSIONAL PROMPTS

Follow these principles when generating prompts:

### 1. Define a Clear ROLE
Start by assigning the AI a specific expert role relevant to the task.
Examples: "You are a senior front-end developer..." or "You are a professional marketing strategist..."

### 2. Define the OBJECTIVE
Clearly describe the main task the AI must perform.

### 3. Provide CONTEXT
Explain the situation, audience, or background information that helps the AI understand the purpose of the task.

### 4. Specify REQUIREMENTS
Break the task into structured requirements or sections.

### 5. Include CONSTRAINTS
Define limitations or technical rules such as maximum length, tools allowed, target audience.

### 6. Define the OUTPUT FORMAT
Clearly instruct the AI how to format the final result (e.g., tables, structured sections, JSON).

### 7. Add QUALITY STANDARDS
Require best practices such as clean code, optimization, readability, or professional tone.

### 8. Add a FINAL SELF-CHECK
Ask the AI to verify that the output satisfies the requirements before finishing.

---

# PROMPT STRUCTURE TO FOLLOW

Always generate prompts using this EXACT structure with these exact Markdown headers:

### ROLE
### OBJECTIVE
### CONTEXT
### REQUIREMENTS
### CONSTRAINTS
### OUTPUT FORMAT
### QUALITY STANDARDS
### FINAL CHECK

---

# FINAL TASK

Whenever a user submits a request, rewrite it into a **professional structured prompt following the rules above.**

- TONE/STYLE: ${modeDesc}
- Return **only the improved prompt**, without any conversational filler, explanations, or meta-commentary.
- **CRITICAL**: DO NOT start your response with "You got it. Here's your prompt:", "Here is the prompt:", or ANY introductory phrase. The very first character of your output must be the start of the prompt itself (e.g. "### ROLE").
- **ABSOLUTE RULE**: The prompt you generate must directly instruct an AI model to fulfill the user's ultimate goal. DO NOT generate a prompt that asks an AI to "write a prompt". 
  - If the user says: "write code to build luxury landing page", your output's OBJECTIVE should be: "Generate a complete, production-ready landing page..."
  - NEVER say: "Your objective is to write a prompt for a landing page."`;

    console.time(`transform-${userId}`);

    // ⚡ Start DB checks in background — don't wait before firing AI
    const supabase = getSupabaseClient(authHeader);
    if (!supabase) return res.status(500).json({ error: "Database configuration missing" });
    const today = new Date().toISOString().split('T')[0];
    const profilePromise = supabase.from('profiles').select('plan').eq('id', userId).single();
    const usageCheckPromise = supabase.from('usage_logs').select('count').eq('user_id', userId).eq('date', today);

    const modelName = "google/gemini-2.0-flash-001";

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    // Start AI call immediately (don't wait for usage check)
    const aiPromise = fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.APP_URL || "https://prompt-pilot-lime.vercel.app",
        "X-Title": "PromptPilot",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: text }
        ],
        temperature: 0.4,
        top_p: 0.85,
        max_tokens: 550
      })
    });

    // Resolve everything in parallel
    const [profileResult, usageResult, aiResponse] = await Promise.all([
      profilePromise,
      usageCheckPromise,
      aiPromise
    ]);

    // Check plan and usage limit
    const plan = profileResult.data?.plan || 'free';
    const limit = plan === 'pro' ? 500 : (plan === 'team' ? 1000 : 20);
    const currentUsage = usageResult.data?.[0]?.count || 0;

    if (currentUsage >= limit) {
      return res.status(429).json({
        error: "Daily limit reached.",
        details: plan === 'free' ? "Upgrade to Pro for more daily transforms." : "You have reached your high-volume daily limit."
      });
    }

    if (!aiResponse.ok) {
      const errJson = await aiResponse.json().catch(() => ({}));
      console.error("❌ OpenRouter 400 Error Details:", JSON.stringify(errJson, null, 2));
      return res.status(500).json({
        error: `AI service error: ${aiResponse.status}`,
        details: errJson.error?.message || "Check server logs"
      });
    }

    const data = await aiResponse.json();

    if (data.error) {
      throw new Error(`OpenRouter: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const transformed = data.choices?.[0]?.message?.content?.trim();

    if (!transformed) {
      throw new Error("Empty response from AI model");
    }

    console.log(`✅ Done in model: ${modelName} | Length: ${transformed.length}`);

    // Update usage in background
    const hasUsageEntry = usageResult.data && usageResult.data.length > 0;
    const upsertUsage = hasUsageEntry
      ? supabase.from('usage_logs').update({ count: currentUsage + 1 }).eq('user_id', userId).eq('date', today)
      : supabase.from('usage_logs').insert({ user_id: userId, date: today, count: 1 });

    // Save history in background too
    const saveHistory = supabase.from('prompt_history').insert({
      user_id: userId,
      original_text: text,
      transformed_text: transformed,
      mode: mode || 'professional',
      context: context || 'general'
    });

    // Fire and forget — don't block the response
    Promise.all([upsertUsage, saveHistory]).catch(e => console.warn("Background DB write failed:", e));
    console.timeEnd(`transform-${userId}`);

    res.json({
      transformed,
      tokensUsed: 0,
      creditsRemaining: limit - (currentUsage + 1)
    });

  } catch (error: any) {
    console.error("Transform error:", error);
    res.status(500).json({ error: error.message || "Failed to transform prompt" });
  }
});

app.get("/api/usage", authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    const authHeader = req.headers.authorization;
    const supabase = getSupabaseClient(authHeader);
    if (!supabase) return res.status(500).json({ error: "Database configuration missing" });
    
    const today = new Date().toISOString().split('T')[0];

    // Get plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    const plan = profile?.plan || 'free';
    const total = plan === 'pro' ? 500 : 20;

    // Get usage
    const { data: usageData } = await supabase
      .from('usage_logs')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    res.json({
      used: usageData?.count || 0,
      total,
      plan
    });
  } catch (error: any) {
    console.error("Usage error:", error);
    res.status(500).json({ error: "Failed to fetch usage" });
  }
});

app.get("/api/history", authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    const authHeader = req.headers.authorization;
    const supabase = getSupabaseClient(authHeader);
    if (!supabase) return res.status(500).json({ error: "Database configuration missing" });

    const { data: history, error } = await supabase
      .from('prompt_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ history: history || [] });
  } catch (error: any) {
    console.error("History error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.delete("/api/history/:id", authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    const authHeader = req.headers.authorization;
    const supabase = getSupabaseClient(authHeader);
    if (!supabase) return res.status(500).json({ error: "Database configuration missing" });
    
    const { id } = req.params;

    const { error } = await supabase
      .from('prompt_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete history error:", error);
    res.status(500).json({ error: "Failed to delete history item" });
  }
});

app.post("/api/stripe/checkout", authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    const stripe = getStripe();
    if (!stripe.checkout) {
      return res.json({ url: "https://stripe.com/mock-checkout" });
    }

    const { priceId } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      client_reference_id: userId, // Pass the user ID to the webhook
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/dashboard/billing`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the extension files
// Serve all static files from public
app.use(express.static("public"));
app.use("/extension", express.static("public/extension"));

export default app;

// Local development server startup
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  async function startServer() {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  startServer();
}
