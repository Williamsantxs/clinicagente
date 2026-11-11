import './globals.css'

export const metadata = {
  title: 'ClinicAgente | Clínica Odontológica',
  description: 'Sistema de agendamento da clínica odontológica ClinicAgente.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
