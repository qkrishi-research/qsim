/**
 * The quantum engine — a self-contained, framework-agnostic simulation core.
 *
 * It has no knowledge of React, the DOM, or any renderer. Everything is pure
 * data and pure functions over immutable values, so it can be unit-tested and
 * reused independently of the application shell.
 */
export * from "./complex";
export * from "./linalg";
export * from "./tensor";
export * from "./state";
export * from "./gates";
export * from "./evolution";
export * from "./measurement";
export * from "./entanglement";
