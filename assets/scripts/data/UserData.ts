declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { GameData } from './GameData';
import { SaveData } from './SaveData';
const { ccclass, property } = _decorator;

@ccclass('UserData')
export class UserData extends Component {

    private playerName: string = "";

    private currentProgress: number = 0;
    private levelsCount: number = 0;

    private Gold: number = 0;

    private StartBombs: number = 0;
    private StartRockets: number = 0;
    private StartDiscoballs: number = 0;

    private Hammers: number = 0;
    private Bows: number = 0;
    private Cannons: number = 0;
    private Jesters: number = 0;

    private Bombs_EndTime: Date;
    private Rockets_EndTime: Date;
    private Discoballs_EndTime: Date;

    private EndlessLives_EndTime: Date;
    private Modifier_x2_EndTime: Date;

    public static instance: UserData = null;


    onLoad() {
        UserData.instance = this;
    }
    
    start() {
        this.currentProgress = 0;

        this.Gold = 5000;

        const now = new Date();
        this.Bombs_EndTime = new Date(now);
        this.Rockets_EndTime = new Date(now);
        this.Discoballs_EndTime = new Date(now);
        this.EndlessLives_EndTime = new Date(now);
        this.Modifier_x2_EndTime = new Date(now);

        SaveData.instance.loadUserData();

        this.node.emit("resources_update", this.Gold);

        this.playerName = gamepush.player.name !== "" ? gamepush.player.name : "Player" + gamepush.player.id;
        console.log("Logged as: " + this.playerName);
    }


    addProgress() {
        if(this.currentProgress < this.levelsCount - 1) {
            this.currentProgress++;
        }

        SaveData.instance.saveUserData();
    }

    getProgress(): number {
        return this.currentProgress;
    }

    setProgress(progress: number) {
        this.currentProgress = progress;
    }

    setLevelsCount(levelsCount: number) {
        this.levelsCount = levelsCount;
    }


    addResource(resourceType: string, value: number) {
        let now = new Date();
        let timeDiff = 0;

        switch(resourceType) {
            case "gold":
                this.Gold += value;
                break;

            case "bomb":
                this.StartBombs += value;
                break;
            case "rocket":
                this.StartRockets += value;
                break;
            case "discoball":
                this.StartDiscoballs += value;
                break;

            case "hammer":
                this.Hammers += value;
                break;
            case "bow":
                this.Bows += value;
                break;
            case "cannon":
                this.Cannons += value;
                break;
            case "jester":
                this.Jesters += value;
                break;

            case "bomb_minutes":   
                timeDiff = this.Bombs_EndTime instanceof Date ? this.Bombs_EndTime.getTime() - now.getTime() : -1;

                this.Bombs_EndTime = timeDiff < 0 ? new Date(now.getTime() + value * 60 * 1000) : new Date(this.Bombs_EndTime.getTime() + value * 60 * 1000);
                break;
            case "rocket_minutes":
                timeDiff = this.Rockets_EndTime instanceof Date ? this.Rockets_EndTime.getTime() - now.getTime() : -1;

                this.Rockets_EndTime = timeDiff < 0 ? new Date(now.getTime() + value * 60 * 1000) : new Date(this.Rockets_EndTime.getTime() + value * 60 * 1000);
                break;
            case "discoball_minutes":
                timeDiff = this.Discoballs_EndTime instanceof Date ? this.Discoballs_EndTime.getTime() - now.getTime() : -1;

                this.Discoballs_EndTime = timeDiff < 0 ? new Date(now.getTime() + value * 60 * 1000) : new Date(this.Discoballs_EndTime.getTime() + value * 60 * 1000);
                break;
            case "endless_lives_minutes":
                timeDiff = this.EndlessLives_EndTime instanceof Date ? this.EndlessLives_EndTime.getTime() - now.getTime() : -1;

                this.EndlessLives_EndTime = timeDiff < 0 ? new Date(now.getTime() + value * 60 * 1000) : new Date(this.EndlessLives_EndTime.getTime() + value * 60 * 1000);
                break;
            case "modifier_x2_minutes":
                timeDiff = this.Modifier_x2_EndTime instanceof Date ? this.Modifier_x2_EndTime.getTime() - now.getTime() : -1;

                this.Modifier_x2_EndTime = timeDiff < 0 ? new Date(now.getTime() + value * 60 * 1000) : new Date(this.Modifier_x2_EndTime.getTime() + value * 60 * 1000);
                break;
        }

        this.node.emit("resources_update", this.Gold);

        SaveData.instance.saveUserData();
    }

    subResource(resourceType: string, value: number) {
        switch(resourceType) {
            case "gold":
                this.Gold -= value;
                break;

            case "bomb":
                if(this.StartBombs >= value) {
                    this.StartBombs -= value;
                }

                break;
            case "rocket":
                if(this.StartRockets >= value) {
                    this.StartRockets -= value;
                }

                break;
            case "discoball":
                if(this.StartDiscoballs >= value) {
                    this.StartDiscoballs -= value;
                }
                break;
    
            case "hammer":
                if(this.Hammers >= value) {
                    this.Hammers -= value;
                }
                break;
            case "bow":
                if(this.Bows >= value) {
                    this.Bows -= value;
                }
                break;
            case "cannon":
                if(this.Cannons >= value) {
                    this.Cannons -= value;
                }
                break;
            case "jester":
                if(this.Jesters >= value) {
                    this.Jesters -= value;
                }
                break;
        }

        this.node.emit("resources_update", this.Gold);

        SaveData.instance.saveUserData();
    }


    getResource(resourceType: string): number {
        switch(resourceType) {
            case "gold":
                return this.Gold;

            case "bomb":
                return this.StartBombs;
            case "rocket":
                return this.StartRockets;
            case "discoball":
                return this.StartDiscoballs;
    
            case "hammer":
                return this.Hammers;
            case "bow":
                return this.Bows;
            case "cannon":
                return this.Cannons;
            case "jester":
                return this.Jesters;
        }

        return 0;
    }

    setResource(resourceType: string, value: number) {
        if(!value) {
            return;
        }
        
        switch(resourceType) {
            case "gold":
                this.Gold = value;
                break;

            case "bomb":
                this.StartBombs = value;
                break;
            case "rocket":
                this.StartRockets = value;
                break;
            case "discoball":
                this.StartDiscoballs = value;
                break;
    
            case "hammer":
                this.Hammers = value;
                break;
            case "bow":
                this.Bows = value;
                break;
            case "cannon":
                this.Cannons = value;
                break;
            case "jester":
                this.Jesters = value;
                break;
        }

        this.node.emit("resources_update", this.Gold);
    }


    getPlayerName(): string {
        return this.playerName;
    }


    getRemainingTimeString(timerType: string): string {
        const now = new Date();

        let timer = new Date();
        switch(timerType) {
            case "bomb":
                timer = this.Bombs_EndTime;
                break;
            case "rocket":
                timer = this.Rockets_EndTime;
                break;
            case "discoball":
                timer = this.Discoballs_EndTime;
                break;
            case "endless_lives":
                timer = this.EndlessLives_EndTime;
                break;
            case "modifier_x2":
                timer = this.Modifier_x2_EndTime;
                break;
        }

        const timeDiff = timer.getTime() - now.getTime();

        if (timeDiff < 0) {
            return "";
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }


    isTemproraryBonusActive(): boolean {
        if(this.getRemainingTimeString("bomb") !== "" || this.getRemainingTimeString("rocket") !== "" || this.getRemainingTimeString("discoball") !== "") {
            return true;
        }

        return false;
    }
}


