export interface FingerPageProps {
  frame: number;
  duration: number;
  background?: string;
  finger?: string;
  objects?: string[];
  text?: string;
}

export interface ObjectPageProps {
  frame: number;
  duration: number;
  background?: string;
  objects: string[];
  text?: string;
}

export interface FingerWithObjectPageProps {
  frame: number;
  duration: number;
  background?: string;
  finger?: string;
  objects: string[];
  text?: string;
}