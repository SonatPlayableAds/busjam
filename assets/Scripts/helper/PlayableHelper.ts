class H5Playable {
  redirect() {
    //@ts-ignore
    window.super_html && super_html.download();

    //@ts-ignore
    if (typeof redirectStore !== "undefined") redirectStore();
  }

  /**
   * Game start method for Mintegral channel.
   */
  gameStart() {
    //@ts-ignore
    if (typeof onGameReady !== "undefined") onGameReady();

    //@ts-ignore
    if (typeof startGame !== "undefined") startGame();
  }

  /**
   * Game end method when game is over, adapt for Mintegral channel.
   */
  gameEnd() {
    //@ts-ignore
    window.super_html && super_html.game_end();

    //@ts-ignore
    if (typeof onGameEnd !== "undefined") onGameEnd();
  }

  /**
   * Set store url for redirect store action when user tap on CTA button.
   * Needed channel: Unity, Google
   * @param iosUrl: string
   * @param androidUrl: string
   */
  setStoreUrl(iosUrl: string, androidUrl: string) {
    //@ts-ignore
    window.super_html && (super_html.google_play_url = androidUrl);

    //@ts-ignore
    window.super_html && (super_html.appstore_url = iosUrl);

    //@ts-ignore
    if (typeof setStoreUrl !== "undefined") setStoreUrl(iosUrl, androidUrl);
  }
}

const playableHelper = new H5Playable();
export default playableHelper;
