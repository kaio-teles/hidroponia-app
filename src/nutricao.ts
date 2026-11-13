// Condutividade elétrica específica de cada insumo, em dS m⁻¹ por g/L
export const EC_POR_GRAMAS_LITRO_KRISTALON = 1.3;
export const EC_POR_GRAMAS_LITRO_NITRATO_CALCIO = 1.18;

// Frações mássicas de cada insumo na mistura de correção
export const FRACAO_KRISTALON = 0.54;
export const FRACAO_NITRATO_CALCIO = 0.46;

// Coeficiente acumulado: quanto a mistura inteira sobe a CE, por g/L.
// Derivação: a mistura de correção é 54 % Kristalon e 46 % Nitrato de Cálcio;
// cada grama por litro dessa mistura eleva a CE em 1,2448 dS m⁻¹. Logo a massa
// total de mistura necessária para subir ΔCE em V litros é ΔCE / 1.2448 × V,
// e as frações 0,54 e 0,46 repartem essa massa entre os dois sais.
export const EC_POR_GRAMAS_LITRO_MISTURA =
  FRACAO_KRISTALON * EC_POR_GRAMAS_LITRO_KRISTALON +
  FRACAO_NITRATO_CALCIO * EC_POR_GRAMAS_LITRO_NITRATO_CALCIO;

// Ferro: dosagem fixa, independente da CE
export const FERRO_GRAMAS_POR_LITRO = 20 / 1000; // 0.02 g/L

export interface EntradaNutricao {
  ceAtual: string | number;
  ceEsperada: string | number;
  volume: string | number;
}

export interface ResultadoNutricao {
  kristalon: number;
  nitratoCalcio: number;
  ferro: number;
  erro: string | null;
}

function normalizarNumero(valor: string | number): number | null {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null;
  }

  const limpo = valor.trim();
  if (limpo === '') {
    return null;
  }

  const convertido = Number(limpo.replace(',', '.'));
  return Number.isFinite(convertido) ? convertido : Number.NaN;
}

function resultadoErro(mensagem: string): ResultadoNutricao {
  return {
    kristalon: 0,
    nitratoCalcio: 0,
    ferro: 0,
    erro: mensagem,
  };
}

export function calcularNutricao(entrada: EntradaNutricao): ResultadoNutricao {
  const ceAtual = normalizarNumero(entrada.ceAtual);
  const ceEsperada = normalizarNumero(entrada.ceEsperada);
  const volume = normalizarNumero(entrada.volume);

  if (ceAtual === null || ceEsperada === null || volume === null) {
    return resultadoErro('Preencha todos os campos!');
  }

  if (Number.isNaN(ceAtual) || Number.isNaN(ceEsperada) || Number.isNaN(volume)) {
    return resultadoErro('Informe valores numéricos válidos.');
  }

  if (ceAtual < 0 || ceEsperada < 0) {
    return resultadoErro('Os valores de CE não podem ser negativos.');
  }

  if (volume <= 0) {
    return resultadoErro('O volume deve ser maior que zero.');
  }

  const deltaCe = ceEsperada - ceAtual;
  if (deltaCe <= 0) {
    return resultadoErro('A CE esperada deve ser maior que a CE atual.');
  }

  const gramasPorLitro = deltaCe / EC_POR_GRAMAS_LITRO_MISTURA;

  return {
    kristalon: Math.round(gramasPorLitro * volume * FRACAO_KRISTALON),
    nitratoCalcio: Math.round(gramasPorLitro * volume * FRACAO_NITRATO_CALCIO),
    ferro: volume * FERRO_GRAMAS_POR_LITRO,
    erro: null,
  };
}

