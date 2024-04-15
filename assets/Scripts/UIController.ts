import {
  _decorator,
  Component,
  Label,
  Node,
  tween,
  Vec2,
  Vec3,
  Animation,
  UITransform,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("UIController")
export class UIController extends Component {
  @property(Node)
  public endCardWrapper: Node = null!;

  @property(Node)
  public winEndCard: Node = null!;

  @property(Node)
  public loseEndCard: Node = null!;

  @property(Node)
  public praseText: Node = null!;

  @property(Node)
  public levelCompletedCard: Node = null!;

  @property(Node)
  public challengeText: Node = null!;

  @property(Node)
  public callToPlayText: Node = null!;

  @property(Node)
  public banner: Node = null!;

  private _isHideTutorial = false;

  start() {
    this.endCardWrapper.scale = new Vec3(0, 0, 0);
    this.levelCompletedCard.scale = new Vec3(0, 0, 0);
    this.loseEndCard.active = false;
    this.winEndCard.active = false;
    // this.levelCompletedCard.active = false;

    this.callToPlayText.active = false;
    this.challengeText.active = false;
  }

  update(deltaTime: number) {}

  // updateCounter(time: number) {
  //   const timeInString = `00:${time < 10 ? `0${time}` : time}`;

  //   this.timeCounterLabel.getComponent(Label).string = timeInString;
  // }

  popPraiseText() {
    const praiseTexts = ["Great!", "Cool!", "Amazing!", "Nice!", "Perfect!"];
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

  // playWarning() {
  //   const anim = this.warn.getComponent(Animation);
  //   anim.play("warn");
  // }

  // hideTutorial() {
  //   if (this._isHideTutorial) return;
  //   // this.callToPlayText.active = false;
  //   this._isHideTutorial = true;
  // }

  showEndCard(isWin: boolean) {
    if (isWin) {
      this.winEndCard.active = true;
    } else {
      this.loseEndCard.active = true;
    }

    tween(this.endCardWrapper)
      .delay(0.5)
      .to(0.8, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .union()
      .start();
  }

  showLevelCompletedCard() {
    tween(this.levelCompletedCard)
      .delay(0.5)
      .to(0.8, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .union()
      .start();
  }

  hideLevelCompletedCard() {
    this.levelCompletedCard.active = false;
  }

  showChallengeText() {
    this.challengeText.active = true;
  }

  hideChallengeText() {
    this.challengeText.active = false;
    this.callToPlayText.active = false;
  }

  showCallToPlay() {
    this.callToPlayText.active = true;
  }

  hideCallToPlay() {
    this.callToPlayText.active = false;
  }

  hideBanner() {
    this.banner.active = false;
  }

  resizeBanner() {
    const bannerBtn = this.banner.getChildByName("banner-btn");
    const gameName = this.banner.getChildByName("game-name");
  }

  showBanner() {
    this.banner.active = true;
  }
}
