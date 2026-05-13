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
        filename: `${candidateName.replace(/\s+/g, '-')}-behavioral-profile.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  })
}

// ─── Recruiter notification email ─────────────────────────────────────────

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
  .score-block{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:20px 0}
  .row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #F3F4F6;font-size:14px}
  .row:last-child{border-bottom:none}
  .label{color:#6B7280}
  .value{font-weight:600;color:#111827}
  .btn{display:inline-block;background:#2563EB;color:#fff !important;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:15px;margin:16px 0}
  .footer{padding:16px 40px;border-top:1px solid #E5E7EB;font-size:12px;color:#9CA3AF}
  p{margin:0 0 16px}
</style></head>
<body>
  <div class="wrap">
    <div class="body">
      <p><strong>${candidateName}</strong> finished their evaluation for <strong>${jobTitle}</strong>.</p>
      <div class="score-block">
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

// ─── Approval request email ────────────────────────────────────────────────

export async function sendApprovalRequestEmail(opts: {
  partnerEmail: string
  partnerName: string
  requesterName: string
  candidateName: string
  jobTitle: string
  clientName: string
  dashboardUrl: string
}) {
  const { partnerEmail, partnerName, requesterName, candidateName, jobTitle, clientName, dashboardUrl } = opts
  const firstName = partnerName.split(' ')[0]

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;background:#f9fafb;margin:0;padding:0}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}
  .body{padding:40px;color:#374151;font-size:15px;line-height:1.7}
  .info-block{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:20px 0}
  .row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #F3F4F6;font-size:14px}
  .row:last-child{border-bottom:none}
  .lbl{color:#6B7280}.val{font-weight:600;color:#111827}
  .btn{display:inline-block;background:#2563EB;color:#fff !important;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:15px;margin:16px 0}
  .footer{padding:16px 40px;border-top:1px solid #E5E7EB;font-size:12px;color:#9CA3AF}
  p{margin:0 0 16px}
</style></head>
<body>
  <div class="wrap">
    <div class="body">
      <p>Hi ${firstName},</p>
      <p><strong>${requesterName}</strong> has requested your approval to share a candidate with the client.</p>
      <div class="info-block">
        <div class="row"><span class="lbl">Candidate</span><span class="val">${candidateName}</span></div>
        <div class="row"><span class="lbl">Role</span><span class="val">${jobTitle}</span></div>
        <div class="row"><span class="lbl">Client</span><span class="val">${clientName}</span></div>
      </div>
      <a href="${dashboardUrl}" class="btn">Review Candidate &rarr;</a>
      <p style="font-size:13px;color:#9CA3AF">You can approve or decline from the candidate detail page.</p>
      <p style="margin-top:24px;color:#6B7280">&mdash; ${PRODUCT_NAME}</p>
    </div>
    <div class="footer">${PRODUCT_NAME} &middot; ${COMPANY_URL}</div>
  </div>
</body>
</html>`

  const text = [
    `Hi ${firstName},`,
    '',
    `${requesterName} has requested your approval to share ${candidateName} with ${clientName} for the ${jobTitle} role.`,
    '',
    `Review candidate: ${dashboardUrl}`,
    '',
    `— ${PRODUCT_NAME}`,
  ].join('\n')

  await client().send({
    to: partnerEmail,
    from: FROM,
    subject: `Approval requested: ${candidateName} for ${jobTitle}`,
    html,
    text,
  })
}
