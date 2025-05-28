
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ComplaintNotificationRequest {
  complaint: {
    complaint_id: string;
    complaint_type: string;
    description: string;
    location: string;
    status: string;
    created_at: string;
  };
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { complaint, userDetails }: ComplaintNotificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Muzaffarpur Seva Sathi <onboarding@resend.dev>",
      to: ["harsh171517@gmail.com"],
      subject: `New Complaint Submitted - ${complaint.complaint_id}`,
      html: `
        <h2>New Complaint Received</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Complaint Details</h3>
          <p><strong>Tracking ID:</strong> ${complaint.complaint_id}</p>
          <p><strong>Type:</strong> ${complaint.complaint_type}</p>
          <p><strong>Location:</strong> ${complaint.location || 'Not specified'}</p>
          <p><strong>Status:</strong> ${complaint.status}</p>
          <p><strong>Submitted on:</strong> ${new Date(complaint.created_at).toLocaleString()}</p>
          
          <h4>Description:</h4>
          <p style="background-color: white; padding: 10px; border-radius: 4px;">${complaint.description}</p>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>User Information</h3>
          <p><strong>Name:</strong> ${userDetails.name}</p>
          <p><strong>Email:</strong> ${userDetails.email}</p>
          <p><strong>Phone:</strong> ${userDetails.phone}</p>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          This email was sent automatically from the Muzaffarpur Seva Sathi complaint system.
        </p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-complaint-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
