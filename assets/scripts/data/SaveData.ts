import { _decorator, Component, Node, Vec2 } from 'cc';
import { UserData } from './UserData';
import { GameData, LevelData, LevelProgressData, SpecialTileData } from './GameData';
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

    public static instance: SaveData = null;


    onLoad() {
        SaveData.instance = this;
    }

    //UserData
    saveUserData() {
        let userData = {
            progress: UserData.instance.getProgress(),
            gold: UserData.instance.getResource("gold")
        };
        
        cc.sys.localStorage.setItem('userData', JSON.stringify(userData));
    }


    loadUserData() {
        var userData = JSON.parse(cc.sys.localStorage.getItem('userData'));

        if (userData) {
            UserData.instance.setProgress(userData.progress);
            UserData.instance.setResource("gold", userData.gold);
        } else {
            console.log("No saved user data found");
        }

        this.node.emit("user_data");
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

        levelState.startPool = fieldComp.getStartSpawnPool();
        levelState.spawnPools = fieldComp.getSpawnPools();
        levelState.rocketPreset = fieldComp.getRocketPreset();
        levelState.dynamiteGoals = fieldComp.getDynamiteGoals();
        levelState.cosmorocketGoals = fieldComp.getCosmorocketGoals();

        levelState.goals = levelComp.getGoals();
        levelState.movesCount = levelComp.getMoves();
        levelState.difficulty = levelComp.getDifficulty();
        levelState.movesShopStage = movesShopComp.getCurrentStage();

        levelProgressData.levelId = UserData.instance.getProgress();
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
            console.log("No saved level progress data found");
        }
    }

    clearLevelProgress() {
        cc.sys.localStorage.removeItem('levelProgress');
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
            console.log("No saved start bonuses data found");
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
            console.log("No saved butlers gift data found");
        }
    }


    //Statistics Data
}


