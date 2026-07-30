import { Grid, ContactShadows } from "@react-three/drei";

/**
 * The instrument stage: a soft grounding shadow and a faint technical grid
 * that establishes scale without competing with the subject.
 */
export function Stage() {
  return (
    <group>
      <ContactShadows
        position={[0, -1.0001, 0]}
        scale={12}
        far={4}
        blur={2.6}
        opacity={0.32}
        resolution={1024}
        color="#233047"
      />

      <Grid
        position={[0, -1, 0]}
        args={[24, 24]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#d3d9e4"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#b9c2d2"
        fadeDistance={16}
        fadeStrength={1.4}
        followCamera={false}
        infiniteGrid
      />
    </group>
  );
}
