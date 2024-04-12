import { _decorator, AudioSource, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AudioController")
export class AudioController extends Component {
  @property(AudioSource)
  public popSfx: AudioSource = null!;

  @property(AudioSource)
  public bgMusic: AudioSource = null!;

  @property(AudioSource)
  public uhohSfx: AudioSource = null!;

  @property(AudioSource)
  public yeahSfx: AudioSource = null!;

  @property(AudioSource)
  public beepSfx: AudioSource = null!;

  @property(AudioSource)
  public busRunSfx: AudioSource = null!;

  @property(AudioSource)
  public alarmSfx: AudioSource = null!;

  @property(AudioSource)
  public loseSfx: AudioSource = null!;

  @property(AudioSource)
  public winSfx: AudioSource = null!;

  @property(AudioSource)
  public winPhaseSfx: AudioSource = null!;

  start() {}

  update(deltaTime: number) {}

  playPopSfx() {
    this.popSfx.playOneShot(this.popSfx.clip, this.popSfx.volume);
  }

  playWinPhaseSfx() {
    this.winPhaseSfx.playOneShot(
      this.winPhaseSfx.clip,
      this.winPhaseSfx.volume
    );
  }

  playWinSfx() {
    this.winSfx.playOneShot(this.winSfx.clip, this.winSfx.volume);
  }

  playLoseSfx() {
    this.loseSfx.playOneShot(this.loseSfx.clip, this.loseSfx.volume);
  }

  playUhohSfx() {
    this.uhohSfx.playOneShot(this.uhohSfx.clip, this.uhohSfx.volume);
  }

  playYeahSfx() {
    this.yeahSfx.playOneShot(this.yeahSfx.clip, this.yeahSfx.volume);
  }

  playBeepSfx() {
    this.beepSfx.playOneShot(this.beepSfx.clip, this.beepSfx.volume);
  }

  playBusRunSfx() {
    this.busRunSfx.playOneShot(this.busRunSfx.clip, this.busRunSfx.volume);
  }

  playAlarmSfx() {
    this.alarmSfx.playOneShot(this.alarmSfx.clip, this.alarmSfx.volume);
  }
}
