import {
  _decorator,
  Component,
  Label,
  Node,
  tween,
  Vec2,
  Vec3,
  Animation,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("UIController")
export class UIController extends Component {
  @property(Node)
  public timeCounterLabel: Node = null!;

  @property(Node)
  public endCardWrapper: Node = null!;

  @property(Node)
  public winEndCard: Node = null!;

  @property(Node)
  public loseEndCard: Node = null!;

  @property(Node)
  public warn: Node = null!;

  @property(Node)
  public tutorial: Node = null!;

  @property(Node)
  public praseText: Node = null!;

  private _isHideTutorial = false;

  start() {
    this.endCardWrapper.scale = new Vec3(0, 0, 0);
    this.loseEndCard.active = false;
    this.winEndCard.active = false;
  }

  update(deltaTime: number) {}

  updateCounter(time: number) {
    const timeInString = `00:${time < 10 ? `0${time}` : time}`;

    this.timeCounterLabel.getComponent(Label).string = timeInString;
  }

  popPraiseText() {
    const praiseTexts = ["Grate!", "Cool!", "Amazing!", "Nice!", "Perfect!"];
    const randomIndex = Math.floor(Math.random() * praiseTexts.length);
    const text = praiseTexts[randomIndex];

    this.praseText.getComponent(Label).string = text;
    tween(this.praseText)
      .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .delay(0.2)
      .to(0.2, { scale: new Vec3(0, 0, 0) })
      .union()
      .start();
  }

  playWarning() {
    const anim = this.warn.getComponent(Animation);
    anim.play("warn");
  }

  hideTutorial() {
    if (this._isHideTutorial) return;
    this.tutorial.active = false;
    this._isHideTutorial = true;
  }

  showEndCard(isWin: boolean) {
    if (isWin) {
      this.winEndCard.active = true;
    } else {
      this.loseEndCard.active = true;
    }

    tween(this.endCardWrapper)
      .to(0.8, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .start();
  }
}
