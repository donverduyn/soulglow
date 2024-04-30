// react.d.ts
import 'react'; // Import React types, ensures that TypeScript treats this file as a module.

declare module 'react' {
  interface CSSProperties {
    '--length'?: number; // Custom CSS property as an example
  }
}

declare global {
  interface DefaultProps {
    className?: string;
  }
}
