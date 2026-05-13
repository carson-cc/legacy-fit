import sgMail from '@sendgrid/mail'
import type { ReferenceProfile } from './data/profiles'
import { COMPANY_EMAIL, PRODUCT_NAME, COMPANY_URL } from './brand'

function client() {
  const key = process.env.SENDGRID_API_KEY
  if (!key) throw new Error('SENDGRID_API_KEY is not set')
  sgMail.setApiKey(key)
  return sgMail
}

const FROM = process.env.SENDGRID_FROM || COMPANY_EMAIL

// ─── Password reset email ──────────────────────────────────────────────────

export async function sendPasswordResetEmail(opts: {
  to: string
  name: string | null
  resetUrl: string
}) {
  const { to, name, resetUrl } = opts
  const firstName = name ? name.split(' ')[0] : 'there'
  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;background:#f9fafb;margin:0;padding:0">
    <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:8px;padding:40px;border:1px solid #e5e7eb;color:#374151">
      <p>Hi ${firstName},</p>
      <p>We received a request to reset your ${PRODUCT_NAME} password. Click the button below to choose a new one. The link is valid for one hour.</p>
      <p style="margin:28px 0"><a href="${resetUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600">Reset password</a></p>
      <p style="font-size:13px;color:#6B7280">If you didn't request this, you can safely ignore this email — your password will not change.</p>
      <p style="margin-top:24px;color:#6B7280">— ${PRODUCT_NAME}</p>
    </div>
  </body></html>`
  const text = `Hi ${firstName},\n\nReset your ${PRODUCT_NAME} password: ${resetUrl}\n\nThe link is valid for one hour. If you didn't request this, ignore this email.\n\n— ${PRODUCT_NAME}`
  await client().send({ to, from: FROM, subject: `Reset your ${PRODUCT_NAME} password`, html, text })
}

// ─── Team invite email ─────────────────────────────────────────────────────

export async function sendTeamInviteEmail(opts: {
  to: string
  inviterName: string
  firmName: string
  acceptUrl: string
}) {
  const { to, inviterName, firmName, acceptUrl } = opts
  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;background:#f9fafb;margin:0;padding:0">
    <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:8px;padding:40px;border:1px solid #e5e7eb;color:#374151">
      <p>You've been invited to ${firmName} on ${PRODUCT_NAME}.</p>
      <p>${inviterName} has invited you to join their team. Click below to accept and set up your account.</p>
      <p style="margin:28px 0"><a href="${acceptUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600">Accept invite</a></p>
      <p style="font-size:13px;color:#6B7280">This invite is valid for 14 days.</p>
      <p style="margin-top:24px;color:#6B7280">— ${PRODUCT_NAME}</p>
    </div>
  </body></html>`
  const text = `You've been invited to ${firmName} on ${PRODUCT_NAME} by ${inviterName}. Accept: ${acceptUrl}`
  await client().send({ to, from: FROM, subject: `${inviterName} invited you to ${firmName} on ${PRODUCT_NAME}`, html, text })
}

// ─── Invite email ──────────────────────────────────────────────────────────

export async function sendInviteEmail(opts: {
  candidateName: string
  candidateEmail: string
  recruiterName: string
  firmName: string
  jobTitle: string
  roleTitle: string
  assessUrl: string
}) {
  const { candidateName, candidateEmail, recruiterName, firmName, jobTitle, roleTitle, assessUrl } = opts
  const firstName = candidateName.split(' ')[0]
  const displayTitle = roleTitle || jobTitle

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;background:#f9fafb;margin:0;padding:0}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}
  .body{padding:40px;color:#374151;font-size:15px;line-height:1.7}
  .btn{display:inline-block;background:#2563EB;color:#fff !important;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:15px;margin:24px 0}
  .footer{padding:16px 40px;border-top:1px solid #E5E7EB;font-size:12px;color:#9CA3AF}
  p{margin:0 0 16px}
</style></head>
<body>
  <div class="wrap">
    <div class="body">
      <p>Hi ${firstName},</p>
      <p>${recruiterName} has sent you a short behavioral evaluation as part of the <strong>${displayTitle}</strong> process.</p>
      <p>It takes about 6 minutes. No login required.<br>There are no right or wrong answers.</p>
      <a href="${assessUrl}" class="btn">Start Evaluation &rarr;</a>
      <p>Once complete, you&rsquo;ll receive a copy of your behavioral profile by email.</p>
      <p>Questions? Reply to this email.</p>
      <p style="margin-top:24px;color:#6B7280">&mdash; ${PRODUCT_NAME}</p>
    </div>
    <div class="footer">${PRODUCT_NAME} &middot; ${COMPANY_URL}</div>
  </div>
</body>
</html>`

  const text = [
    `Hi ${firstName},`,
    '',
    `${recruiterName} has sent you a short behavioral evaluation as part of the ${displayTitle} process.`,
    '',
    'It takes about 6 minutes. No login required. There are no right or wrong answers.',
    '',
    assessUrl,
    '',
    "Once complete, you'll receive a copy of your behavioral profile by email.",
    '',
    `Questions? Reply to this email.\n\n— ${PRODUCT_NAME}`,
  ].join('\n')

  await client().send({
    to: candidateEmail,
    from: FROM,
    subject: `${firmName} — Behavioral evaluation for ${displayTitle}`,
    html,
    text,
  })
}

// ─── Candidate profile email ───────────────────────────────────────────────

export async function sendCandidateProfileEmail(opts: {
  candidateName: string
  candidateEmail: string
  profile: ReferenceProfile
  pdfBuffer: Buffer
}) {
  const { candidateName, candidateEmail, profile, pdfBuffer } = opts
  const firstName = candidateName.split(' ')[0]

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;background:#f9fafb;margin:0;padding:0}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}
  .body{padding:40px;color:#374151;font-size:15px;line-height:1.7}
  .profile-card{background:#0B0F14;border-radius:8px;padding:24px;margin:20px 0}
  .eyebrow{font-size:10px;color:#6B7280;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px}
  .profile-name{font-size:22px;font-weight:700;color:#fff;margin:0 0 6px;letter-spacing:-0.02em}
  .tagline{font-size:13px;color:#9CA3AF;margin:0}
  .footer{padding:16px 40px;border-top:1px solid #E5E7EB;font-size:12px;color:#9CA3AF}
  p{margin:0 0 16px}
</style></head>
<body>
  <div class="wrap">
    <div class="body">
      <p>Hi ${firstName},</p>
      <p>Your behavioral evaluation is complete. Your profile is attached as a PDF.</p>
      <div class="profile-card">
        <p class="eyebrow">${profile.groupLabel}</p>
        <div class="profile-name">${profile.name}</div>
        <p class="tagline">${profile.tagline}</p>
      </div>
      <p>${profile.description}</p>
      <p style="font-size:13px;color:#9CA3AF">This profile reflects your natural working style &mdash; not your skills or performance.</p>
      <p style="margin-top:24px;color:#6B7280">&mdash; ${PRODUCT_NAME}</p>
    </div>
    <div class="footer">${PRODUCT_NAME} &middot; ${COMPANY_URL}</div>
  </div>
</body>
</html>`

  const text = [
    `Hi ${firstName},`,
    '',
    'Your behavioral evaluation is complete. Your profile is attached as a PDF.',
    '',
    `${profile.name} — ${profile.groupLabel}`,
    profile.tagline,
    '',
    profile.description,
    '',
    `— ${PRODUCT_NAME}`,
  ].join('\n')

  await client().send({
    to: candidateEmail,
    from: FROM,
    subject: `Your behavioral profile — ${profile.name}`,
    html,
    text,
    attachments: [
      {
        content: pdfBuffer.toString('base64'),
        filename: `${candidateName.replace(/\s+/g, '_')}_profile.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  })
}

// ─── Recruiter completion notification ─────────────────────────────────────

export async function sendRecruiterNotificationEmail(opts: {
  recruiterEmail: string
  candidateName: string
  jobTitle: string
  fitPct: number
  recommendation: string
  confidence: string
  percentileLabel: string
  reportUrl: string
}) {
  const { recruiterEmail, candidateName, jobTitle, fitPct, recommendation, confidence, percentileLabel, reportUrl } = opts

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;background:#f9fafb;margin:0;padding:0}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}
  .body{padding:40px;color:#374151;font-size:15px;line-height:1.7}
  .card{background:#F9FAFB;border-radius:8px;padding:20px;margin:20px 0}
  .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #E5E7EB}
  .row:last-child{border-bottom:none}
  .label{color:#6B7280;font-size:13px}
  .value{color:#111827;font-weight:600;font-size:14px}
  .btn{display:inline-block;background:#111827;color:#fff !important;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:600;font-size:14px;margin-top:8px}
  .footer{padding:14px 40px;border-top:1px solid #E5E7EB;font-size:12px;color:#9CA3AF}
  p{margin:0 0 12px}
</style></head>
<body>
  <div class="wrap">
    <div class="body">
      <p><strong>${candidateName}</strong> finished their evaluation for <strong>${jobTitle}</strong>.</p>
      <div class="card">
        <div class="row"><span class="label">Score</span><span class="value">${fitPct}</span></div>
        <div class="row"><span class="label">Recommendation</span><span class="value">${recommendation}</span></div>
        <div class="row"><span class="label">Confidence</span><span class="value">${confidence} &middot; ${percentileLabel}</span></div>
      </div>
      <a href="${reportUrl}" class="btn">View Full Report &rarr;</a>
    </div>
    <div class="footer">${PRODUCT_NAME} &middot; ${COMPANY_URL}</div>
  </div>
</body>
</html>`

  const text = [
    `${candidateName} finished their evaluation for ${jobTitle}.`,
    '',
    `Score: ${fitPct}`,
    `Recommendation: ${recommendation}`,
    `Confidence: ${confidence} · ${percentileLabel}`,
    '',
    `View full report: ${reportUrl}`,
    '',
    `— ${PRODUCT_NAME}`,
  ].join('\n')

  await client().send({
    to: recruiterEmail,
    from: FROM,
    subject: `${candidateName} completed — ${recommendation}`,
    html,
    text,
  })
}

// ─── Client portal magic-link email ────────────────────────────────────────

export async function sendClientPortalEmail(opts: {
  to: string
  contactName: string
  firmName: string
  jobTitle: string
  clientName: string
  portalUrl: string
  expiresInDays: number
}) {
  const { to, contactName, firmName, jobTitle, clientName, portalUrl, expiresInDays } = opts
  const firstName = contactName.split(' ')[0]

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;background:#f9fafb;margin:0;padding:0}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}
  .body{padding:40px;color:#374151;font-size:15px;line-height:1.7}
  .btn{display:inline-block;background:#111827;color:#fff !important;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:15px;margin:24px 0}
  .footer{padding:16px 40px;border-top:1px solid #E5E7EB;font-size:12px;color:#9CA3AF}
  p{margin:0 0 16px}
</style></head>
<body>
  <div class="wrap">
    <div class="body">
      <p>Hi ${firstName},</p>
      <p>${firmName} has prepared a shortlist of assessed candidates for the <strong>${jobTitle}</strong> search at <strong>${clientName}</strong>.</p>
      <p>Click below to view candidate profiles. You can advance or pass on each candidate directly from the portal.</p>
      <a href="${portalUrl}" class="btn">View Shortlist &rarr;</a>
      <p style="font-size:13px;color:#6B7280">This link is personal to you and expires in ${expiresInDays} day${expiresInDays === 1 ? '' : 's'}. Do not forward it.</p>
      <p style="margin-top:24px;color:#6B7280">&mdash; ${firmName} via ${PRODUCT_NAME}</p>
    </div>
    <div class="footer">${PRODUCT_NAME} &middot; ${COMPANY_URL}</div>
  </div>
</body>
</html>`

  const text = [
    `Hi ${firstName},`,
    '',
    `${firmName} has prepared a shortlist of assessed candidates for the ${jobTitle} search at ${clientName}.`,
    '',
    `View candidates: ${portalUrl}`,
    '',
    `This link expires in ${expiresInDays} day${expiresInDays === 1 ? '' : 's'}. Do not forward it.`,
    '',
    `— ${firmName} via ${PRODUCT_NAME}`,
  ].join('\n')

  await client().send({
    to,
    from: FROM,
    subject: `${firmName} — Your candidate shortlist for ${jobTitle}`,
    html,
    text,
  })
}
