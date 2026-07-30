import { mul } from "./complex";
import type { ComplexMatrix, ComplexVector } from "./linalg";

/**
 * Kronecker (tensor) product of two vectors. For qubit registers the result
 * orders `a` as the more-significant factor: |a⟩ ⊗ |b⟩.
 */
export function tensorVector(
  a: ComplexVector,
  b: ComplexVector
): ComplexVector {
  const out: ComplexVector = new Array(a.length * b.length);
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[k++] = mul(a[i], b[j]);
    }
  }
  return out;
}

/** Kronecker product of two matrices, A ⊗ B. */
export function tensorMatrix(
  a: ComplexMatrix,
  b: ComplexMatrix
): ComplexMatrix {
  const ar = a.length;
  const ac = a[0].length;
  const br = b.length;
  const bc = b[0].length;
  const rows = ar * br;
  const cols = ac * bc;

  const out: ComplexMatrix = Array.from({ length: rows }, () =>
    new Array(cols)
  );

  for (let i = 0; i < ar; i++) {
    for (let j = 0; j < ac; j++) {
      const aij = a[i][j];
      for (let p = 0; p < br; p++) {
        for (let q = 0; q < bc; q++) {
          out[i * br + p][j * bc + q] = mul(aij, b[p][q]);
        }
      }
    }
  }
  return out;
}

/** Folds a list of factors with the tensor product, most-significant first. */
export function tensorAllVectors(factors: ComplexVector[]): ComplexVector {
  return factors.reduce((acc, next) => tensorVector(acc, next));
}

export function tensorAllMatrices(factors: ComplexMatrix[]): ComplexMatrix {
  return factors.reduce((acc, next) => tensorMatrix(acc, next));
}
