import { _decorator, Component, Node } from 'cc';
import { AdsTimer } from '../../utils/AdsTimer';
import { Field } from '../Field';
import { Level } from '../Level';
const { ccclass, property } = _decorator;

@ccclass('HintFinder')
export class HintFinder extends Component {

    @property(Node)
    field: Node = null;
    @property(Node)
    level: Node = null;

    @property(AdsTimer)
    adsTimer: AdsTimer = null;

    private fieldComp: Field = null;
    private levelComp: Level = null;

    private availableColors: string[] = [];
    private priorityList: string[] = [];
    private goals: string[] = [];

    private tilesArray: Node[][];
    private statusesArray: Node[][];

    private timeCounter: number = 0;

    private HINT_TRESHOLD: number = 5;

    private isTimerActive: boolean = false;

    private currentMatch: Node[] = [];


    start() {
        this.field.on("game_state", (tiles, statuses) => this.updateTilesArray(tiles, statuses));
        this.field.on("complete", (goldEarned) => this.stopTimer());

        this.fieldComp = this.field.getComponent("Field");
        this.levelComp = this.level.getComponent("Level");

        this.availableColors = ["blue", "red", "green", "yellow", "purple", "orange"];
        this.priorityList = ["pump", "fish", "frog", "magic_hat"];

        this.stopTimer();
    }


    update(dt: number) {
        if(!this.adsTimer.isGameplayActive()) {
            return;
        }

        if(!this.isTimerActive) {
            return;
        }

        this.timeCounter += dt;

        if (this.hasExceededHintTime(this.timeCounter)) {
            this.stopTimer();

            this.makeHint(this.tilesArray, this.statusesArray);
        }
    }


    updateTilesArray(tilesArray: Node[][], status: Node[][]) {
        this.stopAllHints(this.tilesArray);

        this.tilesArray = tilesArray;
        this.statusesArray = status;

        this.startTimer();
    }

    startTimer() {
        this.timeCounter = 0;

        this.isTimerActive = true;
    }

    stopTimer() {
        this.timeCounter = 0;

        this.isTimerActive = false;
    }


    hasExceededHintTime(time: number): boolean {
        return time > this.HINT_TRESHOLD;
    }


    makeHint(tiles: Node[][], statuses: Node[][]) {
        this.currentMatch = [];

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

        if(this.checkSpecTiles_Circle_1(tiles, statuses)) {
            return;
        }

        if(this.checkSpecTiles_Circle_2(tiles, statuses)) {
            return;
        }

        if(this.checkCommonTiles(tiles, statuses)) {
            return;
        }
    }

    stopAllHints(tiles: Node[][]) {
        if(!tiles || tiles === undefined) {
            return;
        }

        for (let row = 8; row >= 0; row--) {
            for (let col = 0; col <= 8; col++) {
                let tile = tiles[row][col];
                if(tile !== null) {
                    let tileComp = tile.getComponent("UITile");

                    tileComp.stopShake();
                }
            }
        }
    }


    shakeMatch(match: Node[]) {
        for(let i = 0; i < match.length; i++) {
            let tile = match[i];
            if(tile !== null) {
                let tileComp = tile.getComponent("UITile");
                tileComp.startShake();
            }
        }
    }



    /*Algorythms*/
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

                            this.currentMatch = matches;
                        }
                    }
                }
            }
        }

        if(this.currentMatch.length > 1) {
            this.shakeMatch(this.currentMatch);

            return true;
        }

        return false;
    }



    findAdjacentMatchByColor(tiles: Node[][], statuses: Node[][], tileComp: TileBase, color: string) {
        let clickCandidates = tileComp.getAdjacentTiles(tiles);
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

                            this.currentMatch = matches;
                        }
                    }
                }
            }
        }

        if(this.currentMatch.length > 1) {
            this.shakeMatch(this.currentMatch);

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
                            this.shakeMatch(matches);
                
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
                            this.shakeMatch(matches);
                
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }


    checkCommonTiles(tiles: Node[][], statuses: Node[][]): boolean {
        let maximalCommonMatch = 1;

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

                                this.currentMatch = matches;
                            }
                        } 
                    }
                }
            }
        }

        if(this.currentMatch.length > 1) {
            this.shakeMatch(this.currentMatch);

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
    
                                    this.currentMatch = matches;
                                }
                            }
                        }
                    }
                }
            }
        }

        if(this.currentMatch.length > 1) {
            this.shakeMatch(this.currentMatch);

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
                                this.shakeMatch(matches);
    
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
                            this.shakeMatch(matches);

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
                            this.shakeMatch(matches);

                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
}


