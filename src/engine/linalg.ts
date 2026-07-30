import {
  type Complex,
  add,
  mul,
  scale,
  conj,
  abs2,
  complex,
  ZERO,
} from "./complex";

/** A dense complex column vector. */
export type ComplexVector = Complex[];

/** A dense complex matrix in row-major order (`m[row][col]`). */
export type ComplexMatrix = Complex[][];

export function zeroVector(dim: number): ComplexVector {
  return Array.from({ length: dim }, () => ZERO);
}

export function basisVector(dim: number, index: number): ComplexVector {
  const v = zeroVector(dim);
  v[index] = complex(1, 0);
  return v;
}

export function cloneVector(v: ComplexVector): ComplexVector {
  return v.slice();
}

export function addVectors(a: ComplexVector, b: ComplexVector): ComplexVector {
  return a.map((x, i) => add(x, b[i]));
}

export function scaleVector(v: ComplexVector, s: number): ComplexVector {
  return v.map((x) => scale(x, s));
}

/** ⟨a|b⟩ — the Hermitian inner product, conjugate-linear in the first argument. */
export function innerProduct(a: ComplexVector, b: ComplexVector): Complex {
  let acc = ZERO;
  for (let i = 0; i < a.length; i++) {
    acc = add(acc, mul(conj(a[i]), b[i]));
  }
  return acc;
}

/** The squared Euclidean norm, ‖v‖². */
export function normSquared(v: ComplexVector): number {
  let acc = 0;
  for (let i = 0; i < v.length; i++) acc += abs2(v[i]);
  return acc;
}

export function norm(v: ComplexVector): number {
  return Math.sqrt(normSquared(v));
}

/** Returns a unit-norm copy of `v`. A near-zero vector is returned unchanged. */
export function normalizeVector(v: ComplexVector): ComplexVector {
  const n = norm(v);
  if (n < 1e-12) return cloneVector(v);
  return scaleVector(v, 1 / n);
}

export function identityMatrix(dim: number): ComplexMatrix {
  return Array.from({ length: dim }, (_, r) =>
    Array.from({ length: dim }, (_, c) => (r === c ? complex(1, 0) : ZERO))
  );
}

/** Matrix product A·B. */
export function multiplyMatrix(
  a: ComplexMatrix,
  b: ComplexMatrix
): ComplexMatrix {
  const rows = a.length;
  const inner = b.length;
  const cols = b[0].length;
  const out: ComplexMatrix = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ZERO)
  );
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < inner; k++) {
      const ark = a[r][k];
      if (ark.re === 0 && ark.im === 0) continue;
      for (let c = 0; c < cols; c++) {
        out[r][c] = add(out[r][c], mul(ark, b[k][c]));
      }
    }
  }
  return out;
}

/** Matrix–vector product A·v. */
export function multiplyMatrixVector(
  a: ComplexMatrix,
  v: ComplexVector
): ComplexVector {
  const rows = a.length;
  const cols = v.length;
  const out = zeroVector(rows);
  for (let r = 0; r < rows; r++) {
    let acc = ZERO;
    for (let c = 0; c < cols; c++) {
      acc = add(acc, mul(a[r][c], v[c]));
    }
    out[r] = acc;
  }
  return out;
}

/** The conjugate transpose A†. */
export function dagger(a: ComplexMatrix): ComplexMatrix {
  const rows = a.length;
  const cols = a[0].length;
  return Array.from({ length: cols }, (_, r) =>
    Array.from({ length: rows }, (_, c) => conj(a[c][r]))
  );
}
