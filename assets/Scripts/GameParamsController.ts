import { _decorator, CCString, Component, Node } from "cc";
const { ccclass, property } = _decorator;

interface GameVariables {
  camera: {
    zoom: number;
  };
  playTutAgainTime: number
  praiseTexts: string[];
  currentLevel: number;
  levels: {time: number, slots: number, width: number, height: number, stickmans: number[][], buses: number[]}[];
}

@ccclass("GameParamsController")
export class GameParamsController extends Component {
  @property(CCString)
  public gameParams: string = "";

  public gameVars: GameVariables = undefined;

  onLoad(): void {
    this.gameVars = JSON.parse(this.gameParams);
    this.gameVars.currentLevel = 0;
  }
}
