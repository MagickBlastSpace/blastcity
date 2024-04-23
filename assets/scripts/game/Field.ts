import { _decorator, Component, Node, instantiate, Prefab, Vec2, Vec3 } from 'cc';
import { GameData, GoalData, LevelData, SpecialPrefabData, SpecialTileStateData } from '../data/GameData';
import { TileBase } from './TileBase';
import { Boosters } from './boosters/Boosters';
import { StartBonuses } from './boosters/StartBonuses';
import { ButlersGift } from './boosters/ButlersGift';
import { SaveData } from '../data/SaveData';
import { UserData } from '../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('Field')
export class Field extends Component {
    @property(Prefab)
    tilePrefab: Prefab = null;

    @property(Prefab)
    emptyPrefab: Prefab = null;

    @property(Prefab)
    bombPrefab: Prefab = null;
    @property(Prefab)
    rocketPrefab: Prefab = null;
    @property(Prefab)
    discoballPrefab: Prefab = null;

    @property([SpecialPrefabData])
    specialPrefabs: SpecialPrefabData[] = [];
    @property([SpecialPrefabData])
    statusPrefabs: SpecialPrefabData[] = [];

    @property(Node)
    level: Node = null;
    @property(Boosters)
    boosters: Boosters = null;
    @property(StartBonuses)
    startBonuses: StartBonuses = null;
    @property(ButlersGift)
    butlersGift: ButlersGift = null;

    @property
    numRows: number = 8;
    @property
    numCols: number = 8;

    private tileArray: Node[][] = [];
    private statusArray: Node[][] = [];

    private bonusPool: Node[] = [];

    private isClickAvailable: boolean = false;
    private isLevelComplete: boolean = false;
    private isBonusPoolActivated: boolean = false;
    private bonusIndex = 0;

    private availableColors: string[] = [];
    private startPool: string[] = [];
    private spawnPools: string[][] = [];

    private fallTime: number = 0.3;
    private swapTime: number = 0.15;

    private spawnTilesSchedule: Function = null;
    private isSpawnScheduled: boolean = false;

    private rocketPreset: string = "random";
    private dynamiteGoals: GoalData[] = [];
    private cosmorocketGoals: GoalData[] = [];

    private isSuperDiscoballMode: boolean = false;

    private savedVerticalRockets: Node[][] = [];
    private savedHorizontalRockets: Node[][] = [];

    private presetedNodes: Node[] = [];

    private levelCompletePoints: number = 0;


    start() {
        for (let row = 0; row < this.numRows; row++) {
            this.tileArray[row] = [];
            this.statusArray[row] = [];
            for (let col = 0; col < this.numCols; col++) {
                this.tileArray[row][col] = null;
                this.statusArray[row][col] = null;
            }
        }

        this.availableColors = ["blue", "red", "green", "yellow", "purple", "orange"];

        this.level.on("goal_complete_event", (goalId) => this.setGoalCompleteEvent(goalId));
        this.level.on("goal_possible_event", (goalId) => this.setGoalPossible(goalId));
        this.level.on("all_goals_complete_event", (movesRemain) => this.setLevelAsCompleted(movesRemain));
        this.level.on("extra", () => {
            this.scheduleRespawn(0.2, true);
        });

        this.boosters.node.on("extra_hit", (row, col, isBonusChain, delay) => {
            this.extraHit(row, col, isBonusChain, delay);
        });
        this.boosters.node.on("respawn", (timeToRespawn) => {
            this.scheduleRespawn(timeToRespawn, true);
        });
        this.boosters.node.on("shuffle", () => {
            if(this.isClickAvailable && !this.isLevelComplete) {
                this.shuffleTiles();
            }
        });

        this.isSuperDiscoballMode = false;

        SaveData.instance.node.on("level_progress_loaded", (level) => {
            this.spawnInitialBoard(level);
        });
    }


    spawnInitialBoard(level: LevelData) {
        if(level === null || level === undefined) {
            return;
        }

        this.isLevelComplete = false;
        
        if(level.startPool !== null && level.startPool !== undefined) {
            this.startPool = level.startPool;
        }
        
        if(this.startPool.length === 0) {
            this.startPool = ["blue", "red", "green", "yellow"];
        }

        this.resetSpawnPools();
        this.spawnPools = [];
        if(level.spawnPools) {
            if(level.spawnPools.length < this.numCols - 1) {
                this.resetSpawnPools();
            }
            else {
                this.spawnPools = level.spawnPools;
            }
        }
        else {
            for(let i = 0; i < this.spawnPools.length; i++) {
                if (!this.spawnPools[i]) {
                    this.spawnPools[i] = ["blue", "red", "green", "yellow"];
                }
                else {
                    if(this.spawnPools[i].length === 0) {
                        this.spawnPools[i] = ["blue", "red", "green", "yellow"];
                    }
                }
            }
        }

        this.rocketPreset = level.rocketPreset;
        if(this.rocketPreset !== "random" && this.rocketPreset !== "vertical" && this.rocketPreset !== "horizontal") {
            this.rocketPreset = "random";
        }

        this.dynamiteGoals = [];
        if(level.dynamiteGoals !== null && level.dynamiteGoals !== undefined) {
            for(let i = 0; i < level.dynamiteGoals.length; i++) {
                let newGoal = new GoalData();
                newGoal.id = level.dynamiteGoals[i].id;
                newGoal.count = level.dynamiteGoals[i].count;

                this.dynamiteGoals.push(newGoal);
            }
        }
        if(this.dynamiteGoals.length < 4) {
            this.setDefaultDynamiteGoals();
        }

        this.cosmorocketGoals = [];
        if(level.cosmorocketGoals !== null && level.cosmorocketGoals !== undefined) {
            for(let i = 0; i < level.cosmorocketGoals.length; i++) {
                let newGoal = new GoalData();
                newGoal.id = level.cosmorocketGoals[i].id;
                newGoal.count = level.cosmorocketGoals[i].count;

                this.cosmorocketGoals.push(newGoal);
            }
        }
        if(this.cosmorocketGoals.length < 5) {
            this.setDefaultCosmorocketGoals();
        }

        this.clearBoard();

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                this.spawnCommonTile(row, col, "start");
            }
        }

        if(level.emptyTiles) {
            for(let i = 0; i < level.emptyTiles.length; i++) {
                this.spawnEmptyTile(level.emptyTiles[i].y, level.emptyTiles[i].x);
            }
        }
        
        if(level.specialTiles) {
            for(let i = 0; i < level.specialTiles.length; i++) {
                if(this.availableColors.includes(level.specialTiles[i].id)) {
                    this.presetedNodes.push(this.spawnCommonTile(level.specialTiles[i].row, level.specialTiles[i].col, level.specialTiles[i].id));
                }
                else if(level.specialTiles[i].id === "rocket_horizontal" || level.specialTiles[i].id === "rocket_vertical") {
                    this.spawnRocket(level.specialTiles[i].row, level.specialTiles[i].col, level.specialTiles[i].id);
                }
                else if(level.specialTiles[i].id === "bomb") {
                    this.spawnBomb(level.specialTiles[i].row, level.specialTiles[i].col);
                }
                else if(level.specialTiles[i].id === "rocket") {
                    this.spawnRandomRocket(level.specialTiles[i].row, level.specialTiles[i].col);
                }
                else if(level.specialTiles[i].id === "discoball" || level.specialTiles[i].id.split("_")[0] === "discoball" || level.specialTiles[i].id === "super" || level.specialTiles[i].id === "multi") {
                    this.spawnDiscoball(level.specialTiles[i].row, level.specialTiles[i].col);
                }
                else {
                    this.spawnSpecialTile(level.specialTiles[i].row, level.specialTiles[i].col, level.specialTiles[i].id);
                }
            }
        }
        
        if(level.statuses) {
            for(let i = 0; i < level.statuses.length; i++) {
                this.spawnStatus(level.statuses[i].row, level.statuses[i].col, level.statuses[i].id);
            }
        }
        
        this.subscribeAll(level.goals);

        if(level.destroyedOnStart) {
            for(let i = 0; i < level.destroyedOnStart.length; i++) {
                let row = level.destroyedOnStart[i].y;
                let col = level.destroyedOnStart[i].x;
                if(this.tileArray[row][col]) {
                    let tileComp = this.tileArray[row][col].getComponent("TileBase");
                    if(tileComp.isCommonTile()) {
                        this.destroyTile(row, col, true);
                    }
                }
            }
        }

        this.spawnNewTiles(true, false);

        if(level.specsState) {
            this.scheduleOnce(() => {
                this.restoreSpecTilesState(level.specsState);
            }, this.fallTime);
        }

        if(level.statusesState) {
            this.scheduleOnce(() => {
                this.restoreStatusesState(level.statusesState);
            }, this.fallTime);
        }
        
        this.node.emit("level_init", level);
        this.node.emit("centrate", this.tileArray);

        if(level.tutorial) {
            this.node.emit("tutorial", level.tutorial);
        }
    }

    restoreSpecTilesState(specs: SpecialTileStateData[]) {
        for(let i = 0; i < specs.length; i++) {
            let tile = this.tileArray[specs[i].row][specs[i].col];
            if(tile) {
                let tileComp = tile.getComponent("TileBase");
                if(tileComp.isSpecialTile()) {
                    tileComp.setStrength(specs[i].strength);

                    tileComp.setStrengthRed(specs[i].strengthRed);
                    tileComp.setStrengthBlue(specs[i].strengthBlue);
                    tileComp.setStrengthGreen(specs[i].strengthGreen);
                    tileComp.setStrengthYellow(specs[i].strengthYellow);
                    tileComp.setStrengthPurple(specs[i].strengthPurple);

                    tileComp.setCustomParameter(specs[i].customParameter);
                }
            }
        }
    }

    restoreStatusesState(statuses: SpecialTileStateData[]) {
        for(let i = 0; i < statuses.length; i++) {
            let status = this.statusArray[statuses[i].row][statuses[i].col];
            if(status) {
                let statusComp = status.getComponent("StatusBase");
                statusComp.setCustomParameter(statuses[i].customParameter);
            }
        }
    }

    resetSpawnPools() {
        for (let col = 0; col < this.numCols; col++) {
            this.spawnPools[col] = ["blue", "red", "green", "yellow"];
        }
    }

    setDefaultDynamiteGoals() {
        this.dynamiteGoals = [];
        for(let i = 0; i < 4; i++) {
            let goal = new GoalData();
            goal.id = "common";
            goal.count = 0;
            this.dynamiteGoals.push(goal);
        }
    }

    setDefaultCosmorocketGoals() {
        this.cosmorocketGoals = [];
        let cosmoTypes = ["red", "blue", "green", "yellow", "purple"];
        for(let i = 0; i < 5; i++) {
            let goal = new GoalData();
            goal.id = cosmoTypes[i];
            goal.count = 0;
            this.cosmorocketGoals.push(goal);
        }
    }

    clearBoard() {
        this.bonusPool = [];

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                let tile = this.tileArray[row][col];
                if(tile !== null) {
                    this.destroyTile(row, col, true);
                }

                let status = this.statusArray[row][col];
                if(status !== null) {
                    this.destroyStatus(row, col, true);
                }
            }
        }

        this.presetedNodes = [];
    }

    subscribeAll(goals: GoalData[]) {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {

                let tile = this.tileArray[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");
                    tileComp.subscribeOnFieldEvents(this.node);
                    tileComp.subscribeOnGoals(goals);
                }

                let status = this.statusArray[row][col];
                if(status !== null) {
                    let statusComp = status.getComponent("StatusBase");
                    statusComp.subscribeOnFieldEvents(this.node);
                }
            }
        }
    }


    spawnCommonTile(row: number, col: number, tType: string): Node {
        this.destroyTile(row, col, true);
        const tileNode = instantiate(this.tilePrefab);
        const tileComponent = tileNode.getComponent("Tile");
        const tileTypeIndex = tType === "start" ? Math.floor(Math.random() * this.startPool.length).toString() : Math.floor(Math.random() * this.spawnPools[col].length).toString();
        let tileType = tType === "random" ? this.spawnPools[col][tileTypeIndex] : tType;
        tileType = tType === "start" ? this.startPool[tileTypeIndex] : tileType;

        if(!this.availableColors.includes(tileType)) {
            if(tileType === "rocket") {
                this.spawnRandomRocket(row, col);
            }
            else if(tileType === "rocket_horizontal" || tileType === "rocket_vertical") {
                this.spawnRocket(row, col, tileType);
            }
            else if(tileType === "bomb") {
                this.spawnBomb(row, col);
            }
            else if(tileType === "discoball" || tileType.split("_")[0] === "discoball") {
                this.spawnDiscoball(row, col);
            }
            else {
                this.spawnSpecialTile(row, col, tileType);

                let goalType = tileType;
                if(this.isColoredType(tileType)) {
                    goalType = "colored_" + tileType.split("_")[0];
                }

                this.node.emit("goal_check", goalType, this.countAllTilesByType(tileType));
            }
            return;
        }

        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnBomb(row: number, col: number): Node {
        this.destroyTile(row, col, false);
        const tileNode = instantiate(this.bombPrefab);
        const tileComponent = tileNode.getComponent("Bomb");
        let spawnedTile = this.initTile(tileComponent, row, col, "bomb");
        return spawnedTile;
    }

    spawnRocket(row: number, col: number, tileType: string): Node {
        this.destroyTile(row, col, false);
        const tileNode = instantiate(this.rocketPrefab);
        const tileComponent = tileNode.getComponent("Rocket");
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnRandomRocket(row: number, col: number) {
        if(this.rocketPreset === "random") {
            const tileType = Math.floor(Math.random() * 2);
            if(tileType === 0) {
                this.spawnRocket(row, col, "rocket_vertical");
            }
            else {
                this.spawnRocket(row, col, "rocket_horizontal");
            }
        }
        else {
            this.spawnRocket(row, col, "rocket_" + this.rocketPreset);
        }
    }

    spawnDiscoball(row: number, col: number): Node {
        this.destroyTile(row, col, true);
        const tileNode = instantiate(this.discoballPrefab);
        const tileComponent = tileNode.getComponent("Discoball");
        let tileType = this.isSuperDiscoballMode ? "super" : "multi";
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnEmptyTile(row: number, col: number): Node {
        this.destroyTile(row, col, true);
        const tileNode = instantiate(this.emptyPrefab);
        const tileComponent = tileNode.getComponent("EmptyTile");
        let spawnedTile = this.initTile(tileComponent, row, col, "empty");
        return spawnedTile;
    }

    spawnSpecialTile(row: number, col: number, tileId: string): Node {
        if(tileId.split("_")[1] === "random") {
            let availableColors = this.getAvailableColors();
            let colorIndex = Math.floor(Math.random() * availableColors.length);
            let color = availableColors[colorIndex];

            tileId = tileId.split("_")[0] + "_" + color;
        }

        const prefab = this.specialPrefabs.find(p => p.id === tileId)?.prefab;
        if(prefab === null) {
            return;
        }

        this.destroyTile(row, col, true);
        const tileNode = instantiate(prefab);
        const tileComponent = tileNode.getComponent("SpecTileBase");
        let spawnedTile = this.initTile(tileComponent, row, col, tileId);
        return spawnedTile;
    }

    spawnStatus(row: number, col: number, statusId: string): Node {
        const prefab = this.statusPrefabs.find(p => p.id === statusId)?.prefab;
        if(prefab === null) {
            return;
        }

        this.destroyStatus(row, col, true);
        const statusNode = instantiate(prefab);
        const statusComponent = statusNode.getComponent("StatusBase");
        let spawnedStatus = this.initStatus(statusComponent, row, col, statusId);
        return spawnedStatus;
    }

    spawnBonusTile(row: number, col: number, bonusId: string, isBonusPool: boolean) {
        let spawnedTile = null;
        if(bonusId === "bomb") {
            spawnedTile = this.spawnBomb(row, col);
        }
        else if(bonusId === "rocket_horizontal" || bonusId === "rocket_vertical") {
            spawnedTile = this.rocketPreset === "random" ? this.spawnRocket(row, col, bonusId) : this.spawnRocket(row, col, "rocket_" + this.rocketPreset);
        }
        else if(this.availableColors.includes(bonusId) || bonusId === "multi" || bonusId === "super") {
            spawnedTile = this.spawnDiscoball(row, col);
        }

        if(!isBonusPool) {
            return;
        }

        this.bonusPool.push(spawnedTile);
    }


    initTile(tileComponent: any, row: number, col: number, tileType: string): Node {
        tileComponent.init(row, col, tileType);

        let isDoubleWidth = tileComponent.isSpecialTile() ? tileComponent.isDoubleWidth() : false;
        let isDoubleHeight = tileComponent.isSpecialTile() ? tileComponent.isDoubleHeight() : false;

        let isTripleWidth = tileComponent.isSpecialTile() ? tileComponent.isTripleWidth() : false;
        let isTripleHeight = tileComponent.isSpecialTile() ? tileComponent.isTripleHeight() : false;

        const tileNode = tileComponent.node;

        tileNode.on("click", (tile) => {
            this.onTileClick(tile);
        });
        tileNode.on("get_matches", (tile) => {
            this.findAndDestroyMatches(tile, true);
        });
        tileNode.on("change", (row, col, tileId) => {
            this.spawnSpecialTile(row, col, tileId);
        });
        tileNode.on("change_bonus", (row, col, bonusId, isBonusPool) => {
            if(this.checkPositionForBonus(row, col)) {
                this.spawnBonusTile(row, col, bonusId, isBonusPool);
            }
        });
        tileNode.on("activate_bonus_pool", () => {
            this.activateBonusPool();
        });
        tileNode.on("respawn", (timeToRespawn) => {
            this.scheduleRespawn(timeToRespawn, true);
        });
        tileNode.on("damage_all", (tileId) => {
            this.setAllDamagedByType(tileId);
        });
        tileNode.on("status", (statusId) => {
            let cleanTiles = this.getAllCleanTilesPositions();
            if(cleanTiles.length > 0) {
                const tileIndex = Math.floor(Math.random() * cleanTiles.length);
                this.spawnStatus(cleanTiles[tileIndex].x, cleanTiles[tileIndex].y, statusId);

                this.node.emit("spawn", statusId);
            }
        });
        tileNode.on("status_static", (row, col, statusId) => {
            if(this.checkPositionForStatus(row, col)) {
                this.spawnStatus(row, col, statusId);
                this.node.emit("goal_inc", statusId);
            }
        });
        tileNode.on("special", (tileId) => {
            let cleanTiles = this.getAllCommonTilesPositions();
            if(cleanTiles.length > 0) {
                const tileIndex = Math.floor(Math.random() * cleanTiles.length);
                this.spawnSpecialTile(cleanTiles[tileIndex].x, cleanTiles[tileIndex].y, tileId);

                this.node.emit("spawn", tileId);
            }
        });
        tileNode.on("swap", (pos_1, pos_2) => {
            this.swapTiles(pos_1, pos_2);
        });
        tileNode.on("destroy_random_tile", () => {
            this.destroyRandomTile();
        });
        tileNode.on("extra_hit", (row, col, isBonusChain, delay) => {
            this.extraHit(row, col, isBonusChain, delay);
        });
        tileNode.on("random_extra_hit", (except, except2) => {
            this.randomExtraHit(except, except2);
        });
        tileNode.on("destroy_tile", (row, col) => {
            this.destroyTile(row, col, false);
        });
        tileNode.on("goal", (goalType) => {
            this.node.emit("destroy", goalType);

            if(goalType === "magic_hat" || goalType === "birds") {
                this.node.emit("spawn", goalType);
            }
        });
        tileNode.on("goal_inc", (goalType) => {
            this.node.emit("goal_inc", goalType);
        });
        tileNode.on("clear", () => {
            this.clearExtra();
        });

        this.tileArray[row][col] = tileNode;
        if(isDoubleWidth || isTripleWidth) {
            this.destroyTile(row, col + 1, false);
            this.tileArray[row][col + 1] = tileNode;
        }
        if(isDoubleHeight || isTripleHeight) {
            this.destroyTile(row + 1, col, false);
            this.tileArray[row + 1][col] = tileNode;
        }
        if( (isDoubleWidth && isDoubleHeight) || (isTripleWidth && isTripleHeight)) {
            this.destroyTile(row + 1, col + 1, false);
            this.tileArray[row + 1][col + 1] = tileNode;
        }

        if(isTripleWidth) {
            this.destroyTile(row, col + 2, false);
            this.tileArray[row][col + 2] = tileNode;
        }
        if(isTripleHeight) {
            this.destroyTile(row + 2, col, false);
            this.tileArray[row + 2][col] = tileNode;
        }
        if(isTripleWidth && isTripleHeight) {
            this.destroyTile(row + 2, col + 2, false);
            this.tileArray[row + 2][col + 2] = tileNode;
            this.destroyTile(row + 2, col + 1, false);
            this.tileArray[row + 2][col + 1] = tileNode;
            this.destroyTile(row + 1, col + 2, false);
            this.tileArray[row + 1][col + 2] = tileNode;
        }

        let isStatusNode = this.statusArray[row][col] !== null;
        this.node.emit("init_tile", tileNode, isStatusNode, tileType);

        return tileNode;
    }

    initStatus(statusComponent: any, row: number, col: number, statusType: string): Node {
        statusComponent.init(row, col, statusType);

        const statusNode = statusComponent.node;

        statusNode.on("change", (row, col, statusId) => {
            this.spawnStatus(row, col, statusId);
        });
        statusNode.on("goal", (goalType) => {
            this.node.emit("destroy", goalType);
        });
        statusNode.on("respawn", (timeToRespawn) => {
            this.scheduleRespawn(timeToRespawn, false);
        });
        statusNode.on("destroy_status", (row, col) => {
            this.destroyStatus(row, col, false);
        });

        this.statusArray[row][col] = statusNode;

        this.node.emit("init_status", statusNode, statusType);

        return statusNode;
    }

    destroyTile(row: number, col: number, isClear: boolean) {
        const tile = this.tileArray[row][col];
        if(tile !== null) {
            let tileComponent = tile.getComponent("TileBase");
            if(tileComponent.isEmptyTile() && !isClear) {
                return;
            }

            let isDoubleWidth = tileComponent.isSpecialTile() ? tileComponent.isDoubleWidth() : false;
            let isDoubleHeight = tileComponent.isSpecialTile() ? tileComponent.isDoubleHeight() : false;

            let isTripleWidth = tileComponent.isSpecialTile() ? tileComponent.isTripleWidth() : false;
            let isTripleHeight = tileComponent.isSpecialTile() ? tileComponent.isTripleHeight() : false;

            if(isClear) {
                tileComponent.destroyClear();
            }
            else {
                tileComponent.destroyTile(0);
            }

            this.tileArray[row][col] = null;

            if(isDoubleWidth || isTripleWidth) {
                this.tileArray[row][col + 1] = null;
            }
            if(isDoubleHeight || isTripleHeight) {
                this.tileArray[row + 1][col] = null;
            }
            if( (isDoubleWidth && isDoubleHeight) || (isTripleWidth && isTripleHeight)) {
                this.tileArray[row + 1][col + 1] = null;
            }
    
            if(isTripleWidth) {
                this.tileArray[row][col + 2] = null;
            }
            if(isTripleHeight) {
                this.tileArray[row + 2][col] = null;
            }
            if(isTripleWidth && isTripleHeight) {
                this.tileArray[row + 2][col + 2] = null;
                this.tileArray[row + 2][col + 1] = null;
                this.tileArray[row + 1][col + 2] = null;
            }
        }
    }

    destroyRandomTile() {
        let tiles = [];

        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                const tile = this.tileArray[i][j];
                if(tile !== null) {
                    const tileComp = tile.getComponent("TileBase");
                    if(tileComp.isCommonTile()) {
                        tiles.push(tileComp);
                    }
                }
            }
        }

        if(tiles.length === 0) {
            return;
        }

        let randomIndex = Math.floor(Math.random() * tiles.length);
        this.destroyTile(tiles[randomIndex].getRow(), tiles[randomIndex].getCol());
    }

    destroyStatus(row: number, col: number, isClear: boolean) {
        const status = this.statusArray[row][col];
        if(status !== null) {
            let statusComponent = status.getComponent("StatusBase");
            if(isClear) {
                statusComponent.destroyClear();
            }
            else {
                statusComponent.destroyStatus();
            }
            this.statusArray[row][col] = null;
        }
    }

    getAllCleanTilesPositions(): Vec2[] {
        let tiles = [];

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                if(this.checkPositionForStatus(row, col)) {
                    tiles.push(new Vec2(row, col));
                }
            }
        }

        return tiles;
    }

    getAllCommonTilesPositions(): Vec2[] {
        let tiles = [];

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                if(this.checkPositionForStatus(row, col)) {
                    let tile = this.tileArray[row][col];
                    if(tile === null) {
                        tiles.push(new Vec2(row, col));
                    }
                    else {
                        const tileComp = tile.getComponent("TileBase");
                        if(tileComp.isCommonTile()) {
                            tiles.push(new Vec2(row, col));
                        }
                    }
                }
            }
        }

        return tiles;
    }

    getAllBonusTilesPositions(): Vec2[] {
        let tiles = [];

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                if(this.checkPositionForStatus(row, col)) {
                    let tile = this.tileArray[row][col];
                    if(tile !== null) {
                        const tileComp = tile.getComponent("TileBase");
                        if(tileComp.isBonusTile()) {
                            tiles.push(new Vec2(row, col));
                        }
                    }
                }
            }
        }

        return tiles;
    }

    getUnpresetedCommonTilesPositions(): Vec2[] {
        let commonTiles = this.getAllCommonTilesPositions();
        let unpresetedCommonTiles = [];

        for(let i = 0; i < commonTiles.length; i++) {
            if(!this.presetedNodes.includes(this.tileArray[commonTiles[i].x][commonTiles[i].y])) {
                if(this.tileArray[commonTiles[i].x][commonTiles[i].y] !== null) {
                    unpresetedCommonTiles.push(commonTiles[i]);
                }
            }
        }

        return unpresetedCommonTiles;
    }


    getAllTilesPositionsByType(tileType: string): Vec2[] {
        let tiles = [];

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                if(this.checkPositionForStatus(row, col)) {
                    let tile = this.tileArray[row][col];
                    if(tile !== null) {
                        const tileComp = tile.getComponent("TileBase");
                        if(tileComp.isCommonTile() && tileComp.getTileType() === tileType) {
                            tiles.push(new Vec2(row, col));
                        }
                    }
                }
            }
        }

        return tiles;
    }


    activateBonusPool() {
        if(this.isBonusPoolActivated) {
            return;
        }

        if (this.bonusPool.length > 0) {
            this.bonusIndex = 0;
            this.isBonusPoolActivated = true;

            this.spawnNewTiles(false, true);
        }
    }

    activateBonusByIndex(index: number, byOrder: boolean) {
        if(index >= this.bonusPool.length) {
            this.scheduleRespawn(0, false);
            return;
        }

        const bonusTile = this.bonusPool[index];

        if(byOrder) {
            this.bonusIndex = this.bonusIndex + 1;
        }
        
        let isBonusDestroyed = this.findAndDestroyMatches(bonusTile, false);

        
        if(!byOrder) {
            return;
        }

        if(isBonusDestroyed) {
            return;
        }

        this.activateBonusByIndex(this.bonusIndex, true);
    }


    extraHit(row: number, col: number, isBonusChain: boolean, delay: number) {
        if(row > this.numRows - 1 || col > this.numCols - 1 || row < 0 || col < 0) {
            return;
        }

        let tile = this.tileArray[row][col];

        if(tile !== null) {
            if(isBonusChain) {
                const tileComp = tile.getComponent("TileBase");
                if(tileComp.isBonusTile()) {
                    if(this.bonusPool.includes(tile)) {
                        this.scheduleOnce(() => {
                            if(!tileComp || !tile) {
                                return;
                            }

                            if(tileComp.isTileActivated()) {
                                return;
                            }

                            if(tileComp.getTileType() === "multi" || tileComp.getTileType() === "super") {
                                let matches = tileComp.getMatches(this.tileArray, this.statusArray, true);
        
                                if(matches !== null && matches !== undefined) {
                                    matches.forEach(matchedTile => {
                                        this.giveDamage(matchedTile, tileComp.getTileType(), false, 0);
                                    })
                                }

                                return;
                            }

                            this.clearExtra();
                            tileComp.getMatches(this.tileArray, this.statusArray, true);
                        }, this.fallTime);
                    }
                    else {
                        this.bonusPool.push(tile);
                        if(!this.isBonusPoolActivated) {
                            this.scheduleOnce(() => {
                                this.bonusPool.push(tile);
                                this.activateBonusPool();
                            }, this.fallTime);
                        }
                        else {
                            this.scheduleOnce(() => {
                                if(!tileComp || !tile) {
                                    return;
                                }

                                if(tileComp.isTileActivated()) {
                                    return;
                                }

                                if(tileComp.getTileType() === "multi" || tileComp.getTileType() === "super") {
                                    let matches = tileComp.getMatches(this.tileArray, this.statusArray, true);
            
                                    if(matches !== null && matches !== undefined) {
                                        matches.forEach(matchedTile => {
                                            this.giveDamage(matchedTile, tileComp.getTileType(), false, 0);
                                        })
                                    }
    
                                    return;
                                }

                                this.clearExtra();
                                tileComp.getMatches(this.tileArray, this.statusArray, true);
                            }, this.fallTime);
                        }
                    }
                    return;
                }
            }

            this.giveDamage(tile, "extra_hit", true, delay);
        }
        else {
            this.giveStatusDamage(row, col, false);
        }
    }

    randomExtraHit(except: string, except2: string) {
        let tiles = [];
        let specTiles = [];

        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                const tile = this.tileArray[i][j];
                if(tile !== null) {
                    const tileComp = tile.getComponent("TileBase");
                    if(tileComp.isCommonTile()) {
                        tiles.push(tile);
                    }
                    else if(tileComp.isSpecialTile() && tileComp.getTileType() !== except && tileComp.getTileType() !== except2) {
                        if(!tileComp.isTileDamaged()) {
                            specTiles.push(tile);
                        }
                    }
                }
            }
        }

        if(tiles.length === 0 && specTiles.length === 0) {
            return;
        }

        if(specTiles.length > 0) {
            let randomIndex = Math.floor(Math.random() * specTiles.length);
            this.giveDamage(specTiles[randomIndex], "extra_hit", true, 0);
        }
        else {
            let randomIndex = Math.floor(Math.random() * tiles.length);
            this.giveDamage(tiles[randomIndex], "extra_hit", true, 0);
        }
    }

    checkPositionForStatus(row: number, col: number): boolean {
        if(row < this.numRows && row >= 0 && col < this.numCols && col >= 0) {
            let tile = this.tileArray[row][col];
            let status = this.statusArray[row][col];

            if(status === null) {
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");
                    if(!tileComp.isEmptyTile() && !tileComp.isSpecialTile()) {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        }

        return false;
    }

    checkPositionForBonus(row: number, col: number): boolean {
        if(row < this.numRows && row >= 0 && col < this.numCols && col >= 0) {
            let tile = this.tileArray[row][col];
            let status = this.statusArray[row][col];

            if(tile !== null) {
                if(status !== null && status !== undefined) {
                    let statusComp = status.getComponent("StatusBase");
                    if(statusComp.isBlockingInteraction()) {
                        return false;
                    }
                }

                let tileComp = tile.getComponent("TileBase");
                if(!tileComp.isEmptyTile() && !tileComp.isSpecialTile()) {
                    return true;
                }
            }
            else {
                return true;
            }
        }

        return false;
    }


    findAndDestroyMatches(tile: Node, isRespawn: boolean): boolean {
        if(!tile) {
            return false;
        }

        let choosenTile = null;
        try {
            choosenTile = tile.getComponent("TileBase");
        } catch (error) {
            return false;
        }

        this.clearExtra();

        const choosenRow = choosenTile.getRow();
        const choosenCol = choosenTile.getCol();
        const choosenType = choosenTile.getTileType();
        const isCommon = choosenTile.isCommonTile();
        const isBonus = choosenTile.isBonusTile();
        let potentialBonus = "";
        if(isCommon) {
            potentialBonus = choosenTile.getPotentialBonus();
        }

        if(isBonus) {
            if(choosenTile.isTileActivated()) {
                return false;
            }
        }
        
        let isBlockingCombo = !isRespawn || (this.isSuperDiscoballMode && choosenType === "multi");
        let matches = choosenTile.getMatches(this.tileArray, this.statusArray, isBlockingCombo);
        let isComboBonus = this.isComboBonus(choosenTile);

        if(isComboBonus && (choosenType === "multi" || choosenType === "super")) {
            this.bonusPool.push(tile);
        }

        this.isClickAvailable = !isComboBonus;
        
        if(matches.length >= 2 || isBonus) {
            matches.forEach(matchedTile => {
                this.giveDamage(matchedTile, choosenType, isBonus, 0);
            })
        }
        else {
            return false;
        }

        if(isCommon) {
            if(matches.length >= 9) {
                this.spawnDiscoball(choosenRow, choosenCol);
            }
            else if(matches.length >= 7) {
                this.spawnBomb(choosenRow, choosenCol);
            }
            else if(matches.length >= 5) {
                this.spawnRocket(choosenRow, choosenCol, potentialBonus);
            }
        }

        if(matches.length > 0 || isBonus) {
            if(isComboBonus && isRespawn) {
                isRespawn = false;
            }
            this.spawnNewTiles(isRespawn, false);
        }

        return true;
    }

    isComboBonus(tile: TileBase): boolean {
        if(tile.isBonusTile()) {
            if(tile.getTileType() === "super" || tile.getComboName() === "super") {
                return true;
            }
            else if(tile.getTileType() === "bomb" || tile.getTileType() === "rocket_vertical" || tile.getTileType() === "rocket_horizontal") {
                if(tile.getComboName() === "multi") {
                    return true;
                }
            }
            else if(tile.getTileType() === "multi") {
                if(tile.getComboName() === "bomb" || tile.getComboName() === "rocket_vertical" || tile.getComboName() === "rocket_horizontal") {
                    return true;
                }
            }
        }
        return false;
    }

    giveDamage(tile: Node, choosenType: string, isBonus: boolean, destroyDelay: number) {
        if(tile !== null && tile !== undefined) {
            let tileComponent = tile.getComponent("TileBase");
            if(tileComponent.isEmptyTile()) {
                return;
            }

            let isDestroyAvailable = this.isDestroyAvailable(tileComponent.getRow(), tileComponent.getCol());
            if( (this.availableColors.includes(choosenType) || choosenType === "multi" || choosenType === "super") && isDestroyAvailable) {
                tileComponent.giveDamage(this.tileArray, this.statusArray);
            }

            if(isDestroyAvailable && !tileComponent.isSpecialTile()) {
                this.tileArray[tileComponent.getRow()][tileComponent.getCol()] = null;
                tileComponent.destroyTile(destroyDelay);
            }

            if(isBonus && choosenType !== "multi" && choosenType !== "super") {
                let isSpec = tileComponent.isSpecialTile();
                if(isSpec && isDestroyAvailable) {
                    tileComponent.getDamage("bonus");
                }

                this.giveStatusDamage(tileComponent.getRow(), tileComponent.getCol(), isSpec);

                if(tileComponent.isBonusTile()) {
                    if(tileComponent.isTileActivated()) {
                        this.tileArray[tileComponent.getRow()][tileComponent.getCol()] = null;
                        tileComponent.destroyTile(destroyDelay);
                    }
                }
            }
        }
    }

    isDestroyAvailable(row: number, col: number): boolean {
        let status = this.statusArray[row][col];
        if(status === null) {
            return true;
        }

        const statusComponent = status.getComponent("StatusBase");

        return !statusComponent.isBlockingDestroyTile();
    }

    giveStatusDamage(row: number, col: number, isSpec: boolean) {
        if(this.statusArray[row][col] === null) {
            return;
        }

        const statusComp = this.statusArray[row][col].getComponent("StatusBase");

        let isBlockInteraction = statusComp.isBlockingInteraction();

        if(isSpec && !isBlockInteraction) {
            return;
        }

        statusComp.getDamage();
    }


    spawnNewTiles(isRespawn: boolean, isBlockingInactionEffect: boolean) {
        this.checkStatusesForDestroy();
        this.checkSpecTilesForDestroy();
        this.checkSpecTilesPreActionEffect();
        this.fallTiles();

        if (this.checkSpecTilesForDestroy()) {
            this.spawnNewTiles(isRespawn, isBlockingInactionEffect);
            return;
        }

        this.node.emit("refresh", this.tileArray, this.statusArray);

        for (let col = 0; col < this.numCols; col++) {
            let shouldSpawnNewTile = true;

            for (let row = this.numRows - 1; row >= 0; row--) {
                const tile = this.tileArray[row][col];
                if (tile !== null) {
                    const tileComponent = tile.getComponent("TileBase");

                    if(tileComponent.getTileType() === "") {
                        this.spawnCommonTile(row, col, "random");
                        break;
                    }

                    if (!tileComponent.isTileShifts() || tileComponent.getRow() !== row || !this.isFallMovementAvailable(tileComponent.getRow(), tileComponent.getCol()) || this.bonusPool.includes(tile)) {
                        shouldSpawnNewTile = false;
                        break;
                    }
                }
                if (tile === null && shouldSpawnNewTile) {
                    this.spawnCommonTile(row, col, "random");
                }
            }
        }

        this.tryToSpawnStartBonuses();
        this.tryToSpawnButlerBonuses();

        this.scheduleOnce(() => {

            //buggy
            for (let col = 0; col < this.numCols; col++) {
                for (let row = 0; row < this.numRows; row++) {
                    const tile = this.tileArray[row][col];
                    if (tile !== null) {
                        const tileComponent = tile.getComponent("TileBase");

                        if(tileComponent.getTileType() === "") {
                            this.spawnCommonTile(row, col, "random");
                            break;
                        }
                    }
                }
            }

            if(this.isBonusPoolActivated) {
                this.activateBonusByIndex(this.bonusIndex, true);
                return;
            }
            
            if(!isRespawn || this.isBonusPoolActivated || this.bonusPool > 0) {
                return;
            }

            this.checkSpecTilesInActionEffect(isBlockingInactionEffect);
            
            this.checkForPotentialBonuses();

            SaveData.instance.saveLevelProgressData();

        }, this.fallTime);
    }

    scheduleRespawn(timeToRespawn: number, isBlockingInactionEffect: boolean) {
        if(this.isSpawnScheduled) {
            return;
        }

        this.isClickAvailable = false;

        this.spawnTilesSchedule = () => {
            this.bonusPool = [];
            this.isBonusPoolActivated = false;
            this.spawnNewTiles(true, isBlockingInactionEffect);
            this.isSpawnScheduled = false;
        };
        this.scheduleOnce(this.spawnTilesSchedule, timeToRespawn);

        this.isSpawnScheduled = true;
    }
    

    fallTiles() {
        for (let col = 0; col < this.numCols; col++) {
            let emptySpaces = 0;
            let holes = 0;
    
            for (let row = 0; row < this.numRows; row++) {
                const tile = this.tileArray[row][col];
    
                if (tile === null) {
                    emptySpaces++;
                } else {
                    let tileComponent = tile.getComponent("TileBase");

                    if(!tileComponent.isTileShifts() || tileComponent.getRow() !== row || !this.isFallMovementAvailable(tileComponent.getRow(), tileComponent.getCol()) || this.bonusPool.includes(tile)) {
                        emptySpaces = 0;
                        holes = 0;
                    }
                    else if (tileComponent.isEmptyTile()) {
                        if (!tileComponent.isBorder(this.tileArray)) {
                            holes++;
                        }
                    }
                    else if (emptySpaces > 0) {
                        let newRow = row - emptySpaces - holes;
    
                        let balance = 0;
                        while (holes >= 0 && newRow < row - 1 && !tileComponent.canFall(this.tileArray, newRow)) {
                            holes--;
                            newRow = row - emptySpaces - holes + balance;
                            if(holes <= 0) {
                                balance++;
                            }
                        }
    
                        if (tileComponent.canFall(this.tileArray, newRow)) {
                            tileComponent.setRow(newRow);

                            let isDoubleWidth = tileComponent.isSpecialTile() ? tileComponent.isDoubleWidth() : false;
                            let isDoubleHeight = tileComponent.isSpecialTile() ? tileComponent.isDoubleHeight() : false;

                            this.tileArray[newRow][col] = tile;
                            this.tileArray[row][col] = null;

                            if(isDoubleWidth) {
                                this.tileArray[row][tileComponent.getCol()] = null;
                                this.tileArray[row][tileComponent.getCol() + 1] = null;
                                this.tileArray[newRow][tileComponent.getCol()] = tile;
                                this.tileArray[newRow][tileComponent.getCol() + 1] = tile;
                            }
                            if(isDoubleHeight) {
                                this.tileArray[row + 1][tileComponent.getCol()] = null;
                                this.tileArray[newRow + 1][tileComponent.getCol()] = tile;
                            }
                            if(isDoubleWidth && isDoubleHeight) {
                                this.tileArray[row + 1][tileComponent.getCol() + 1] = null;
                                this.tileArray[newRow + 1][tileComponent.getCol() + 1] = tile;
                            }

                            if(isDoubleWidth) {
                                this.fallTiles();
                                return;
                            }
                        }
                        else {
                            emptySpaces = 0;
                            holes = 0;
                        }
                    }
                }
            }
        }
    }


    isFallMovementAvailable(row: number, col: number): boolean {
        let status = this.statusArray[row][col];
        if(status === null) {
            return true;
        }

        const statusComponent = status.getComponent("StatusBase");

        return !statusComponent.isBlockingMovement();
    }


    checkSpecTilesForDestroy(): boolean {
        let isDestroyed = false;
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = null;
                    try {
                        tileComponent = tile.getComponent("TileBase");
                    } catch (error) {
                        this.tileArray[i][j] = null;
                        continue;
                    }

                    if(tileComponent.isSpecialTile()) {
                        if(!tileComponent.isGroupedTile()) {
                            if(tileComponent.isReadyToDestroy()) {
                                this.tileArray[tileComponent.getRow()][tileComponent.getCol()] = null;

                                if(tileComponent.isDoubleWidth() || tileComponent.isTripleWidth()) {
                                    this.tileArray[tileComponent.getRow()][tileComponent.getCol() + 1] = null;
                                }
                                if(tileComponent.isDoubleHeight() || tileComponent.isTripleHeight()) {
                                    this.tileArray[tileComponent.getRow() + 1][tileComponent.getCol()] = null;
                                }
                                if((tileComponent.isDoubleWidth() && tileComponent.isDoubleHeight()) || (tileComponent.isTripleWidth() && tileComponent.isTripleHeight())) {
                                    this.tileArray[tileComponent.getRow() + 1][tileComponent.getCol() + 1] = null;
                                }

                                if(tileComponent.isTripleWidth()) {
                                    this.tileArray[tileComponent.getRow()][tileComponent.getCol() + 2] = null;
                                }
                                if(tileComponent.isTripleHeight()) {
                                    this.tileArray[tileComponent.getRow() + 2][tileComponent.getCol()] = null;
                                }
                                if(tileComponent.isTripleWidth() && tileComponent.isTripleHeight()) {
                                    this.tileArray[tileComponent.getRow() + 2][tileComponent.getCol() + 2] = null;
                                    this.tileArray[tileComponent.getRow() + 2][tileComponent.getCol() + 1] = null;
                                    this.tileArray[tileComponent.getRow() + 1][tileComponent.getCol() + 2] = null;
                                }

                                tileComponent.destroyTile(0);
                                isDestroyed = true;
                            }
                        }
                        else {
                            if(tileComponent.isGroupReadyToDestroy(this.tileArray)) {
                                this.tileArray[tileComponent.getRow()][tileComponent.getCol()] = null;
                                tileComponent.destroyTile(0);
                                isDestroyed = true;
                            }
                        }
                    }
                }
            }
        }
        return isDestroyed;
    }

    checkStatusesForDestroy() {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let status = this.statusArray[i][j];
                if(status !== null) {
                    let statusComponent = status.getComponent("StatusBase");
                    if(statusComponent.isReadyToDestroy()) {
                        this.statusArray[i][j] = null;
                        statusComponent.destroyStatus();
                    }
                }
            }
        }
    }


    checkSpecTilesInActionEffect(isBlockingAction: boolean) {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                let status = this.statusArray[i][j];

                let isStatusBlock = false;
                if(status !== null) {
                    let statusComp = status.getComponent("StatusBase");
                    isStatusBlock = statusComp.isBlockingDestroyTile();
                }

                if(tile !== null) {
                    let tileComponent = null;
                    try {
                        tileComponent = tile.getComponent("TileBase");
                    } catch (error) {
                        this.tileArray[i][j] = null;
                        continue;
                    }

                    if(tileComponent.isSpecialTile() && !isStatusBlock) {
                        tileComponent.startInActionEffect(this.tileArray, this.statusArray, isBlockingAction);
                    }
                }
            }
        }
    }

    checkSpecTilesPreActionEffect() {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = null;
                    try {
                        tileComponent = tile.getComponent("TileBase");
                    } catch (error) {
                        this.tileArray[i][j] = null;
                        continue;
                    }

                    if(tileComponent.isSpecialTile()) {
                        tileComponent.startPreActionEffect(this.tileArray);
                    }
                }
            }
        }
    }

    tryToSpawnStartBonuses() {
        if(!this.startBonuses.isStartBonusesAvailable()) {
            return;
        }

        let bonuses = this.startBonuses.getStartBonusPool();

        if(bonuses.length <= 0) {
            return;
        }

        let availablePositions = this.getUnpresetedCommonTilesPositions();
        if(availablePositions.length < bonuses.length) {
            return;
        }

        availablePositions = this.shuffleArray(availablePositions);

        for(let i = 0; i < bonuses.length; i++) {
            switch(bonuses[i]) {
                case "rocket":
                    let filteredRocketPositions = this.filterPositionsByRocketPattern(availablePositions);
                    let rocketRow = filteredRocketPositions.length > i ? filteredRocketPositions[i].x : availablePositions[i].x;
                    let rocketCol = filteredRocketPositions.length > i ? filteredRocketPositions[i].y : availablePositions[i].y;

                    this.spawnRandomRocket(rocketRow, rocketCol);

                    UserData.instance.subResource("rocket", 1);

                    break;
                case "bomb":
                    let filteredBombPositions = this.filterPositionsByBombPattern(availablePositions);
                    let bombRow = filteredBombPositions.length > i ? filteredBombPositions[i].x : availablePositions[i].x;
                    let bombCol = filteredBombPositions.length > i ? filteredBombPositions[i].y : availablePositions[i].y;

                    this.spawnBomb(bombRow, bombCol);

                    UserData.instance.subResource("bomb", 1);

                    break;
                case "discoball":
                    this.spawnDiscoball(availablePositions[i].x, availablePositions[i].y);

                    UserData.instance.subResource("discoball", 1);

                    break;
            }
        }

        this.startBonuses.clear();
    }

    tryToSpawnButlerBonuses() {
        if(!this.butlersGift.isGiftAvailable()) {
            return;
        }

        let bonuses = this.butlersGift.getBonusPool();

        if(bonuses.length <= 0) {
            return;
        }

        let availablePositions = this.getUnpresetedCommonTilesPositions();
        if(availablePositions.length < bonuses.length) {
            return;
        }

        availablePositions = this.shuffleArray(availablePositions);

        for(let i = 0; i < bonuses.length; i++) {
            switch(bonuses[i]) {
                case "rocket":
                    this.spawnRandomRocket(availablePositions[i].x, availablePositions[i].y);
                    break;
                case "bomb":
                    this.spawnBomb(availablePositions[i].x, availablePositions[i].y);
                    break;
                case "discoball":
                    this.spawnDiscoball(availablePositions[i].x, availablePositions[i].y);
                    break;
            }
        }

        this.butlersGift.clear();
    }

    filterPositionsByRocketPattern(positions: Vec2[]): Vec2[] {
        let filteredPositions = [];

        for(let i = 0; i < positions.length; i++) {
            let row = positions[i].x;
            let col = positions[i].y;

            let isVerticalPatternFound = false;
            let isHorizontalPatternFound = false;

            for(let j = 0; j < this.numCols; j++) {
                if(this.tileArray[row][j] !== null) {
                    let tileComp = this.tileArray[row][j].getComponent("TileBase");
                    if(tileComp.isSpecialTile()) {
                        isVerticalPatternFound = true;
                    }
                }
            }

            for(let j = 0; j < this.numRows; j++) {
                if(this.tileArray[j][col] !== null) {
                    let tileComp = this.tileArray[j][col].getComponent("TileBase");
                    if(tileComp.isSpecialTile()) {
                        isHorizontalPatternFound = true;
                    }
                }
            }

            if(isVerticalPatternFound && isHorizontalPatternFound) {
                filteredPositions.push(positions[i]);
            }
        }

        return filteredPositions;
    }

    filterPositionsByBombPattern(positions: Vec2[]): Vec2[] {
        let filteredPositions = [];

        for(let i = 0; i < positions.length; i++) {
            let row = positions[i].x;
            let col = positions[i].y;

            let isBombPatternFound = false;

            for(let i = row - 1; i <= row + 1; i++) {
                for(let j = col - 1; j <= col + 1; j++) {
                    if(isBombPatternFound || i < 0 || i >= this.numRows || j < 0 || j >= this.numCols) {
                        continue;
                    }

                    if(this.tileArray[i][j] !== null) {
                        let tileComp = this.tileArray[i][j].getComponent("TileBase");
                        if(tileComp.isSpecialTile()) {
                            isBombPatternFound = true;
                        }
                    }
                }
            }

            if(isBombPatternFound) {
                filteredPositions.push(positions[i]);
            }
        }

        return filteredPositions;
    }

    
    onTileClick(tile: Node) {
        if(!this.isClickAvailable || tile === null || this.isLevelComplete) {
            return;
        }

        const tileComponent = tile.getComponent("TileBase");

        if(this.boosters.isBoosterActive()) {
            this.isClickAvailable = false;
            this.boosters.useActiveBooster(this.tileArray, tileComponent.getRow(), tileComponent.getCol());
            return;
        }

        if(tileComponent.isSpecialTile()) {
            return;
        }

        if(!this.isInteractionAvailable(tileComponent.getRow(), tileComponent.getCol())) {
            return;
        }

        let isMatchesFound = this.findAndDestroyMatches(tile, true);

        if(isMatchesFound) {
            this.node.emit("move");

            if(this.levelCompletePoints > 0) {
                this.levelCompletePoints = this.levelCompletePoints - 1;
            }
        }
    }

    isInteractionAvailable(row: number, col: number): boolean {
        let status = this.statusArray[row][col];
        if(status === null) {
            return true;
        }

        const statusComponent = status.getComponent("StatusBase");

        return !statusComponent.isBlockingInteraction();
    }



    checkForPotentialBonuses() {
        this.clearAll();

        let checkedTiles = [];
        let isMoveAvailable = false;

        let updatedVerticalRockets: Node[][] = [];
        let updatedHorizontalRockets: Node[][] = [];

        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                let status = this.statusArray[i][j];

                if(!checkedTiles.includes(tile) && tile !== null) {
                    const tileComponent = tile.getComponent("TileBase");
                    let matches = [];

                    let isStatusBlock = false;
                    if(status !== null) {
                        let statusComp = status.getComponent("StatusBase");
                        isStatusBlock = statusComp.isBlockingDestroyTile();
                    }

                    if(tileComponent.isCommonTile() && !isStatusBlock) {
                        matches = tileComponent.getMatches(this.tileArray, this.statusArray);

                        if(matches.length >= 2) {
                            isMoveAvailable = true;
                        }

                        if(matches.length >= 9) {
                            this.setPotentialBonus(matches, "discoball");
                        }
                        else if(matches.length >= 7) {
                            this.setPotentialBonus(matches, "bomb");
                        }
                        else if(matches.length >= 5) {
                            if(this.rocketPreset === "random") {
                                let tileType = Math.floor(Math.random() * 2);

                                if (matches.every(tile => this.savedVerticalRockets.flat().includes(tile))) {
                                    tileType = 0;
                                } else if (matches.every(tile => this.savedHorizontalRockets.flat().includes(tile))) {
                                    tileType = 1;
                                }
    
                                if(tileType === 0) {
                                    this.setPotentialBonus(matches, "rocket_vertical");
                                    updatedVerticalRockets.push(matches);
                                }
                                else {
                                    this.setPotentialBonus(matches, "rocket_horizontal");
                                    updatedHorizontalRockets.push(matches);
                                }
                            }
                            else {
                                this.setPotentialBonus(matches, "rocket_" + this.rocketPreset);
                            }
                        }

                        checkedTiles = checkedTiles.concat(matches);
                    }
                    else if(tileComponent.isBonusTile() && !isStatusBlock) {
                        isMoveAvailable = true;
                    }
                    else {
                        checkedTiles.push(tile);
                    }
                }
            }
        }

        this.savedVerticalRockets = updatedVerticalRockets;
        this.savedHorizontalRockets = updatedHorizontalRockets;

        if(!isMoveAvailable) {
            this.shuffleTiles();
        }
        else {
            if(!this.isLevelComplete && !this.isSpawnScheduled) {
                this.isClickAvailable = true;
            }
            else if(this.isLevelComplete) {
                this.completeLevel();
                return;
            }
        }

        if(!this.isSpawnScheduled) {
            this.node.emit("move_end");
        }
    }

    setPotentialBonus(tiles: Node[], bonus: string) {
        tiles.forEach(matchedTile => {
            let tileComponent = matchedTile.getComponent("TileBase");
            tileComponent.setPotentialBonus(bonus);
        })
    }


    clearAll() {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = tile.getComponent("TileBase");
                    tileComponent.clear();
                }
            }
        }
    }

    clearExtra() {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = tile.getComponent("TileBase");
                    tileComponent.clearExtra();
                }
            }
        }
    }

    setAllDamagedByType(tileId: string) {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = null;
                    try {
                        tileComponent = tile.getComponent("TileBase");
                    } catch (error) {
                        this.tileArray[i][j] = null;
                        continue;
                    }

                    if(tileComponent.getTileType() === tileId) {
                        tileComponent.setAsDamaged();
                    }
                }
            }
        }
    }


    getAvailableColors(): string[] {
        let colors = [];

        for(let j = 0; j < this.spawnPools.length; j++) {
            for(let i = 0; i < this.spawnPools[j].length; i++) {
                if(this.availableColors.includes(this.spawnPools[j][i]) && this.spawnPools[j][i] !== "orange") {
                    colors.push(this.spawnPools[j][i]);
                }
            }
        }
        
        return colors;
    }

    getNumRows(): number {
        return this.numRows;
    }

    getNumCols(): number {
        return this.numCols;
    }

    getTile(row: number, col: number): Node {
        if(row >= 0 && row < this.numRows && col >= 0 && col < this.numCols) {
            return this.tileArray[row][col];
        }
        return null;
    }

    getTilesArray(): Node[][] {
        return this.tileArray;
    }

    getStatusArray(): Node[][] {
        return this.statusArray;
    }


    swapTiles(pos_1: Vec2, pos_2: Vec2) {
        let tile1 = this.tileArray[pos_1.x][pos_1.y];
        if(tile1 === null || tile1 === undefined) {
            return;
        }
        let tileComp1 = tile1.getComponent("TileBase");

        let tile2 = this.tileArray[pos_2.x][pos_2.y];
        if(tile2 === null || tile2 === undefined) {
            return;
        }
        let tileComp2 = tile2.getComponent("TileBase");

        this.tileArray[pos_1.x][pos_1.y] = tile2;
        this.tileArray[pos_2.x][pos_2.y] = tile1;

        tileComp1.setRow(pos_2.x);
        tileComp2.setRow(pos_1.x);

        tileComp1.setCol(pos_2.y);
        tileComp2.setCol(pos_1.y);

        this.node.emit("refresh", this.tileArray, this.statusArray);
    }


    setGoalCompleteEvent(goalId: string) {
        this.node.emit("goal_complete", goalId);
    }

    setGoalPossible(goalId: string) {
        let tilesToRemove = [];
        
        if(goalId.includes("colored")) {
            let tileBaseName = goalId.split("_")[1];

            for(let i = 0; i < this.availableColors.length; i++) {
                tilesToRemove.push(tileBaseName + "_" + this.availableColors[i]);
            }
        }
        else {
            tilesToRemove.push(goalId);
        }

        for(let i = 0; i < tilesToRemove.length; i++) {
            for(let j = 0; j < this.spawnPools.length; j++) {
                if(this.spawnPools[j].includes(tilesToRemove[i]) && !this.availableColors.includes(tilesToRemove[i])) {
                    this.removeStringFromArray(this.spawnPools[j], tilesToRemove[i]);
                }
            }
        }
        
    }


    removeStringFromArray(array: string[], target: string) {
        const index = array.indexOf(target);
        if (index !== -1) {
            array.splice(index, 1);
        }
    }


    shuffleTiles(): boolean {
        this.isClickAvailable = false;

        let tilesPositions = this.shuffleArray(this.getAllCommonTilesPositions().concat(this.getAllBonusTilesPositions()));
        let swappedTiles = [];

        let swapsCount = 0;
        let stepTime = 0.05;
        for(let i = 0; i < tilesPositions.length; i++) {
            if(!swappedTiles.includes(tilesPositions[i])) {
                swappedTiles.push(tilesPositions[i]);
                let tileToSwap = tilesPositions[Math.floor(Math.random() * tilesPositions.length)];
                if(!swappedTiles.includes(tileToSwap)) {
                    swappedTiles.push(tileToSwap);
                    this.scheduleOnce(() => {
                        this.swapTiles(tilesPositions[i], tileToSwap);
                    }, this.swapTime + stepTime * swapsCount);
                    swapsCount++;
                }
            }
        }

        this.scheduleOnce(() => {
            this.checkForPotentialBonuses();
        }, this.swapTime + stepTime * (swapsCount + 1));
    }


    setLevelAsCompleted(moves: number) {
        this.isLevelComplete = true;

        this.levelCompletePoints = moves;
    }
    
    completeLevel() {
        const timeBetweenTiles = 0.2;

        const availableTiles = this.shuffleArray(this.getAllCommonTilesPositions());
        const totalSpawns = availableTiles.length >= this.levelCompletePoints ? this.levelCompletePoints : availableTiles.length;
        const totalTime =  timeBetweenTiles * totalSpawns + 0.2;

        for(let i = 0; i < totalSpawns; i++) {
            this.scheduleOnce(() => {
                this.spawnRandomRocket(availableTiles[i].x, availableTiles[i].y);
                this.node.emit("move");
            }, timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("complete", this.countBonusGold());
        }, totalTime);
    }

    countBonusGold(): number {
        let bonusGold = 0;

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                let tile = this.tileArray[row][col];
                if(tile !== null && tile !== undefined) {
                    const tileComp = tile.getComponent("TileBase");
                    if(tileComp.isBonusTile()) {
                        const tileType = tileComp.getTileType();
                        if(tileType === "rocket_horizontal" || tileType === "rocket_vertical") {
                            bonusGold += 2;

                            this.node.emit("destroy", tileType);
                        }
                        else if(tileType === "bomb") {
                            bonusGold += 3;
                        }
                        else if(this.availableColors.includes(tileType)) {
                            bonusGold += 5;
                        }
                    }
                }
            }
        }

        return bonusGold;
    }


    shuffleArray(array: Node[]): Node[] {
        let currentIndex = array.length;
        let randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }


    getDynamiteGoals(): GoalData[] {
        return this.dynamiteGoals;
    }

    getCosmorocketGoals(): GoalData[] {
        return this.cosmorocketGoals;
    }

    getStartSpawnPool(): string[] {
        return this.startPool;
    }

    getSpawnPools(): string[][] {
        return this.spawnPools;
    }

    getRocketPreset(): string {
        return this.rocketPreset;
    }


    moveNodeToIndex(node: cc.Node, newIndex: number): void {
        const currentIndex: number = this.bonusPool.indexOf(node);
    
        if (currentIndex !== -1) {
            this.bonusPool.splice(currentIndex, 1);
            this.bonusPool.splice(newIndex, 0, node);
        } else {
            console.error("Node not found in the array");
        }
    }


    setSuperDiscoballMode(isActive: boolean) {
        this.isSuperDiscoballMode = isActive;
    }


    countAllTilesByType(typeToSearch: string) {
        let count = 0;

        let typesToSearch = [];
        

        if(this.isColoredType(typeToSearch) || typeToSearch === "easteregg") {
            let baseType = typeToSearch.split("_")[0];

            for(let i = 0; i < this.availableColors.length; i++) {
                typesToSearch.push(baseType + "_" + this.availableColors[i]);
            }

            if(typeToSearch === "easteregg") {
                typesToSearch.push(typeToSearch);
            }
        }
        else {
            typesToSearch.push(typeToSearch);
        }

        for(let k = 0; k < typesToSearch.length; k++) {
            for(let i = 0; i < this.numRows; i++) {
                for(let j = 0; j < this.numCols; j++) {
                    const tile = this.tileArray[i][j];
                    if(tile !== null) {
                        const tileComp = tile.getComponent("TileBase");
                        if(tileComp.getTileType() === typesToSearch[k]) {
                            count++;
                        }
                    }
                }
            }
        }

        return count;
    }

    isColoredType(typeToSearch: string): boolean {
        for(let i = 0; i < this.availableColors.length; i++) {
            if(typeToSearch.includes(this.availableColors[i])) {
                return true;
            }
        }

        return false;
    }
}


