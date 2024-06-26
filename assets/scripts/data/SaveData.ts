declare const gamepush: any;

import { _decorator, Component, Node, Vec2 } from 'cc';
import { UserData } from './UserData';
import { GameData, LevelData, LevelProgressData, SpecialTileData, SpecialTileStateData } from './GameData';
const { ccclass, property } = _decorator;

@ccclass('SaveData')
export class SaveData extends Component {

    @property(Node)
    field: Node = null;
    @property(Node)
    level: Node = null;
    @property(Node)
    startBonuses: Node = null;
    @property(Node)
    butlersGift: Node = null;
    @property(Node)
    movesShop: Node = null;
    @property(Node)
    statistics: Node = null;
    
    @property([Node])
    events: Node[] = [];

    public static instance: SaveData = null;


    onLoad() {
        SaveData.instance = this;
    }

    //UserData
    saveUserData() {
        let userData = {
            progress: UserData.instance.getProgress(),
            gold: UserData.instance.getResource("gold"),

            bomb: UserData.instance.getResource("bomb"),
            rocket: UserData.instance.getResource("rocket"),
            discoball: UserData.instance.getResource("discoball"),

            hammer: UserData.instance.getResource("hammer"),
            bow: UserData.instance.getResource("bow"),
            cannon: UserData.instance.getResource("cannon"),
            jester: UserData.instance.getResource("jester")
        };
        
        cc.sys.localStorage.setItem('userData', JSON.stringify(userData));
    }

    loadUserData() {
        var userData = JSON.parse(cc.sys.localStorage.getItem('userData'));

        if (userData) {
            UserData.instance.setProgress(userData.progress);
            UserData.instance.setResource("gold", userData.gold);

            UserData.instance.setResource("bomb", userData.bomb);
            UserData.instance.setResource("rocket", userData.rocket);
            UserData.instance.setResource("discoball", userData.discoball);

            UserData.instance.setResource("hammer", userData.hammer);
            UserData.instance.setResource("bow", userData.bow);
            UserData.instance.setResource("cannon", userData.cannon);
            UserData.instance.setResource("jester", userData.jester);
        } else {
            //console.log("No saved user data found");
            UserData.instance.setProgress(0);
        }

        this.node.emit("user_data");
    }

    clearUserData() {
        cc.sys.localStorage.removeItem('userData');

        cc.sys.localStorage.removeItem('levelProgress');
        cc.sys.localStorage.removeItem('statistics');
        cc.sys.localStorage.removeItem('startBonuses');
        cc.sys.localStorage.removeItem('butlersGift');

        for(let i = 0; i < this.events.length; i++) {
            let eventComp = this.events[i].getComponent("EventBase");

            cc.sys.localStorage.removeItem('event_' + eventComp.getEventId());
        }

        gamepush.player.set('score_lightning', 0);
        gamepush.player.set('score_kings_cup', 0);
        gamepush.player.set('score_sky_race', 0);
        gamepush.player.sync();
    }


    //Level Progress Data
    saveLevelProgressData() {
        let levelProgressData = new LevelProgressData();
        let levelState = new LevelData();

        let fieldComp = this.field.getComponent("Field");
        let levelComp = this.level.getComponent("Level");
        let movesShopComp = this.movesShop.getComponent("MovesShop");

        levelState.emptyTiles = this.getEmptyTilesData(fieldComp.getTilesArray());
        levelState.specialTiles = this.getTilesData(fieldComp.getTilesArray());
        levelState.statuses = this.getStatusData(fieldComp.getStatusArray());
        levelState.destroyedOnStart = this.getDestroyedTilesData(fieldComp.getTilesArray());
        levelState.specsState = this.getSpecTilesStateData(fieldComp.getTilesArray());
        levelState.statusesState = this.getStatusesStateData(fieldComp.getStatusArray());

        levelState.startPool = fieldComp.getStartSpawnPool();
        levelState.spawnPools = fieldComp.getSpawnPools();
        levelState.rocketPreset = fieldComp.getRocketPreset();
        levelState.dynamiteGoals = fieldComp.getDynamiteGoals();
        levelState.cosmorocketGoals = fieldComp.getCosmorocketGoals();

        levelState.goals = levelComp.getGoals();
        levelState.movesCount = levelComp.getMoves();
        levelState.difficulty = levelComp.getDifficulty();
        levelState.movesShopStage = movesShopComp.getCurrentStage();

        levelProgressData.levelState = levelState.toJSON();

        cc.sys.localStorage.setItem('levelProgress', JSON.stringify(levelProgressData));
    }

    loadLevelProgressData() {
        var levelProgressData = JSON.parse(cc.sys.localStorage.getItem('levelProgress'));

        if (levelProgressData) {
            if(levelProgressData.levelState) {
                this.node.emit("level_progress_loaded", LevelData.fromJSON(levelProgressData.levelState));
            }
        }
        else {
            //console.log("No saved level progress data found");
        }
    }

    clearLevelProgress() {
        cc.sys.localStorage.removeItem('levelProgress');
        cc.sys.localStorage.removeItem('statistics');
    }


    getTilesData(tiles: Node[][]): SpecialTileData[] {
        let tilesData = [];

        const numRows: number = tiles.length;
        const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                if(tiles[i][j] !== null) {
                    let tileComp = tiles[i][j].getComponent("TileBase");
                    if(tileComp.isCommonTile() || tileComp.isBonusTile() || tileComp.isSpecialTile()) {
                        let specData = new SpecialTileData();
                        specData.id = tileComp.getTileType();
                        specData.row = tileComp.getRow();
                        specData.col = tileComp.getCol();

                        if(!tilesData.includes(specData)) {
                            tilesData.push(specData);
                        }
                    }
                }
            }
        }

        return tilesData;
    }

    getDestroyedTilesData(tiles: Node[][]): Vec2[] {
        let tilesData = [];

        const numRows: number = tiles.length;
        const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                if(tiles[i][j] === null) {
                    tilesData.push(new Vec2(j, i));
                }
            }
        }

        return tilesData;
    }

    getEmptyTilesData(tiles: Node[][]): Vec2[] {
        let tilesData = [];

        const numRows: number = tiles.length;
        const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                if(tiles[i][j] !== null) {
                    let tileComp = tiles[i][j].getComponent("TileBase");
                    if(tileComp.isEmptyTile()) {
                        tilesData.push(new Vec2(j, i));
                    }
                }
            }
        }

        return tilesData;
    }

    getStatusData(tiles: Node[][]): SpecialTileData[] {
        let tilesData = [];

        const numRows: number = tiles.length;
        const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                if(tiles[i][j] !== null) {
                    let statusComp = tiles[i][j].getComponent("StatusBase");

                    let specData = new SpecialTileData();
                    specData.id = statusComp.getStatusType();
                    specData.row = statusComp.getRow();
                    specData.col = statusComp.getCol();

                    if(!tilesData.includes(specData)) {
                        tilesData.push(specData);
                    }
                }
            }
        }

        return tilesData;
    }


    getSpecTilesStateData(tiles: Node[][]): SpecialTileStateData[] {
        let tilesData = [];

        const numRows: number = tiles.length;
        const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                if(tiles[i][j] !== null) {
                    let tileComp = tiles[i][j].getComponent("TileBase");
                    if(tileComp.isSpecialTile()) {
                        let specData = new SpecialTileStateData();
                        specData.row = tileComp.getRow();
                        specData.col = tileComp.getCol();
                        specData.strength = tileComp.getStrength();

                        specData.strengthRed = tileComp.getStrengthRed();
                        specData.strengthBlue = tileComp.getStrengthBlue();
                        specData.strengthGreen = tileComp.getStrengthGreen();
                        specData.strengthYellow = tileComp.getStrengthYellow();
                        specData.strengthPurple = tileComp.getStrengthPurple();

                        specData.customParameter = tileComp.getCustomParameter();

                        tilesData.push(specData);
                    }
                }
            }
        }

        return tilesData;
    }

    getStatusesStateData(statuses: Node[][]): SpecialTileStateData[] {
        let tilesData = [];

        const numRows: number = statuses.length;
        const numCols: number = statuses.length > 0 ? statuses[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                if(statuses[i][j] !== null) {
                    let statusComp = statuses[i][j].getComponent("StatusBase");

                    let specData = new SpecialTileStateData();
                    specData.row = statusComp.getRow();
                    specData.col = statusComp.getCol();

                    specData.customParameter = statusComp.getCustomParameter();

                    tilesData.push(specData);
                }
            }
        }

        return tilesData;
    }



    //Start Bonuses
    saveStartBonusesData() {
        let startBonusesComp = this.startBonuses.getComponent("StartBonuses");

        let startBonusesData = {
            bonuses: startBonusesComp.getStartBonusPool()
        };
        
        cc.sys.localStorage.setItem('startBonuses', JSON.stringify(startBonusesData));
    }


    loadStartBonusesData() {
        var startBonusesData = JSON.parse(cc.sys.localStorage.getItem('startBonuses'));

        if (startBonusesData) {
            let startBonusesComp = this.startBonuses.getComponent("StartBonuses");
            startBonusesComp.setStartBonusPool(startBonusesData.bonuses);
        } else {
            //console.log("No saved start bonuses data found");
        }
    }


    //Butler's Gift
    saveButlersGiftData() {
        let butlersGiftComp = this.butlersGift.getComponent("ButlersGift");

        let butlersGiftData = {
            streak: butlersGiftComp.getStreak(),
            isGifted: butlersGiftComp.getIsGifted()
        };
        
        cc.sys.localStorage.setItem('butlersGift', JSON.stringify(butlersGiftData));
    }


    loadButlersGiftData() {
        var butlersGiftData = JSON.parse(cc.sys.localStorage.getItem('butlersGift'));

        if (butlersGiftData) {
            let butlersGiftComp = this.butlersGift.getComponent("ButlersGift");
            butlersGiftComp.setStreak(butlersGiftData.streak);
            butlersGiftComp.setIsGifted(butlersGiftData.isGifted);
        } else {
            //console.log("No saved butlers gift data found");
        }
    }


    //Statistics Data
    saveStatistics() {
        let statisticsComp = this.statistics.getComponent("Statistics");
    
        let statistics = {
            levelsStats: statisticsComp.getLevelsStats()
        };
    
        try {
            cc.sys.localStorage.setItem('statistics', JSON.stringify(statistics));
        } catch (error) {
            console.error("Error saving statistics:", error);
        }
    }
    
    loadStatistics() {
        try {
            var statistics = JSON.parse(cc.sys.localStorage.getItem('statistics'));
    
            if (statistics && statistics.levelsStats) {
                let statisticsComp = this.statistics.getComponent("Statistics");
    
                for (let i = 0; i < statistics.levelsStats.length; i++) {
                    statisticsComp.updateLevelStat(statistics.levelsStats[i]);
                }
            } else {
                //console.log("No stats data found");
            }
        } catch (error) {
            console.error("Error loading statistics:", error);
        }
    }
    


    //Events
    saveEvent(eventId: string) {

        for(let i = 0; i < this.events.length; i++) {
            let eventComp = this.events[i].getComponent("EventBase");

            if(eventComp.getEventId() === eventId) {
                let eventData = {
                    isStarted: eventComp.getIsStarted(),
                    lastAttemptTimestamp: eventComp.getLastTimestamp(),
                    currentStage: eventComp.getCurrentStage(),
                    isComplete: eventComp.getIsComplete(),
                    collectable: eventComp.getCollectable(),
                    currentLevel: eventComp.getCurrentLevel(),
                    hp: eventComp.getHp(),
                    specialPool: eventComp.getSpecialPool(),
                    specialPredictions: eventComp.getSpecialPredictions(),
                    specialHints: eventComp.getSpecialHints(),
                    multiplayerChannel: eventComp.getMultiplayerChannel()
                };
        
                try {
                    cc.sys.localStorage.setItem('event_' + eventComp.getEventId(), JSON.stringify(eventData));
                } catch (error) {
                    console.error("Error saving event " + eventComp.getEventId() + ": ", error);
                }
            }
        }
        
    }
    
    loadEvent(eventId: string) {
        for(let i = 0; i < this.events.length; i++) {
            let eventComp = this.events[i].getComponent("EventBase");

            if(eventComp.getEventId() === eventId) {
                try {
                    var eventData = JSON.parse(cc.sys.localStorage.getItem('event_' + eventComp.getEventId()));
            
                    if (eventData) {
                        eventComp.setIsStarted(eventData.isStarted);
                        eventComp.setCurrentStage(eventData.currentStage);
                        eventComp.setIsComplete(eventData.isComplete);
                        eventComp.setCollectable(eventData.collectable);
                        eventComp.setCurrentLevel(eventData.currentLevel);
                        eventComp.setHp(eventData.hp);
                        eventComp.setSpecialPool(eventData.specialPool);
                        eventComp.setSpecialPredictions(eventData.specialPredictions);
                        eventComp.setSpecialHints(eventData.specialHints);

                        eventComp.setLastTimestamp(eventData.lastAttemptTimestamp);
                        eventComp.setMultiplayerChannel(eventData.multiplayerChannel)
                    } else {
                        //console.log("No event " + eventComp.getEventId() + " data found");
                    }
                } catch (error) {
                    console.error("Error loading event " + eventComp.getEventId() + ": ", error);
                }
            }
        }
    }
}


