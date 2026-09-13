export type NesButton =
  | "A"
  | "B"
  | "SELECT"
  | "START"
  | "UP"
  | "DOWN"
  | "LEFT"
  | "RIGHT"
  | "TURBO_A"
  | "TURBO_B";

export type AppMode = "tv" | "controller" | "split-test";

export type MenuLayoutOption =
  | "arcade-frontend"
  | "cartridge-shelf"
  | "channel-surfer"
  | "power-grid"
  | "living-room";

export interface RomItem {
  id: string;
  title: string;
  rawName?: string;
  genre?: string;
  year?: string | number;
  players?: number;
  description?: string;
  boxArtUrl?: string;
  boxArtThumbnail?: string;
  boxArtFileName?: string;
  videoId?: string;
  videoUrl?: string;
  videoDirectUrl?: string;
  videoThumbnail?: string;
  videoFileName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  source?: "drive" | "google-drive" | "builtin" | "custom" | "upload" | string;
  downloadUrl?: string;
  fileSize?: number | string;
  tags?: string[];
  system?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  rating?: string | number;
  isFavorite?: boolean;
}

export interface PlayerStatus {
  connected: boolean;
  lastActive: number;
  activeButtons: Set<NesButton>;
  name?: string;
}

export interface CrtShaderConfig {
  scanlines: boolean;
  scanlineIntensity: number;
  curvature: boolean;
  bloom: boolean;
  staticNoise: boolean;
  noiseIntensity: number;
  vignette: boolean;
  colorBleed: boolean;
  bezelStyle: "dark-monitor" | "silver-trinitron" | "arcade-cab" | "frameless";
}

export interface ControllerInputMessage {
  type: "controller-input";
  slot: 1 | 2;
  button: NesButton;
  state: boolean;
  timestamp?: number;
}
