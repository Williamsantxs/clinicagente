import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="logo">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#0f766e" />
        <path d="M13.500 8h5v5.500H24v5h-5.500V24h-5v-5.500H8v-5h5.500z" fill="#fff" />
      </svg>
      <span>Clinic<b>Agente</b></span>
    </Link>
  )
}
