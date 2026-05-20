export function inferRoleType(title: string): string {
  if (/superintendent/i.test(title)) return 'superintendent'
  if (/project.?manager|\bpm\b/i.test(title)) return 'project_manager'
  if (/\bcfo\b|chief.?financial/i.test(title)) return 'cfo'
  if (/foreman/i.test(title)) return 'foreman'
  if (/estimat/i.test(title)) return 'estimator'
  if (/\bsales\b|account.?exec|business.?dev/i.test(title)) return 'sales_rep'
  return title.trim()
}
