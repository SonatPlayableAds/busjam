import { _decorator, AudioSource, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AudioController")
export class AudioController extends Component {
  @property(AudioSource)
  public tapSfx: AudioSource = null!;

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

  start() {}

  update(deltaTime: number) {}

  playTapSfx() {
    this.tapSfx.playOneShot(this.tapSfx.clip, this.tapSfx.volume);
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
