import { NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, invite_code } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "mubashir.mandvia@gmail.com",
      subject: "You're invited to join a team 🎉",
      react: EmailTemplate({ email, invite_code }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
