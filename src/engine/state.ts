import {
  type Complex,
  abs2,
  conj,
  mul,
  complex,
} from "./complex";
import {
  type ComplexVector,
  basisVector,
  normalizeVector,
  normSquared,
} from "./linalg";
import { tensorVector } from "./tensor";

/** A point on the Bloch sphere in the physics convention (|0⟩ at +z). */
export interface BlochVector {
  x: number;
  y: number;
  z: number;
}

/**
 * A pure quantum state expressed as a vector of computational-basis
 * amplitudes. Qubit 0 is the most-significant bit: for an n-qubit state the
 * amplitude at index `i` corresponds to the bitstring whose qubit-`q` value is
 * `(i >> (n - 1 - q)) & 1`.
 *
 * Instances are immutable; every transformation returns a new state.
 */
export class QuantumState {
  readonly amplitudes: ComplexVector;
  readonly numQubits: number;

  constructor(amplitudes: ComplexVector) {
    const dim = amplitudes.length;
    const n = Math.log2(dim);
    if (!Number.isInteger(n)) {
      throw new Error(
        `QuantumState dimension ${dim} is not a power of two.`
      );
    }
    this.amplitudes = amplitudes;
    this.numQubits = n;
  }

  get dimension(): number {
    return this.amplitudes.length;
  }

  /** The all-zeros basis state |0…0⟩ for `n` qubits. */
  static zero(n: number): QuantumState {
    return new QuantumState(basisVector(1 << n, 0));
  }

  /** A computational basis state |index⟩ for `n` qubits. */
  static basis(n: number, index: number): QuantumState {
    return new QuantumState(basisVector(1 << n, index));
  }

  /** A single-qubit state from raw amplitudes α|0⟩ + β|1⟩ (normalized). */
  static qubit(alpha: Complex, beta: Complex): QuantumState {
    return new QuantumState(normalizeVector([alpha, beta]));
  }

  /**
   * A single-qubit state from Bloch angles: polar θ from +z and azimuth φ.
   * |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩.
   */
  static fromBlochAngles(theta: number, phi: number): QuantumState {
    const half = theta / 2;
    return new QuantumState([
      complex(Math.cos(half), 0),
      complex(Math.cos(phi) * Math.sin(half), Math.sin(phi) * Math.sin(half)),
    ]);
  }

  /** The tensor product |this⟩ ⊗ |other⟩. */
  tensor(other: QuantumState): QuantumState {
    return new QuantumState(tensorVector(this.amplitudes, other.amplitudes));
  }

  /** Returns a unit-norm copy, correcting any accumulated numerical drift. */
  normalized(): QuantumState {
    return new QuantumState(normalizeVector(this.amplitudes));
  }

  clone(): QuantumState {
    return new QuantumState(this.amplitudes.slice());
  }

  /** Measurement probabilities over the full computational basis. */
  probabilities(): number[] {
    return this.amplitudes.map(abs2);
  }

  /** Probability of observing basis state |index⟩. */
  probabilityOf(index: number): number {
    return abs2(this.amplitudes[index]);
  }

  /** Probability that qubit `q` reads 1 when measured in the Z basis. */
  probabilityOfQubitOne(q: number): number {
    const bit = this.numQubits - 1 - q;
    let p = 0;
    for (let i = 0; i < this.amplitudes.length; i++) {
      if ((i >> bit) & 1) p += abs2(this.amplitudes[i]);
    }
    return p;
  }

  /** ‖amplitudes‖² — should stay at 1 for a valid pure state. */
  totalProbability(): number {
    return normSquared(this.amplitudes);
  }

  /**
   * The Bloch vector for a single-qubit state. Throws for multi-qubit states,
   * whose reduced descriptions are not points on a single Bloch sphere.
   */
  blochVector(): BlochVector {
    if (this.numQubits !== 1) {
      throw new Error("blochVector() is only defined for a single qubit.");
    }
    const [a, b] = this.amplitudes;
    const cross = mul(conj(a), b);
    return {
      x: 2 * cross.re,
      y: 2 * cross.im,
      z: abs2(a) - abs2(b),
    };
  }
}
