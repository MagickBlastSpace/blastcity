declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AdsTimer')
export class AdsTimer extends Component {

    @property(Node)
    level: Node = null;

    private gameplayTime: number = 0;
    private menuTime: number = 0;

    private isGameplay: boolean = false;
    private isMenu: boolean = false;

    private adsType: string = "";

    private levelsCounter: number = 0;

    private MENU_TRESHOLD = 300; //5 minutes
    private GAMEPLAY_TRESHOLD = 1200; //20 minutes


    start() {
        this.level.on("level_close", () => this.handleLevelCompletion());

        this.adsType = "1";
        if(gamepush.experiments.has('ADS', '2')) {
            this.adsType = "2";
        }
        else if(gamepush.experiments.has('ADS', '3')) {
            this.adsType = "3";
        }
        else if(gamepush.experiments.has('ADS', '4')) {
            this.adsType = "4";
        }

        console.log("Advertsment type: " + this.adsType);

        this.startMenuTimer();
    }

    update(dt: number) {
        if(this.adsType === "3") {
            this.gameplayTime += dt;
        }

        if(this.isMenu) {
            this.menuTime += dt;
            if (this.hasExceededMenuTime(this.menuTime)) {
                console.log("Menu time has exceeded 5 minutes!");

                this.resetMenuTimer();
    
                gamepush.ads.showFullscreen({ showCountdownOverlay: true });
            }
        }
    }

    startGameplayTimer() {
        console.log("Started Gameplay Timer");

        this.isGameplay = true;
        this.isMenu = false;
    }

    startMenuTimer() {
        console.log("Started Menu Timer");

        this.isGameplay = false;
        this.isMenu = true;
    }

    stopAllTimers() {
        this.isGameplay = false;
        this.isMenu = false;
    }

    resetTimers() {
        this.resetGameplayTimer();
        this.resetMenuTimer();
    }

    resetGameplayTimer() {
        this.gameplayTime = 0;
    }

    resetMenuTimer() {
        this.menuTime = 0;
    }


    hasExceededMenuTime(time: number): boolean {
        return time > this.MENU_TRESHOLD; // 300 seconds = 5 minutes
    }

    isGameplayAdReady(): boolean {
        switch(this.adsType) {
            case "1":
                return this.levelsCounter >= 3;
            case "2":
                return this.levelsCounter >= 5;
            case "3":
                return this.gameplayTime > this.GAMEPLAY_TRESHOLD;
            case "4":
                let accountAge = gamepush.player.get('accountage');
                let levelsThreshold = 8;

                if(accountAge === 0) {
                    this.levelsCounter = 0;
                    return false;
                }
                else if(accountAge === 1) {
                    levelsThreshold = 8;
                }
                else if(accountAge === 2) {
                    levelsThreshold = 5;
                }
                else if(accountAge >= 3) {
                    levelsThreshold = 3;
                }

                return this.levelsCounter >= levelsThreshold;
        }

        return false;
    }

    private handleLevelCompletion() {
        this.levelsCounter = this.levelsCounter + 1;

        if(this.isGameplayAdReady()) {
            this.resetGameplayTimer();
            this.levelsCounter = 0;

            gamepush.ads.showFullscreen();
        }
    }


    isGameplayActive(): boolean {
        return this.isGameplay;
    }
}


