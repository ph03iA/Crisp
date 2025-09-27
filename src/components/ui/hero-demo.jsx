import { HeroSectionWithShader } from "./hero-section-with-smooth-bg-shader";

export default function HeroDemo() {
  return (
    <HeroSectionWithShader 
      distortion={1.2}
      speed={0.8}
      colors={["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"]}
    />
  );
}

// Alternative usage examples:
export function HeroCustomContent() {
  return (
    <HeroSectionWithShader 
      title="Revolutionary AI Solutions for"
      highlightText="Modern Business"
      description="Streamline operations with cutting-edge AI technology"
      buttonText="Get Started"
      onButtonClick={() => console.log('Button clicked!')}
      colors={["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"]}
      distortion={1.2}
      speed={0.8}
    />
  );
}

export function HeroWithCustomAnimation() {
  return (
    <HeroSectionWithShader 
      colors={["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"]}
      distortion={1.5}
      speed={1.0}
      swirl={1.2}
      offsetX={0.15}
    />
  );
}
