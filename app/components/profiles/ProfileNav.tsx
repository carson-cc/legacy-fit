import Link from 'next/link'
import { PRODUCT_NAME } from '@/lib/brand'

interface NavButton {
  name: string
  href: string
}

interface Props {
  backLink?: boolean
  prev?: NavButton | null
  next?: NavButton | null
}

export default function ProfileNav({ backLink, prev, next }: Props) {
  return (
    <nav
      className="sticky top-0 z-10 flex items-center justify-between"
      style={{
        height: 52,
        padding: '0 var(--p-sp)',
        background: 'rgba(5,5,5,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--p-b0)',
      }}
    >
      <Link
        href="/"
        style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--p-t0)', textDecoration: 'none' }}
      >
        {PRODUCT_NAME}
      </Link>

      <div className="flex items-center" style={{ gap: 20 }}>
        {backLink && (
          <Link
            href="/profiles"
            style={{ fontSize: 12, color: 'var(--p-t2)', textDecoration: 'none', transition: 'color 0.1s' }}
            className="hover:!text-[rgba(255,255,255,0.55)]"
          >
            &larr; All Profiles
          </Link>
        )}

        {prev && (
          <Link
            href={prev.href}
            style={{
              fontSize: 11,
              color: 'var(--p-t3)',
              padding: '6px 10px',
              border: '1px solid var(--p-b0)',
              borderRadius: 6,
              textDecoration: 'none',
              transition: 'border-color 0.1s, color 0.1s',
            }}
            className="hover:!border-[rgba(255,255,255,0.07)] hover:!text-[rgba(255,255,255,0.28)]"
          >
            &larr; {prev.name}
          </Link>
        )}

        {next && (
          <Link
            href={next.href}
            style={{
              fontSize: 11,
              color: 'var(--p-t3)',
              padding: '6px 10px',
              border: '1px solid var(--p-b0)',
              borderRadius: 6,
              textDecoration: 'none',
              transition: 'border-color 0.1s, color 0.1s',
            }}
            className="hover:!border-[rgba(255,255,255,0.07)] hover:!text-[rgba(255,255,255,0.28)]"
          >
            {next.name} &rarr;
          </Link>
        )}
      </div>
    </nav>
  )
}
