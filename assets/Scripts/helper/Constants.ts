import { Vec3 } from "cc";

export const NODE_NAME = {
  BUS: "Bus",
  STICKMAN: "Stickman",
};

export enum PLAYER_COLOR {
  BLUE,
  ORANGE,
  VIOLET,
  GREEN,
  YELLOW,
}

export const BUS_SEAT = [
  new Vec3(0.024, 0.04, 0),
  new Vec3(0, 0.04, 0),
  new Vec3(-0.025, 0.04, 0),
];

export const CHEER_TIME = 3;

// export enum PLAY_AUDIO_NAME  {
//   TAP_SFX,
// }
