import { createAPIFileRoute } from "@tanstack/react-start/api";
import { Webhook } from "standardwebhooks";
import { supabase } from "../lib/supabase";

export const APIRoute = createAPIFileRoute("/api/webhook/dodo")({
  POST: async ({ request }) => {
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error("DODO_PAYMENTS_WEBHOOK_SECRET is not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const rawBody = await request.text();
    const headers = {
      "webhook-id": request.headers.get("webhook-id") || "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
      "webhook-signature": request.headers.get("webhook-signature") || "",
    };

    try {
      const wh = new Webhook(webhookSecret);
      wh.verify(rawBody, headers);
    } catch (err: any) {
      console.error("Dodo webhook verification failed:", err.message);
      return new Response("Invalid signature", { status: 400 });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (err) {
      console.error("Failed to parse Dodo webhook JSON body:", err);
      return new Response("Invalid JSON body", { status: 400 });
    }

    const eventType = payload.type || payload.event_type;
    const data = payload.data || {};
    const email = data.customer?.email;
    const productId = data.product_id;
    const subscriptionId = data.subscription_id;

    console.log(`Processing Dodo webhook event: ${eventType} for customer: ${email}`);

    if (!email) {
      console.error("No customer email in webhook data payload");
      return new Response("No email in payload", { status: 400 });
    }

    let plan = "free";
    let status = "inactive";

    if (
      eventType === "subscription.active" ||
      eventType === "subscription.renewed" ||
      eventType === "payment.succeeded"
    ) {
      if (productId === "pdt_0NiVJmJzctfUNFC2qgT1k") {
        plan = "basic";
        status = "active";
      } else if (productId === "pdt_0NiVK2h79kd3euwcFhI9z") {
        plan = "pro";
        status = "active";
      } else {
        console.warn("Dodo webhook received unknown product ID:", productId);
        return new Response("Unknown product", { status: 200 });
      }
    } else if (eventType === "subscription.cancelled" || eventType === "subscription.failed") {
      plan = "free";
      status = "inactive";
    } else {
      console.log("Dodo webhook event ignored:", eventType);
      return new Response("Event ignored", { status: 200 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        plan,
        subscription_status: status,
        subscription_id: subscriptionId || null,
      })
      .ilike("email", email);

    if (error) {
      console.error(`Database update failed for customer ${email}:`, error.message);
      return new Response("Database update failed", { status: 500 });
    }

    console.log(`Successfully updated plan to '${plan}' for customer ${email}`);
    return new Response(JSON.stringify({ success: true, plan, status }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});
