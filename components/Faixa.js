// Pecas visuais usadas nos tres paineis: a faixa do topo e os icones.
// Tudo desenhado em SVG no proprio codigo, sem arquivos de imagem.

// Desenhos dos icones (linhas simples, 24x24)
const DESENHOS = {
  calendario: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  certo: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 9.7" /></>,
  cancelado: <><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  pessoas: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 19c.6-3.3 3.2-5 6.5-5s5.9 1.7 6.5 5" /><circle cx="17.5" cy="9" r="2.5" /><path d="M17.5 14c2.3 0 3.8 1.3 4.3 4" /></>,
  dente: <path d="M12 6.500C10.5 5.2 8.7 4.9 7.3 5.6 5.7 6.4 5.1 8.1 5.4 9.900c.3 1.9 1 3.3 1.3 5.2.3 1.6.5 4.4 1.9 4.4 1.3 0 1.3-2.2 1.7-3.7.3-1 .8-1.6 1.7-1.600s1.4.6 1.7 1.600c.4 1.5.4 3.7 1.7 3.7 1.4 0 1.6-2.8 1.9-4.4.3-1.9 1-3.3 1.3-5.2.3-1.8-.3-3.5-1.9-4.3-1.4-.7-3.2-.4-4.7.9z" />,
  dinheiro: <><rect x="3" y="6" width="18" height="12" rx="2.5" /><circle cx="12" cy="12" r="3" /></>,
}

export function Icone({ nome }) {
  return (
    <svg className="icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {DESENHOS[nome]}
    </svg>
  )
}

// Meia arcada de dentes, usada como enfeite na faixa do topo
function Arcada() {
  const dentes = [...Array(16).keys()]
  return (
    <svg className="faixa-arcada" viewBox="0 0 340 190" aria-hidden="true">
      {dentes.map((i) => {
        const angulo = Math.PI - (Math.PI * (i + 0.5)) / 16
        const x = 170 + 140 * Math.cos(angulo)
        const y = 178 - 150 * Math.sin(angulo)
        const giro = (Math.atan2(-150 * Math.sin(angulo), 140 * Math.cos(angulo)) * 180) / Math.PI + 90
        const meio = i < 8 ? i : 15 - i
        const largura = meio <= 2 ? 26 : meio <= 4 ? 21 : 18
        return (
          <rect
            key={i}
            x={-largura / 2}
            y={-15}
            width={largura}
            height={30}
            rx={largura / 2.4}
            transform={`translate(${x} ${y}) rotate(${giro})`}
          />
        )
      })}
    </svg>
  )
}

// Faixa verde do topo de cada painel: rotulo, titulo e uma frase de apoio
export default function Faixa({ rotulo, titulo, texto }) {
  return (
    <section className="faixa">
      <div className="faixa-conteudo">
        <div>
          <p className="faixa-rotulo">{rotulo}</p>
          <h1>{titulo}</h1>
          {texto && <p className="faixa-texto">{texto}</p>}
        </div>
        <Arcada />
      </div>
    </section>
  )
}

// Iniciais de um nome, ignorando "Dr." e "Dra." (ex.: "Dra. Ana Ribeiro" vira "AR")
export function iniciais(nome) {
  const partes = nome.split(' ').filter((parte) => !/^dra?\.$/i.test(parte))
  const primeira = partes[0] ? partes[0][0] : ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}
