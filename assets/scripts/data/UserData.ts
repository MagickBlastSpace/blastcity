declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { GameData } from './GameData';
import { SaveData } from './SaveData';
import { CollectionEvent } from '../game/events/special/CollectionEvent';
const { ccclass, property } = _decorator;

@ccclass('UserData')
export class UserData extends Component {

    private playerName: string = "";
    private clanName: string = "";
    private playerId: number = 0;
    private registerDate: string = "";

    private currentProgress: number = 0;
    private levelsCount: number = 0;

    private kingLeagueProgress: number = 0;

    private Gold: number = 0;
    private Stars: number = 0;

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

    private energyAskTimestamp: number = 0;
    private energyAskDelay_Hours: number = 4;

    private energyMax_Free: number = 5;
    private energyMax_Premium: number = 8;

    private friendsList: number[] = [];

    private overMaxEnergy: number = 15;

    public static instance: UserData = null;

    private isDev: boolean = false;

    private isPremium: boolean = false;

    @property(CollectionEvent)
    collections: CollectionEvent;


    onLoad() {
        UserData.instance = this;
    }
    
    start() {
        this.currentProgress = 0;
        this.kingLeagueProgress = 0;

        this.Gold = 5000;
        this.Stars = 0;

        const now = new Date();
        this.Bombs_EndTime = new Date(now);
        this.Rockets_EndTime = new Date(now);
        this.Discoballs_EndTime = new Date(now);
        this.EndlessLives_EndTime = new Date(now);
        this.Modifier_x2_EndTime = new Date(now);
        this.energyAskTimestamp = 0;
        this.friendsList = [];

        gamepush.player.set('energy:max', this.energyMax_Free);

        SaveData.instance.loadUserData();

        this.node.emit("resources_update", this.Gold, this.Stars);

        if(gamepush.player.get("registration_date") === "") {
            console.log("register date init: ");

            const now = new Date();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const year = now.getFullYear().toString();

            const formattedDate = `${month}/${year}`;
            this.registerDate = formattedDate;

            gamepush.player.set('registration_date', this.registerDate);
            gamepush.player.sync();
        }
        else {
            console.log("register date load: ");

            this.registerDate = gamepush.player.get("registration_date");
        }

        console.log("register date: " + this.registerDate);

        if(gamepush.player.name === "") {
            this.playerName = "Player" + gamepush.player.id;

            gamepush.player.set('name', this.playerName);
            gamepush.player.sync();
        }
        else {
            this.playerName = gamepush.player.name;
        }

        this.playerId = gamepush.player.id;

        console.log("Logged as: " + this.playerName);

        gamepush.channels.on('event:message', (message) => {
            if(message.target === "PERSONAL" && message.tags.includes("energy")) {
                this.addResource("energy", 1);

                gamepush.player.add('stat_energy_recieved', 1);
            }
        });

        gamepush.channels.on('event:message', (message) => {
            if(message.target === "PERSONAL" && message.tags.includes("collection_card")) {
                let newCards = [];
                newCards.push(message.text);

                console.log("Collection card accepted: " + message.text);

                this.collections.applyNewCards(newCards);

                gamepush.channels.deleteMessage({ messageId: message.id });
            }
        });


        this.checkForItemsFromFriends();
    }


    addProgress() {
        if(this.currentProgress < GameData.instance.getMaxProgress()) {
            this.currentProgress++;

            SaveData.instance.saveUserData();

            gamepush.player.set('score', this.currentProgress);
            gamepush.player.sync();

            GameData.instance.updateLevelStage();
        }

        else {
            this.kingLeagueProgress++;

            gamepush.player.set('score_king_league', this.kingLeagueProgress);
            gamepush.player.sync();
        }
    }


    getProgress(): number {
        return this.currentProgress;
    }

    getKingLeagueProgress(): number {
        if (isNaN(this.kingLeagueProgress)) {
            this.kingLeagueProgress = 0;
        }
        return this.kingLeagueProgress;
    }


    setProgress(progress: number) {
        this.currentProgress = progress;
    }

    setKingLeagueProgress(progress: number) {
        if (isNaN(progress)) {
            console.error('Invalid progress value: Not a number');

            this.kingLeagueProgress = 0;

            return;
        }

        this.kingLeagueProgress = progress;
    }

    setLevelsCount(levelsCount: number) {
        this.levelsCount = levelsCount;

        console.log('Levels count:', levelsCount);
    }


    addResource(resourceType: string, value: number) {
        let now = new Date();
        let timeDiff = 0;

        switch(resourceType) {
            case "gold":
                this.Gold += value;
                break;
            case "stars":
                this.Stars += value;
                this.node.emit("stars", value);
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

            case "energy":
                if(gamepush.player.get('energy') < this.overMaxEnergy) {
                    gamepush.player.add('energy', value);
                    gamepush.player.sync();
                }

                break;
        }

        this.node.emit("resources_update", this.Gold, this.Stars);

        SaveData.instance.saveUserData();
    }

    subResource(resourceType: string, value: number) {
        switch(resourceType) {
            case "gold":
                this.Gold -= value;
                break;

            case "bomb":
                if(this.StartBombs >= value && this.getRemainingTimeString("bomb") === "") {
                    this.StartBombs -= value;
                }

                break;
            case "rocket":
                if(this.StartRockets >= value && this.getRemainingTimeString("rocket") === "") {
                    this.StartRockets -= value;
                }

                break;
            case "discoball":
                if(this.StartDiscoballs >= value && this.getRemainingTimeString("discoball") === "") {
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
            
            case "energy":
                gamepush.player.add('energy', -1);
                gamepush.player.sync();

                break;
        }

        this.node.emit("resources_update", this.Gold, this.Stars);

        SaveData.instance.saveUserData();
    }


    getResource(resourceType: string): number {
        switch(resourceType) {
            case "gold":
                return this.Gold;
            case "stars":
                return this.Stars;

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
            case "stars":
                this.Stars = value;
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

        this.node.emit("resources_update", this.Gold, this.Stars);
    }


    getPlayerName(): string {
        return this.playerName;
    }

    getPlayerId(): number {
        return this.playerId;
    }

    getClanName(): string {
        return this.clanName;
    }

    setClanName(clan: string) {
        this.clanName = clan;

        gamepush.player.set('clanname', this.clanName);
        gamepush.player.sync();
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

    isEndlessLivesActive(): boolean {
        if(this.getRemainingTimeString("endless_lives") !== "") {
            return true;
        }

        return false;
    }

    /*Energy*/
    getEnergyAskTimestamp(): number {
        return this.energyAskTimestamp;
    }

    setEnergyAskTimestamp(stamp: number) {
        this.energyAskTimestamp = stamp;
    }

    getEnergyAskTimeDifferenceInHours(): number {
        const currentTime = Date.now();

        const differenceInMillis = currentTime - this.energyAskTimestamp;

        const differenceInHours = differenceInMillis / (1000 * 60 * 60);

        return differenceInHours;
    }
        
    isEnergyAskAvailable(): boolean {
        if(this.energyAskTimestamp === 0 || this.energyAskTimestamp === undefined || this.energyAskTimestamp === null) {
            return true;
        }

        if(this.getEnergyAskTimeDifferenceInHours() >= this.energyAskDelay_Hours) {
            return true;
        }

        return false;
    }

    getEnergyCooldownTimeString(): string {
        if(this.isEnergyAskAvailable()) {
            return "";
        }

        const now = Date.now();
        const cooldownEndTime = this.energyAskTimestamp + this.energyAskDelay_Hours * 60 * 60 * 1000;
    
        if (now >= cooldownEndTime) {
            return "";
        }
    
        const timeDiff = cooldownEndTime - now;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
        return "Cooldown: " + `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }


    addFriend(playerId: number) {
        if(this.friendsList === undefined || this.friendsList === null) {
            this.friendsList = [];
        }

        if(this.friendsList.includes(playerId)) {
            return;
        }

        this.friendsList.push(playerId);
    }

    removeFriend(playerId: number) {
        if(this.friendsList.includes(playerId)) {
            this.friendsList.filter(num => num !== playerId);
        }
    }

    isFriend(playerId: number) {
        if(this.friendsList === undefined || this.friendsList === null) {
            return false;
        }
        return this.friendsList.includes(playerId);
    }

    getFriendsList(): number[] {
        if(this.friendsList === undefined || this.friendsList === null) {
            return [];
        }
        return this.friendsList;
    }

    setFriendsList(list: number[]) {
        this.friendsList = list;
    }


    setDevMode(isDev: boolean) {
        this.isDev = isDev;
    }

    isDevMode(): boolean {
        return this.isDev;
    }


    setIsPremium(isPremium: boolean): boolean {
        this.isPremium = isPremium;
    }

    getIsPremium(): boolean {
        return this.isPremium;
    }

    buyPremium() {
        this.isPremium = true;

        gamepush.player.set('energy:max', this.energyMax_Premium);

        this.node.emit("premium_purchase");
    }


    updateName(newName: string) {
        this.playerName = newName;

        gamepush.player.set('name', newName);
        gamepush.player.sync();
    }


    openCardsPack(type: number): string[] {
        let newCards = this.collections.openCardsPackage(type);

        return newCards;
    }

    getCollectionIdByCard(id: string): string {
        return this.collections.findCollectionIdByCard(id);
    }


    async checkForItemsFromFriends() {
        for(let i = 0; i < this.friendsList.length; i++) {
            const response = await gamepush.channels.fetchPersonalMessages({
                playerId: this.friendsList[i],
                tags: ['collection_card'],
                limit: 100,
                offset: 0,
            });

            response.items.forEach((message) => {
                let newCards = [];
                newCards.push(message.text);

                this.collections.applyNewCards(newCards);

                gamepush.channels.deleteMessage({ messageId: message.id });
            });
        }
    }
}


