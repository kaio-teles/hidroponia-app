import { FormEvent, useState } from 'react';
import { calcularNutricao } from './nutricao';

interface ResultadosExibicao {
  kristalon: string;
  nitratoCalcio: string;
  ferro: string;
}

const RESULTADOS_INICIAIS: ResultadosExibicao = {
  kristalon: '0,0',
  nitratoCalcio: '0,0',
  ferro: '0,0',
};

function formatarFerro(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function App() {
  const [ceAtual, setCeAtual] = useState('');
  const [ceEsperada, setCeEsperada] = useState('');
  const [volume, setVolume] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [resultados, setResultados] = useState<ResultadosExibicao>(RESULTADOS_INICIAIS);

  function handleCalcular(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const calculo = calcularNutricao({ ceAtual, ceEsperada, volume });

    if (calculo.erro !== null) {
      setErro(calculo.erro);
      return;
    }

    setErro(null);
    setResultados({
      kristalon: calculo.kristalon.toLocaleString('pt-BR'),
      nitratoCalcio: calculo.nitratoCalcio.toLocaleString('pt-BR'),
      ferro: formatarFerro(calculo.ferro),
    });
  }

  function handleZerar() {
    setCeAtual('');
    setCeEsperada('');
    setVolume('');
    setErro(null);
    setResultados(RESULTADOS_INICIAIS);
  }

  return (
    <div className="pagina">
      <main className="painel">
        <header className="cabecalho">
          <h1>Hidroponia</h1>
          <p>Calibração da solução nutritiva para folhosas</p>
        </header>

        <form className="formulario" onSubmit={handleCalcular} noValidate>
          <div className="campo">
            <label htmlFor="ce-atual">Informe a CE atual (dS m⁻¹)</label>
            <input
              id="ce-atual"
              type="text"
              inputMode="decimal"
              placeholder="Ex.: 0,550"
              value={ceAtual}
              onChange={(e) => setCeAtual(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="ce-esperada">Informe a CE esperada (dS m⁻¹)</label>
            <input
              id="ce-esperada"
              type="text"
              inputMode="decimal"
              placeholder="Ex.: 1,1"
              value={ceEsperada}
              onChange={(e) => setCeEsperada(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="volume">Informe o volume de solução a ser preparada (L)</label>
            <input
              id="volume"
              type="text"
              inputMode="decimal"
              placeholder="O valor deve ser em litros."
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
          </div>

          {erro !== null && (
            <p className="aviso" role="alert">
              {erro}
            </p>
          )}

          <div className="acoes">
            <button type="submit" className="botao botao-primario">
              Calcular
            </button>
            <button type="button" className="botao botao-secundario" onClick={handleZerar}>
              Zerar
            </button>
          </div>
        </form>

        <section className="resultados" aria-live="polite" aria-label="Resultados da calibração">
          <article className="cartao-resultado">
            <span className="cartao-rotulo">Quantidade de Kristalon ou DripAlface (g)</span>
            <strong className="cartao-valor">{resultados.kristalon}</strong>
          </article>

          <article className="cartao-resultado">
            <span className="cartao-rotulo">Quantidade de Nitrato de Cálcio (g)</span>
            <strong className="cartao-valor">{resultados.nitratoCalcio}</strong>
          </article>

          <article className="cartao-resultado">
            <span className="cartao-rotulo">Ferro (g) — OBS: apenas a cada 10 dias</span>
            <strong className="cartao-valor">{resultados.ferro}</strong>
          </article>
        </section>

        <footer className="rodape">
          Cálculo baseado na mistura 54% Kristalon e 46% Nitrato de Cálcio (1,2448 dS m⁻¹ por g/L)
          com dosagem fixa de 0,02 g/L de Ferro.
        </footer>
      </main>
    </div>
  );
}

