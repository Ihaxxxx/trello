import * as React from "react";

export interface EmailTemplateProps {
  email: string;
  invite_code: string;
}

export function EmailTemplate({ email, invite_code }: EmailTemplateProps) {
  return (
    <div className="font-sans text-gray-800 leading-relaxed">
      <h1 className="text-indigo-600 text-2xl font-bold">
        👋 Welcome, {email}!
      </h1>

      <p className="mt-4">
        You’ve been invited to join a team.
      </p>

      <p className="mt-2">
        To accept this invitation, please enter the following code in the invite
        dialog on our website:
      </p>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
        <code className="text-lg font-mono tracking-wide text-indigo-700">
          {invite_code}
        </code>
      </div>

      <p className="mt-6 text-sm text-gray-600">
        If you didn’t expect this invite, you can safely ignore this email.
      </p>

      <hr className="my-6 border-gray-300" />

      <p className="text-xs text-gray-500">
        Need help? Contact our support team.
      </p>
    </div>
  );
}
