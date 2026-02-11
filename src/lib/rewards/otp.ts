export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9+]/g, "").trim();
  if (!digits) return "";

  if (digits.startsWith("+")) return digits;

  if (digits.startsWith("0")) {
    return `+81${digits.slice(1)}`;
  }

  if (digits.startsWith("81")) {
    return `+${digits}`;
  }

  return digits;
}

export function generateOtpCode(): string {
  return String(Math.floor(Math.random() * 900000) + 100000);
}

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[OTP DEV] ${phone}: ${code}`);
      return;
    }
    throw new Error("Twilio設定が未完了です");
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({
    To: phone,
    From: from,
    Body: `【ORIPA】認証コード: ${code}（5分有効）`,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SMS送信に失敗しました: ${text}`);
  }
}
