type SendArgs = { to: string; subject: string; html: string; text?: string }

export async function sendMail({ to, subject, html, text }: SendArgs) {
  const from = process.env.EMAIL_FROM
  const resendKey = process.env.RESEND_API_KEY
  const dryRun = !from || !resendKey

  if (dryRun) {
    console.log('[MAIL:DRY]', { to, subject, html })
    return { ok: true, dry: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject, html, text })
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('[MAIL:ERROR]', res.status, body)
      return { ok: false, error: body }
    }
    return { ok: true }
  } catch (e:any) {
    console.error('[MAIL:EXCEPTION]', e?.message)
    return { ok: false, error: e?.message }
  }
}


