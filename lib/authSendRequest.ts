import { EmailConfig } from "next-auth/providers/email";

type Theme = {
  brandColor?: string;
  buttonText?: string;
};

export async function sendVerificationRequest(params: { identifier: string; url: string; expires: Date; provider: EmailConfig; token: string; theme: Theme; request: Request; }) {
  const { identifier: to, provider, url, theme } = params;
  const { host } = new URL(url);
  
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: provider.from,
      to,
      subject: `Sign in to ${host}`,
      html: html({ url, host, theme }),
      text: text({ url, host }),
    }),
  });

  if (!res.ok)
    throw new Error("Resend error: " + JSON.stringify(await res.json()));
}

function html(params: { url: string; host: string; theme: Theme }) {
  const { url, theme } = params;

  const brandColor = theme.brandColor || "#ff6f61";
  const color = {
    background: "#f0f0f0",
    text: "#555",
    headerText: "#333",
    footerText: "#888",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonText: theme.buttonText || "#fff",
  };

  return `
  <body style="background: ${color.background}; padding: 30px;">
    <table width="100%" cellpadding="20" cellspacing="0" style="max-width: 600px; margin: auto; background: ${color.mainBackground}; border-radius: 8px; font-family: Helvetica, Arial, sans-serif;">
      <tr>
        <td align="center" style="font-size: 24px; color: ${color.headerText};">
          <strong>Welcome to GameXchange</strong>
        </td>
      </tr>
      <tr>
        <td align="center" style="font-size: 18px; color: ${color.text};">
          Ready to borrow, trade, and discover new board games with your group?
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <a href="${url}" target="_blank" style="background: ${color.buttonBackground}; color: ${color.buttonText}; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 18px; font-weight: bold;">Sign in to GameXchange</a>
        </td>
      </tr>
      <tr>
        <td align="center" style="font-size: 14px; color: ${color.footerText};">
          If you didn’t request this email, you can ignore it. Happy gaming!
        </td>
      </tr>
    </table>
  </body>`;
}

// Email Text body (fallback)
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}
