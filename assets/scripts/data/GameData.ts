declare const gamepush: any;

import { _decorator, Component, Node, Vec2, Prefab } from 'cc';
import { UserData } from './UserData';
import { Statistics } from './Statistics';
const { ccclass, property } = _decorator;


@ccclass('SpecialTileData')
export class SpecialTileData {
    @property
    id = '';
    @property
    row = 0;
    @property
    col = 0;
}

@ccclass('SpecialTileStateData')
export class SpecialTileStateData {
    @property
    row = 0;
    @property
    col = 0;
    @property
    strength = 0;

    @property
    strengthRed = 0;
    @property
    strengthBlue = 0;
    @property
    strengthGreen = 0;
    @property
    strengthYellow = 0;
    @property
    strengthPurple = 0;

    @property
    customParameter = 0;
}


@ccclass('SpecialPrefabData')
export class SpecialPrefabData {
    @property
    id = '';
    @property(Prefab)
    prefab: Prefab = null;
}


@ccclass('GoalData')
export class GoalData {
    @property
    id = '';
    @property
    count = 0;
}


@ccclass('MovesShopStageData')
export class MovesShopStageData {
    @property
    moves = 0;

    @property
    rockets = 0;
    @property
    bombs = 0;
    @property
    discoballs = 0;

    @property
    price = 0;
}


@ccclass('LevelData')
export class LevelData {
    @property
    id = '';
    @property([Vec2])
    emptyTiles: Vec2[] = [];
    @property([SpecialTileData])
    specialTiles: SpecialTileData[] = [];
    @property([SpecialTileData])
    statuses: SpecialTileData[] = [];
    @property([Vec2])
    destroyedOnStart: Vec2[] = [];
    @property([cc.String])
    startPool: string[] = [];

    spawnPools: string[][] = [];

    @property([GoalData])
    goals: GoalData[] = [];
    @property
    movesCount = 0;
    @property
    rocketPreset = '';

    @property([GoalData])
    dynamiteGoals: GoalData[] = [];
    @property([GoalData])
    cosmorocketGoals: GoalData[] = [];

    @property
    difficulty = '';

    @property
    movesShopStage = 0;
    @property([SpecialTileStateData])
    specsState: SpecialTileStateData[] = [];
    @property([SpecialTileStateData])
    statusesState: SpecialTileStateData[] = [];

    @property
    tutorial = '';



    static fromJSON(jsonString: string): LevelData {
        const jsonData = JSON.parse(jsonString);
        const levelData = new LevelData();
        levelData.id = (jsonData.id || '').toLowerCase();
    
        if (jsonData.emptyTiles) {
            levelData.emptyTiles = jsonData.emptyTiles.map((coord: any) => {
                const vec2 = new Vec2();
                vec2.x = coord.x;
                vec2.y = coord.y;
                return vec2;
            });
        }
    
        if (jsonData.specialTiles) {
            levelData.specialTiles = jsonData.specialTiles.map((specialTile: any) => {
                const tileData = new SpecialTileData();
                tileData.id = (specialTile.id || '').toLowerCase();
                tileData.row = specialTile.row;
                tileData.col = specialTile.col;
                return tileData;
            });
        }
    
        if (jsonData.statuses) {
            levelData.statuses = jsonData.statuses.map((specialTile: any) => {
                const tileData = new SpecialTileData();
                tileData.id = (specialTile.id || '').toLowerCase();
                tileData.row = specialTile.row;
                tileData.col = specialTile.col;
                return tileData;
            });
        }
    
        if (jsonData.destroyedOnStart) {
            levelData.destroyedOnStart = jsonData.destroyedOnStart.map((coord: any) => {
                const vec2 = new Vec2();
                vec2.x = coord.x;
                vec2.y = coord.y;
                return vec2;
            });
        }
    
        if (jsonData.startPool) {
            levelData.startPool = jsonData.startPool.map((startItem: any) => {
                return (startItem || '').toLowerCase();
            });
        }
    
        if (jsonData.spawnPools) {
            levelData.spawnPools = jsonData.spawnPools.map((spawnItem: any) => {
                return spawnItem.map((color: string) => (color || '').toLowerCase()) || [];
            });
        }
    
        if (jsonData.goals) {
            levelData.goals = jsonData.goals.map((goal: any) => {
                const goalData = new GoalData();
                goalData.id = (goal.id || '').toLowerCase();
                goalData.count = goal.count;
                return goalData;
            });
        }
    
        if (jsonData.movesCount !== cc.undefined && jsonData.movesCount !== null) {
            levelData.movesCount = Number(jsonData.movesCount);
        } else {
            levelData.movesCount = 0;
        }

        if (jsonData.rocketPreset !== cc.undefined && jsonData.rocketPreset !== null) {
            levelData.rocketPreset = jsonData.rocketPreset.toLowerCase();
        } else {
            levelData.rocketPreset = "random";
        }

        if (jsonData.dynamiteGoals) {
            levelData.dynamiteGoals = jsonData.dynamiteGoals.map((goal: any) => {
                const goalData = new GoalData();
                goalData.id = (goal.id || '').toLowerCase();
                goalData.count = goal.count;
                return goalData;
            });
        }
        else {
            levelData.dynamiteGoals = [];
        }

        if (jsonData.cosmorocketGoals) {
            levelData.cosmorocketGoals = jsonData.cosmorocketGoals.map((goal: any) => {
                const goalData = new GoalData();
                goalData.id = (goal.id || '').toLowerCase();
                goalData.count = goal.count;
                return goalData;
            });
        }
        else {
            levelData.cosmorocketGoals = [];
        }

        if (jsonData.difficulty !== cc.undefined && jsonData.difficulty !== null) {
            levelData.difficulty = jsonData.difficulty.toLowerCase();
        } else {
            levelData.difficulty = "common";
        }

        if (jsonData.movesShopStage !== cc.undefined && jsonData.movesShopStage !== null) {
            levelData.movesShopStage = Number(jsonData.movesShopStage);
        } else {
            levelData.movesShopStage = 0;
        }

        if (jsonData.specsState) {
            levelData.specsState = jsonData.specsState.map((specialTile: any) => {
                const tileData = new SpecialTileStateData();
                tileData.strength = specialTile.strength;
                tileData.row = specialTile.row;
                tileData.col = specialTile.col;
                tileData.strengthRed = specialTile.strengthRed;
                tileData.strengthBlue = specialTile.strengthBlue;
                tileData.strengthGreen = specialTile.strengthGreen;
                tileData.strengthYellow = specialTile.strengthYellow;
                tileData.strengthPurple = specialTile.strengthPurple;
                tileData.customParameter = specialTile.customParameter;
                return tileData;
            });
        }
        else {
            levelData.specsState = [];
        }

        if (jsonData.statusesState) {
            levelData.statusesState = jsonData.statusesState.map((specialTile: any) => {
                const tileData = new SpecialTileStateData();
                tileData.row = specialTile.row;
                tileData.col = specialTile.col;
                tileData.customParameter = specialTile.customParameter;
                return tileData;
            });
        }
        else {
            levelData.statusesState = [];
        }

        if (jsonData.tutorial !== cc.undefined && jsonData.tutorial !== null) {
            levelData.tutorial = jsonData.tutorial.toLowerCase();
        } else {
            levelData.tutorial = "";
        }
    
        return levelData;
    }


    toJSON(): string {
        const json = {
            id: this.id,
            emptyTiles: this.emptyTiles.map(coord => ({ x: coord.x, y: coord.y })),
            specialTiles: this.specialTiles.map(tile => ({
                id: tile.id,
                row: tile.row,
                col: tile.col
            })),
            statuses: this.statuses.map(tile => ({
                id: tile.id,
                row: tile.row,
                col: tile.col
            })),
            destroyedOnStart: this.destroyedOnStart.map(coord => ({ x: coord.x, y: coord.y })),
            startPool: this.startPool.map(item => item.toLowerCase()),
            spawnPools: this.spawnPools.map(pool => pool.map(color => color.toLowerCase())),
            goals: this.goals.map(goal => ({
                id: goal.id,
                count: goal.count
            })),
            movesCount: this.movesCount,
            rocketPreset: this.rocketPreset.toLowerCase(),
            dynamiteGoals: this.dynamiteGoals.map(goal => ({
                id: goal.id,
                count: goal.count
            })),
            cosmorocketGoals: this.cosmorocketGoals.map(goal => ({
                id: goal.id,
                count: goal.count
            })),
            difficulty: this.difficulty.toLowerCase(),
            movesShopStage: this.movesShopStage,
            specsState: this.specsState.map(tile => ({
                strength: tile.strength,
                row: tile.row,
                col: tile.col,
                strengthRed: tile.strengthRed,
                strengthBlue: tile.strengthBlue,
                strengthGreen: tile.strengthGreen,
                strengthYellow: tile.strengthYellow,
                strengthPurple: tile.strengthPurple,
                customParameter: tile.customParameter
            })),
            statusesState: this.statusesState.map(tile => ({
                row: tile.row,
                col: tile.col,
                customParameter: tile.customParameter
            })),
            tutorial: this.tutorial
        };

        return JSON.stringify(json);
    }
}


@ccclass('LevelProgressData')
export class LevelProgressData {
    @property
    levelStateJson = '';
}


@ccclass()
export class GameData extends Component {

    @property([LevelData])
    levels: LevelData[] = [];

    public static instance: GameData = null;

    onLoad() {
        GameData.instance = this;
    }

    start() {
        //this.loadLevelsFromDirectory("levels");

        //this.loadLevels();

        //this.tryLoadLevels();

        this.tryFetchVariables();

        gamepush.variables.on('fetch', () => this.tryLoadLevels());
        gamepush.variables.on('error:fetch', (error) => console.error(error));
    }


    tryFetchVariables() {
        try {
            gamepush.variables.fetch();
        }
        catch(error) {
            console.error('Error Game Push fetch variables:', error);

            gamepush.variables.fetch();
        }
    }
    
    tryLoadLevels() {
        console.log("Gamepush variables fetched. Loading levels...");
        try {
            this.loadLevelsFromGamePush();
        }
        catch(error) {
            console.error('Error Game Push:', error);

            this.tryLoadLevels();
        }
    }

    /*loadLevels() {
        this.waitForGamePush().then(() => {
            this.loadLevelsFromGamePush();
        }).catch((error) => {
            console.error('Error wait for Game Push variables:', error);

            this.loadLevels();
        });
    }
    
    waitForGamePush(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
                resolve();
            } else {
                const checkReady = () => {
                    if (gamepush.variables && gamepush.experiments) {
                        resolve();
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
    
                checkReady();
            }
        });
    }*/


    loadLevelsFromGamePush() {
        this.levels = [];

        let difficulty = "A";
        if (gamepush.experiments.has('LDT', 'B')) {
            difficulty = 'B';
        }
        
        this.loadLevelsFromURL(gamepush.variables.get("levels_" + difficulty));

        this.node.emit("experiment", difficulty);
    }


    loadLevelsFromURL(url: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            cc.loader.load({ url: url, type: 'txt' }, (err, file) => {
                if (err) {
                    console.error('Error loading file:', url, err);
                    reject(err);
                    return;
                }
    
                // Parse JSON string to extract LevelData objects
                try {
                    const jsonData = JSON.parse(file);
                    const levelDataArray: LevelData[] = [];
    
                    // Iterate over each LevelData object in the JSON data
                    for (const levelJson of jsonData.levels) {
                        const levelData = GameData.parseLevelData(JSON.stringify(levelJson));
                        levelDataArray.push(levelData);
                    }
    
                    // Set loaded levels
                    this.levels = levelDataArray;
    
                    // Emit events for each loaded level data
                    levelDataArray.forEach(levelData => {
                        this.node.emit("level_data", levelData);
                    });
    
                    // Set levels count and initialize statistics
                    UserData.instance.setLevelsCount(this.levels.length);
                    Statistics.instance.init(this.levels);
    
                    // Emit event indicating levels are loaded
                    this.node.emit("levels_loaded");
    
                    resolve();
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    reject(error);
                }
            });
        });
    }
    
    
    loadLevelsFromURLs(urls: string[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let loadedLevels: LevelData[] = [];
            let currentIndex = 0;
    
            const loadNextFile = () => {
                if (currentIndex >= urls.length) {
                    this.levels = loadedLevels;

                    UserData.instance.setLevelsCount(this.levels.length);
                    Statistics.instance.init(this.levels);

                    this.node.emit("levels_loaded");

                    resolve();
                    return;
                }
    
                const url = urls[currentIndex];
                cc.loader.load({ url: url, type: 'txt' }, (err, file) => {
                    if (err) {
                        console.error('Error loading file:', url, err);
                        reject(err);
                        return;
                    }
    
                    let levelData = GameData.parseLevelData(file);
                    loadedLevels.push(levelData);
    
                    this.node.emit("level_data", levelData);
    
                    currentIndex++; // Move to the next URL
                    loadNextFile(); // Load the next file
                });
            };
    
            // Start loading the first file
            loadNextFile();
        });
    }
    


    loadLevelsFromDirectory(directoryPath: string) {
        this.levels = [];

        cc.loader.loadResDir(directoryPath, cc.TextAsset, (err, assets) => {
            if (err) {
                console.error('Error loading directory:', err);
                return;
            }

            assets.sort((a: cc.TextAsset, b: cc.TextAsset) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
    
                const extractNumbers = (fileName: string): number[] => {
                    const numbers: number[] = [];
                    const regex = /\d+/g;
                    let match = regex.exec(fileName);
                    while (match) {
                        numbers.push(parseInt(match[0], 10));
                        match = regex.exec(fileName);
                    }
                    return numbers;
                };
    
                const aNumbers = extractNumbers(aName);
                const bNumbers = extractNumbers(bName);
    
                for (let i = 0; i < Math.min(aNumbers.length, bNumbers.length); i++) {
                    if (aNumbers[i] !== bNumbers[i]) {
                        return aNumbers[i] - bNumbers[i];
                    }
                }
    
                return aName.localeCompare(bName);
            });

            //console.log(assets.length);
    
            assets.forEach((asset: cc.TextAsset) => {
                const fileData = asset.text;
                const fileName = asset.name;

                //console.log(fileData);
    
                const levelData = GameData.parseLevelData(fileData);
                this.levels.push(levelData);
                //console.log('Level data loaded:', fileName);

                UserData.instance.setLevelsCount(this.levels.length);
                Statistics.instance.init(this.levels);

                this.node.emit("level_data", levelData);
            });

            this.node.emit("levels_loaded");
        });
    }


    static parseLevelData(jsonString: string): LevelData {
        const jsonData = JSON.parse(jsonString);
        return LevelData.fromJSON(JSON.stringify(jsonData));
    }


    static parseLevelsData(jsonString: string): LevelData[] {
        try {
            const jsonData = JSON.parse(jsonString);
            if (Array.isArray(jsonData.levels)) {
                return jsonData.levels.map((levelObj: any) => LevelData.fromJSON(JSON.stringify(levelObj)));
            } else {
                console.error('Invalid JSON format: levels property is not an array');
                return [];
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return [];
        }
    }
}


