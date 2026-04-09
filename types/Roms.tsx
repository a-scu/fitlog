import { ROMS } from "@/constants/Roms";

export type Roms = (typeof ROMS)[keyof typeof ROMS];
