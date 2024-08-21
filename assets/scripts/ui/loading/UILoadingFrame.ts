declare const gamepush: any;

import { _decorator, Component, Node, ProgressBar, director, SceneAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UILoadingFrame')
export class UILoadingFrame extends Component {

    @property(ProgressBar)
    loadingBar: ProgressBar = null;

    private timeCooldown: number = 1.5;


    start() {
        this.initializeGamePush();
    }


    initializeGamePush() {
        try {
            if(gamepush.player.ready) {
                console.log("GamePush module is ready!");

                gamepush.ads.showPreloader();

                gamepush.ads.on('preloader:close', (success) => {
                    this.loadScene();
                });

            }
            else {
                this.scheduleNewTry();
            }
        } catch (error) {
            //console.error("Error initializing GamePush:", error);

            this.scheduleNewTry();
        }
    }

    loadScene() {
        director.preloadScene("scene", this.onProgressLoadScene, () => {
            director.loadScene("scene");
        })
    }

    private onProgressLoadScene = (completedCount: number, totalCount: number, item: any) => {
        this.loadingBar.progress = completedCount / totalCount;
    }

    scheduleNewTry() {
        this.scheduleOnce(() => {
            this.initializeGamePush();
        }, this.timeCooldown);
    }
}
