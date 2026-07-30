/**
 * Immutable complex-number arithmetic.
 *
 * Complex values are plain `{ re, im }` records rather than a class so the
 * engine can allocate them cheaply and keep hot loops monomorphic. Every
 * operation returns a fresh value; none mutate their arguments.
 */
export interface Complex {
  readonly re: number;
  readonly im: number;
}

export function complex(re: number, im = 0): Complex {
  return { re, im };
}

export const ZERO: Complex = { re: 0, im: 0 };
export const ONE: Complex = { re: 1, im: 0 };
export const I: Complex = { re: 0, im: 1 };

export function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function mul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function scale(a: Complex, s: number): Complex {
  return { re: a.re * s, im: a.im * s };
}

export function conj(a: Complex): Complex {
  return { re: a.re, im: -a.im };
}

/** Squared magnitude |z|² — cheaper than `abs` and used for probabilities. */
export function abs2(a: Complex): number {
  return a.re * a.re + a.im * a.im;
}

export function abs(a: Complex): number {
  return Math.hypot(a.re, a.im);
}

/** Principal argument in (-π, π]. */
export function arg(a: Complex): number {
  return Math.atan2(a.im, a.re);
}

/** e^{iθ}, the unit complex number at angle θ. */
export function expi(theta: number): Complex {
  return { re: Math.cos(theta), im: Math.sin(theta) };
}

export function fromPolar(r: number, theta: number): Complex {
  return { re: r * Math.cos(theta), im: r * Math.sin(theta) };
}

export function equals(a: Complex, b: Complex, epsilon = 1e-9): boolean {
  return Math.abs(a.re - b.re) < epsilon && Math.abs(a.im - b.im) < epsilon;
}

export function isZero(a: Complex, epsilon = 1e-12): boolean {
  return Math.abs(a.re) < epsilon && Math.abs(a.im) < epsilon;
}

/**
 * Formats a complex number for scientific display, e.g. `0.71`, `-0.71i`,
 * `0.5 + 0.5i`. Small components are dropped to avoid `+0.00i` noise.
 */
export function formatComplex(a: Complex, precision = 2): string {
  const eps = 0.5 * 10 ** -precision;
  const re = Math.abs(a.re) < eps ? 0 : a.re;
  const im = Math.abs(a.im) < eps ? 0 : a.im;

  if (re === 0 && im === 0) return "0";
  if (im === 0) return re.toFixed(precision);
  if (re === 0) return `${im === 1 ? "" : im === -1 ? "-" : im.toFixed(precision)}i`;

  const sign = im < 0 ? "−" : "+";
  const imMag = Math.abs(im);
  const imStr = imMag === 1 ? "" : imMag.toFixed(precision);
  return `${re.toFixed(precision)} ${sign} ${imStr}i`;
}
