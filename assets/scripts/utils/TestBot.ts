import { _decorator, Component, Node, math, EditBox } from 'cc';
import { Field } from '../game/Field';
import { GameData } from '../data/GameData';
import { UIFrameBase } from '../ui/UIFrameBase';
import { TileBase } from '../game/TileBase';
import { Level } from '../game/Level';
const { ccclass, property } = _decorator;
const { clamp } = math;


@ccclass('TestOutputData')
export class TestOutputData {
    @property
    id = '';
    @property([TestOutputDataItem])
    items: TestOutputDataItem[] = [];
}

@ccclass('TestOutputDataItem')
export class TestOutputDataItem {
    @property
    moves = 0;
    @property
    score = 0;
}


@ccclass('TestBot')
export class TestBot extends Component {

    @property(Node)
    field: Node = null;
    @property(Node)
    level: Node = null;

    @property(UIFrameBase)
    levelResult: UIFrameBase = null;

    @property(EditBox)
    inputField: EditBox = null;

    private fieldComp: Field = null;
    private levelComp: Level = null;

    private isBotActive: boolean = false;

    private currentLevelIndex: number = 0;
    private currentIteration: number = 0;

    private maxLevels: number = 0;
    private maxIterations: number = 0;

    private availableColors: string[] = [];
    private priorityList: string[] = [];
    private goals: string[] = [];

    private movesCounter: number = 0;

    private outputData: TestOutputData[] = [];

    private isLevelChangeScheduled: boolean = false;
    private isMoveScheduled: boolean = false;


    start() {
        this.field.on("game_state", (tiles, statuses) => this.scheduleMakeMove(tiles, statuses));
        this.level.on("complete", (isWin, score) => this.scheduleLevelChange(score));

        this.fieldComp = this.field.getComponent("Field");
        this.levelComp = this.level.getComponent("Level");

        this.availableColors = ["blue", "red", "green", "yellow", "purple", "orange"];
        this.priorityList = ["pump", "fish", "frog", "magic_hat"];
    }


    activateBot(startLevel: number, endLevel: number, iterations: number) {
        this.isBotActive = true;

        this.currentLevelIndex = clamp(startLevel, 0, GameData.instance.levels.length - 1);
        this.maxLevels = clamp(endLevel, startLevel, GameData.instance.levels.length - 1);

        this.maxIterations = clamp(iterations, 1, 100);
        this.currentIteration = 0;

        this.initOutput(startLevel, endLevel);

        this.setNextLevel(-100);
    }


    initOutput(startLevel: number, endLevel: number) {
        this.outputData = [];

        for(let i = startLevel + 1; i < endLevel + 1; i++) {
            let data = new TestOutputData();
            data.id = "level_" + i.toString();
            this.outputData.push(data);
        }
    }

    pushOutput(level_id: string, moves: number, score: number) {
        let foundItem = this.outputData.find((item) => item.id === level_id);

        if(foundItem) {
            let itemData = new TestOutputDataItem();
            itemData.moves = moves;
            itemData.score = score;

            foundItem.items.push(itemData);
        }
    }

    generateOutput(outputData: TestOutputData[]): string {
        let output = '';
    
        outputData.forEach(data => {
            const moves = data.items.map(item => item.moves);
            const scores = data.items.map(item => item.score);
    
            const minMoves = Math.min(...moves);
            const maxMoves = Math.max(...moves);
            const medianMoves = this.getMedian(moves);
    
            const minScore = Math.min(...scores);
            const maxScore = Math.max(...scores);
            const medianScore = this.getMedian(scores);
    
            output += `${data.id}\n`;
            output += `min movesCount value: ${minMoves}, max movesCount value: ${maxMoves}, median movesCount: ${medianMoves}\n`;
            output += `min score value: ${minScore}, max score value: ${maxScore}, median score: ${medianScore}\n\n`;
        });
    
        return output;
    }

    generateSingleOutput(outputData: TestOutputData[], id: string): string {
        const data = outputData.find(item => item.id === id);
    
        if (!data) {
            console.error(`Item with ID '${id}' not found.`);
            return ''; // Return an empty string or handle the error as needed.
        }
    
        const moves = data.items.map(item => item.moves);
        const scores = data.items.map(item => item.score);
    
        const minMoves = Math.min(...moves);
        const maxMoves = Math.max(...moves);
        const medianMoves = this.getMedian(moves);
    
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        const medianScore = this.getMedian(scores);
    
        let output = `${data.id}\n`;
        output += `min movesCount value: ${minMoves}, max movesCount value: ${maxMoves}, median movesCount: ${medianMoves}\n`;
        output += `min score value: ${minScore}, max score value: ${maxScore}, median score: ${medianScore}\n\n`;
    
        return output;
    }
    
    getMedian(values: number[]): number {
        const sorted = values.sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }


    setNextLevel(score: number) {
        if(!this.isBotActive) {
            return;
        }

        let level_number = this.currentLevelIndex + 1;
        let level_id = "level_" + level_number.toString();

        if(this.movesCounter > 0 && score > -100) {

            this.pushOutput(level_id, this.movesCounter, score);
        }

        if(this.currentIteration >= this.maxIterations) {
            let outputString = this.generateSingleOutput(this.outputData, level_id);
            console.log(outputString);

            this.currentLevelIndex++;

            this.currentIteration = 0;
        }

        if(this.currentLevelIndex >= this.maxLevels) {
            this.isBotActive = false;

            let outputString = this.generateOutput(this.outputData);
            this.inputField.string = outputString;

            return;
        }

        this.fieldComp.spawnInitialBoard(GameData.instance.levels[this.currentLevelIndex]);

        this.currentIteration++;
        
        this.levelResult.hide();

        this.movesCounter = 0;
    }

    
    makeMove(tiles: Node[][], statuses: Node[][]) {
        if(!this.isBotActive) {
            return;
        }

        this.movesCounter++;

        this.updateGoalsData();

        if(this.checkAbsolutePrioritySpecTiles(tiles, statuses)) {
            return;
        }
        
        if(this.checkPrioritySpecTiles(tiles, statuses)) {
            return;
        }

        if(this.checkGoalCommonTiles(tiles, statuses)) {
            return;
        }
        
        if(this.checkSpecTiles(tiles, statuses)) {
            return;
        }

        if(this.checkStatuses(tiles, statuses)) {
            return;
        }

        if(this.checkBonusTiles(tiles, statuses)) {
            return;
        }

        if(this.checkComboBonus(tiles, statuses)) {
            return;
        }

        if(this.checkSpecTiles_Circle_1(tiles, statuses)) {
            return;
        }

        if(this.checkSpecTiles_Circle_2(tiles, statuses)) {
            return;
        }

        if(this.checkCommonTiles(tiles, statuses)) {
            return;
        }

        if(this.checkBonusTilesLowPriority(tiles, statuses)) {
            return;
        }
    }


    scheduleLevelChange(score: number) {
        if(this.isLevelChangeScheduled) {
            return;
        }

        this.isLevelChangeScheduled = true;
        this.scheduleOnce(() => {
            this.isLevelChangeScheduled = false;
            this.setNextLevel(score);
        }, 0.2);
    }

    scheduleMakeMove(tiles: Node[][], statuses: Node[][]) {
        if (this.isMoveScheduled) {
            this.unschedule(this.makeMove.bind(this, tiles, statuses));
        }
    
        this.isMoveScheduled = true;
        this.scheduleOnce(() => {
            this.isMoveScheduled = false;
            this.makeMove(tiles, statuses);
        }, 0.02);
    }
    

    updateGoalsData() {
        this.goals = [];

        let levelGoals = this.levelComp.getGoals();

        for(let i = 0; i < levelGoals.length; i++) {
            if(levelGoals[i].count > 0) {
                this.goals.push(levelGoals[i].id);
            }
        }
    }


    checkSpecTiles(tiles: Node[][], statuses: Node[][]): boolean {
        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isSpecialTile()) {
                        let tileType = tileComp.getTileType();
                        let isColored = false;
                        let typeSplit = tileType.split("_");
                        let color = "none";

                        if(typeSplit.length >= 2) {
                            isColored = this.availableColors.includes(typeSplit[1]);
                            color = typeSplit[1];
                        }

                        if(tileType === "duck" || tileType === "ufo") {
                            if(this.findBottomMatch(tiles, statuses, tileComp)) {
                                return true;
                            }
                        }
                        else if(tileType === "big_duck") {
                            if(this.findBottomMatch(tiles, statuses, tileComp)) {
                                return true;
                            }
                            if(this.findBigBottomMatch(tiles, statuses, tileComp)) {
                                return true;
                            }
                        }
                        else if(isColored) {
                            if(this.findAdjacentMatchByColor(tiles, statuses, tileComp, color)) {
                                return true;
                            }
                            if(this.findAdjacentMatch(tiles, statuses, tileComp)) {
                                return true;
                            }
                        }
                        else if(this.priorityList.includes(tileType)) {
                            if(tileComp.getCustomParameter() > 0) {
                                if(this.findAdjacentMatch(tiles, statuses, tileComp)) {
                                    return true;
                                }
                            }
                        }
                        else {
                            if(this.findAdjacentMatch(tiles, statuses, tileComp)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }


    findAdjacentMatch(tiles: Node[][], statuses: Node[][], tileComp: TileBase) {
        let clickCandidates = tileComp.getAdjacentTiles(tiles);
        let choosenTile = null;
        let maximalMatch = 1;

        for(let i = 0; i < clickCandidates.length; i++) {
            if(clickCandidates[i] !== null) {
                let candTileComp = clickCandidates[i].getComponent("TileBase");
                if(candTileComp.isCommonTile()) {
                    let candRow = candTileComp.getRow();
                    let candCol = candTileComp.getCol();

                    if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {
                        let matches = candTileComp.getMatches(tiles, statuses);
                        if(matches.length > maximalMatch) {
                            maximalMatch = matches.length;

                            choosenTile = clickCandidates[i];
                        }
                    }
                }
            }
        }

        if(choosenTile !== null) {
            this.fieldComp.onTileClick(choosenTile);

            return true;
        }

        return false;
    }



    findAdjacentMatchByColor(tiles: Node[][], statuses: Node[][], tileComp: TileBase, color: string) {
        let clickCandidates = tileComp.getAdjacentTiles(tiles);
        let choosenTile = null;
        let maximalMatch = 1;

        for(let i = 0; i < clickCandidates.length; i++) {
            if(clickCandidates[i] !== null) {
                let candTileComp = clickCandidates[i].getComponent("TileBase");
                if(candTileComp.isCommonTile() && candTileComp.getTileType() === color) {
                    let candRow = candTileComp.getRow();
                    let candCol = candTileComp.getCol();

                    if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {
                        let matches = candTileComp.getMatches(tiles, statuses);
                        if(matches.length > maximalMatch) {
                            maximalMatch = matches.length;

                            choosenTile = clickCandidates[i];
                        }
                    }
                }
            }
        }

        if(choosenTile !== null) {
            this.fieldComp.onTileClick(choosenTile);

            return true;
        }

        return false;
    }

    findBottomMatch(tiles: Node[][], statuses: Node[][], tileComp: TileBase) {
        let col = tileComp.getCol();
        let row = tileComp.getRow();

        for(let i = row; i >= 0; i--) {
            let tile = tiles[i][col];
            if(tile !== null) {
                let candTileComp = tile.getComponent("TileBase");
                if(candTileComp.isCommonTile()) {
                    let candRow = candTileComp.getRow();
                    let candCol = candTileComp.getCol();

                    if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {
                        let matches = candTileComp.getMatches(tiles, statuses);
                        if(matches.length > 1) {
                            this.fieldComp.onTileClick(tile);

                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    findBigBottomMatch(tiles: Node[][], statuses: Node[][], tileComp: TileBase) {
        let col = tileComp.getCol();
        let row = tileComp.getRow();

        for(let i = row; i >= 0; i--) {
            let tile = tiles[i][col + 1];
            if(tile !== null) {
                let candTileComp = tile.getComponent("TileBase");
                if(candTileComp.isCommonTile()) {
                    let candRow = candTileComp.getRow();
                    let candCol = candTileComp.getCol();

                    if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {
                        let matches = candTileComp.getMatches(tiles, statuses);
                        if(matches.length > 1) {
                            this.fieldComp.onTileClick(tile);

                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }


    checkBonusTiles(tiles: Node[][], statuses: Node[][]): boolean {
        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isBonusTile()) {
                        let candRow = tileComp.getRow();
                        let candCol = tileComp.getCol();

                        if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {

                            let bonusType = tileComp.getTileType();
                            if(bonusType === "rocket_horizontal") {
                                if(this.checkRocketHorizontalPattern(tiles, statuses, candRow)) {
                                    this.fieldComp.onTileClick(tile);

                                    return true;
                                }
                            }
                            else if(bonusType === "rocket_vertical") {
                                if(this.checkRocketVerticalPattern(tiles, statuses, candCol)) {
                                    this.fieldComp.onTileClick(tile);

                                    return true;
                                }
                            }
                            else if(bonusType === "bomb") {
                                if(this.checkBombPattern(tiles, statuses, candRow, candCol)) {
                                    this.fieldComp.onTileClick(tile);

                                    return true;
                                }
                            }
                        }
                    }
                } 
            }
        }

        return false;
    }

    checkRocketHorizontalPattern(tiles: Node[][], statuses: Node[][], row: number): boolean {
        for(let col = 0; col <= 8; col++) {
            let tile = tiles[row][col];
            let status = statuses[row][col];

            if(tile !== null) {
                let tileComp = tile.getComponent("TileBase");
                if(tileComp.isSpecialTile()) {
                    return true;
                }

                if(tileComp.isBonusTile()) {
                    return true;
                }
            }

            if(status !== null) {
                return true;
            }
        }

        return false;
    }

    checkRocketVerticalPattern(tiles: Node[][], statuses: Node[][], col: number): boolean {
        for(let row = 0; row <= 8; row++) {
            let tile = tiles[row][col];
            let status = statuses[row][col];

            if(tile !== null) {
                let tileComp = tile.getComponent("TileBase");
                if(tileComp.isSpecialTile()) {
                    return true;
                }

                if(tileComp.isBonusTile()) {
                    return true;
                }
            }

            if(status !== null) {
                return true;
            }
        }

        return false;
    }

    checkBombPattern(tiles: Node[][], statuses: Node[][], row: number, col: number): boolean {
        for(let i = row - 1; i <= row + 1; i++) {
            for(let j = col - 1; j <= col + 1; j++) {
                if(i < 0 || i > 8 || j < 0 || j > 8) {
                    continue;
                }

                let tile = tiles[row][col];
                let status = statuses[row][col];

                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");
                    if(tileComp.isSpecialTile()) {
                        return true;
                    }

                    if(tileComp.isBonusTile()) {
                        return true;
                    }
                }

                if(status !== null) {
                    return true;
                }
            }
            
        }

        return false;
    }


    checkCommonTiles(tiles: Node[][], statuses: Node[][]): boolean {
        let maximalCommonMatch = 1;
        let choosenCommonTile = null;

        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isCommonTile()) {
                        let candRow = tileComp.getRow();
                        let candCol = tileComp.getCol();

                        if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {
                            let matches = tileComp.getMatches(tiles, statuses);
                            if(matches.length > maximalCommonMatch) {
                                maximalCommonMatch = matches.length;

                                choosenCommonTile = tile;
                            }
                        } 
                    }
                }
            }
        }

        if(choosenCommonTile !== null) {
            this.fieldComp.onTileClick(choosenCommonTile);

            return true;
        }

        return false;
    }


    checkAbsolutePrioritySpecTiles(tiles: Node[][], statuses: Node[][]): boolean {
        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isSpecialTile()) {
                        let tileType = tileComp.getTileType();

                        if(tileType === "shell" || tileType === "mole") {
                            if(tileComp.getStrength() === 1) {
                                if(this.findAdjacentMatch(tiles, statuses, tileComp)) {
                                    return true;
                                }
                            }
                        }
                        else if(tileType === "duck_tier") {
                            if(tileComp.getStrength() < 4) {
                                if(this.findAdjacentMatch(tiles, statuses, tileComp)) {
                                    return true;
                                }
                            }
                        }
                        else if(tileType === "small_safe" || tileType === "small_safe_open") {
                            if(tileComp.getCustomParameter() === 0) {
                                if(this.findAdjacentMatch(tiles, statuses, tileComp)) {
                                    return true;
                                }
                            }
                        }
                        else if(tileType === "jelly") {
                            if(this.findAdjacentMatch(tiles, statuses, tileComp)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }


    checkPrioritySpecTiles(tiles: Node[][], statuses: Node[][]): boolean {
        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isSpecialTile()) {
                        let tileType = tileComp.getTileType();

                        if(tileType === "pump" || tileType === "fish" || tileType === "frog") {
                            if(tileComp.getCustomParameter() > 0) {
                                if(this.findAdjacentMatch(tiles, statuses, tileComp)) {
                                    return true;
                                }
                            }
                        }
                        else if(tileType === "soap" || tileType === "washing_machine" || tileType === "flower_pot") {
                            if(this.findAdjacentMatch(tiles, statuses, tileComp)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }


    checkGoalCommonTiles(tiles: Node[][], statuses: Node[][]): boolean {
        let maximalCommonMatch = 1;
        let choosenCommonTile = null;

        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isCommonTile()) {
                        let candRow = tileComp.getRow();
                        let candCol = tileComp.getCol();

                        let tileType = tileComp.getTileType();
                        if(this.goals.includes(tileType)) {
                            if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {
                                let matches = tileComp.getMatches(tiles, statuses);
                                if(matches.length > maximalCommonMatch) {
                                    maximalCommonMatch = matches.length;
    
                                    choosenCommonTile = tile;
                                }
                            }
                        }
                    }
                }
            }
        }

        if(choosenCommonTile !== null) {
            this.fieldComp.onTileClick(choosenCommonTile);

            return true;
        }

        return false;
    }


    checkStatuses(tiles: Node[][], statuses: Node[][]): boolean {
        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                let status = statuses[row][col];
                if(status !== null && tile !== null) {
                    let statusComp = status.getComponent("StatusBase");
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isCommonTile()) {
                        if(this.fieldComp.isInteractionAvailable(row, col)) {
                            let matches = tileComp.getMatches(tiles, statuses);
                            if(matches.length > 1) {
                                this.fieldComp.onTileClick(tile);
    
                                return true;
                            }
                        }
                    }

                    if(tileComp.isCommonTile() || tileComp.isSpecialTile()) {
                        if(this.findAdjacentMatch(tiles, statuses, tileComp)) {
                            return true;
                        }
                        if(this.findCircleMatch_1(tiles, statuses, tileComp)) {
                            return true;
                        }
                        if(this.findCircleMatch_2(tiles, statuses, tileComp)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }


    checkBonusTilesLowPriority(tiles: Node[][], statuses: Node[][]): boolean {
        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isBonusTile()) {
                        let candRow = tileComp.getRow();
                        let candCol = tileComp.getCol();

                        if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {
                            this.fieldComp.onTileClick(tile);
                            return true;
                        }
                    }
                } 
            }
        }

        return false;
    }


    checkComboBonus(tiles: Node[][], statuses: Node[][]): boolean {
        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isBonusTile()) {
                        let candRow = tileComp.getRow();
                        let candCol = tileComp.getCol();

                        if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {

                            let adjTiles = tileComp.getAdjacentTiles(tiles);
                            for(let i = 0; i < adjTiles.length; i++) {
                                const adjTile = adjTiles[i];
                                if(adjTile !== null) {
                                    const adjTileComponent = adjTile.getComponent("TileBase");
                                    if(adjTileComponent.isBonusTile()) {
                                        this.fieldComp.onTileClick(tile);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                } 
            }
        }

        return false;
    }

    
    checkSpecTiles_Circle_1(tiles: Node[][], statuses: Node[][]): boolean {
        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isSpecialTile()) {
                        if(this.findCircleMatch_1(tiles, statuses, tileComp)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }


    findCircleMatch_1(tiles: Node[][], statuses: Node[][], tileComp: TileBase) {
        let clickCandidates = tileComp.getAdditionalTiles_1(tiles);

        for(let i = 0; i < clickCandidates.length; i++) {
            if(clickCandidates[i] !== null) {
                let candTileComp = clickCandidates[i].getComponent("TileBase");
                if(candTileComp.isCommonTile()) {
                    let candRow = candTileComp.getRow();
                    let candCol = candTileComp.getCol();

                    if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {
                        let matches = candTileComp.getMatches(tiles, statuses);
                        if(matches.length > 1) {
                            this.fieldComp.onTileClick(clickCandidates[i]);

                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }


    checkSpecTiles_Circle_2(tiles: Node[][], statuses: Node[][]): boolean {
        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {

                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("TileBase");

                    if(tileComp.isSpecialTile()) {
                        if(this.findCircleMatch_2(tiles, statuses, tileComp)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }


    findCircleMatch_2(tiles: Node[][], statuses: Node[][], tileComp: TileBase) {
        let clickCandidates = tileComp.getAdditionalTiles_2(tiles);

        for(let i = 0; i < clickCandidates.length; i++) {
            if(clickCandidates[i] !== null) {
                let candTileComp = clickCandidates[i].getComponent("TileBase");
                if(candTileComp.isCommonTile()) {
                    let candRow = candTileComp.getRow();
                    let candCol = candTileComp.getCol();

                    if(this.fieldComp.isInteractionAvailable(candRow, candCol)) {
                        let matches = candTileComp.getMatches(tiles, statuses);
                        if(matches.length > 1) {
                            this.fieldComp.onTileClick(clickCandidates[i]);

                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
}


