declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { GameData, GoalData, LevelData } from '../data/GameData';
import { UserData } from '../data/UserData';
import { SaveData } from '../data/SaveData';
import { LevelProgressStatisticsData, Statistics } from '../data/Statistics';
const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {
    
    @property(Node)
    field: Node = null;
    @property(Node)
    movesShop: Node = null;

    private moves: number = 0;
    private maxGoals: number = 5;

    private goals: GoalData[] = [];
    private difficulty: string = "";
    private difficultyMultiplier: number = 1;
    private completionReward: number = 0;
    private coinsCollected: number = 0;

    private isInited: boolean = false;
    private isComplete: boolean = false;
    private isFailed: boolean = false;

    private stats: LevelProgressStatisticsData = null;

    private isMovesUnlimited: boolean = false;
    private startMovesCount: number = 0;
    private experimentCategory: string = "";

    private premiumMoves: number = 5;


    start() {
        this.field.on("move", () => this.moveCallback());
        this.field.on("level_init", (level) => this.init(level));
        this.field.on("destroy", (tileType) => this.updateGoals(tileType));
        this.field.on("goal_inc", (tileType) => this.incrementGoal(tileType));
        this.field.on("complete", (goldEarned) => this.setLevelCompleteEvent(goldEarned));
        this.field.on("move_end", () => this.moveEndCallback());
        this.field.on("goal_check", (goalType, count) => this.checkGoalPossibility(goalType, count));

        this.movesShop.on("extra_moves", (movesCount) => this.addExtraMoves(movesCount));

        GameData.instance.node.on("experiment", (category) => this.setExperimentCategory(category));
    }

    resetStats() {
        this.stats = new LevelProgressStatisticsData();
        this.stats.levelId = UserData.instance.getProgress();
        this.stats.levelDifficulty = this.difficulty;
        this.stats.redDestroyed = 0;
        this.stats.rocketsDestroyed = 0;
        this.stats.destroyedByDiscoball = 0;
        this.stats.fails = 0;
    }


    init(level: LevelData) {
        this.node.emit("init");
        
        this.goals = [];
        this.difficulty = level.difficulty;
        this.moves = level.movesCount;
        this.coinsCollected = 0;

        this.startMovesCount = this.moves;

        if(UserData.instance.getIsPremium()) {
            this.startMovesCount += this.premiumMoves;
        }

        this.resetStats();

        let loadedStats = Statistics.instance.loadLevelStat(UserData.instance.getProgress());
        if(loadedStats) {
            this.stats.levelId = loadedStats.levelId;
            this.stats.levelDifficulty = this.difficulty;
            this.stats.redDestroyed = loadedStats.redDestroyed;
            this.stats.rocketsDestroyed = loadedStats.rocketsDestroyed;
            this.stats.destroyedByDiscoball = loadedStats.destroyedByDiscoball;
            this.stats.fails = loadedStats.fails;
        }
        else {
            Statistics.instance.updateLevelStat(this.stats);
            SaveData.instance.saveStatistics();
        }

        switch(this.difficulty) {
            case "common":
                this.difficultyMultiplier = 2;
                this.completionReward = 10;
                break;
            case "hard":
                this.difficultyMultiplier = 3;
                this.completionReward = 100;
                break;
            case "superhard":
                this.difficultyMultiplier = 5;
                this.completionReward = 150;
                break;
            case "bonus":
                this.difficultyMultiplier = 5;
                this.completionReward = 0;
                break;
            case "nightmare":
                this.difficultyMultiplier = 1;
                this.completionReward = 50;
                break;
        }
        
        for(let i = 0; i < level.goals.length; i++) {
            let newGoal = new GoalData();
            newGoal.id = level.goals[i].id;
            newGoal.count = level.goals[i].count;

            this.goals.push(newGoal);
        }

        while(this.goals.length < this.maxGoals) {
            let newGoal = new GoalData();
            newGoal.id = "common";
            newGoal.count = 0;

            this.goals.push(newGoal);
        }

        this.node.emit("refresh");

        this.isInited = true;
        this.isComplete = false;
        this.isFailed = false;

        this.checkLevelStatus();
    }


    moveCallback() {
        if(!this.isInited) {
            return;
        }

        if(this.moves > 0 || this.isMovesUnlimited) {
            this.moves--;

            if(this.moves <= 0) {
                this.checkLevelStatus();
            }
        }

        this.node.emit("refresh", this.moves);

        if(this.isComplete) {
            this.node.emit("reward_move");
        }
    }

    moveEndCallback() {
        if(!this.isFailed) {
            return;
        }

        if(this.isMovesUnlimited) {
            return;
        }

        this.stats.fails++;
        if(!this.isMovesUnlimited) {
            //this.node.emit("complete", false, 0);
            this.node.emit("no_moves");
        }

        Statistics.instance.updateLevelStat(this.stats);
        SaveData.instance.saveStatistics();
    }

    castFailEvent() {
        this.node.emit("complete", false, 0);
    }

    addExtraMoves(movesCount: number) {
        this.isFailed = false;

        this.moves += movesCount;
        this.startMovesCount += movesCount;

        this.node.emit("refresh", this.moves);
        this.node.emit("extra");
    }


    updateGoals(tileType: string) {
        const goal = this.goals.find(g => g.id === tileType);
        if(goal !== null && goal !== undefined) {
            if(goal.count > 0) {
                goal.count--;
                this.node.emit("refresh");

                if(goal.count === 0) {
                    this.setGoalCompleteEvent(goal.id);

                    this.checkLevelStatus();
                }
            }
        }

        this.updateStats(tileType);
    }

    incrementGoal(tileType: string) {
        if(tileType === "coin") {
            this.coinsCollected = this.coinsCollected + 1;
        }

        const goal = this.goals.find(g => g.id === tileType);
        if(goal !== null && goal !== undefined) {
            goal.count++;
            this.node.emit("refresh");
        }
    }

    updateStats(tileType: string) {
        if(!this.stats) {
            return;
        }
        
        switch(tileType) {
            case "red":
                this.stats.redDestroyed++;
                break;
            case "rocket_horizontal":
            case "rocket_vertical":
                this.stats.rocketsDestroyed++;
                break;
            case "discoball":
                this.stats.destroyedByDiscoball++;
                break;
        }

        Statistics.instance.updateLevelStat(this.stats);
        SaveData.instance.saveStatistics();
    }

    setGoalCompleteEvent(goalId: string) {
        if(goalId === "coin") {
            return;
        }

        this.node.emit("goal_complete_event", goalId);
    }

    checkGoalPossibility(goalType: string, count: number) {
        if(goalType === "coin") {
            return;
        }

        const goal = this.goals.find(g => g.id === goalType);
        if(goal !== null && goal !== undefined) {
            if(goal.count <= count) {
                this.node.emit("goal_possible_event", goalType);
            }
        }
    }


    checkLevelStatus() {
        if(this.isComplete) {
            return;
        }

        let isGoalsComplete = true;

        if(!this.isBonusLevel()) {
            for(let i = 0; i < this.goals.length; i++) {
                if(this.goals[i].count > 0) {
                    isGoalsComplete = false;
                }
            }
        }
        else {
            isGoalsComplete = false;
        }

        if(isGoalsComplete) {
            UserData.instance.addProgress();
            let bonusesToSpawn = this.isBonusGoldAvailable() ? this.moves : 0;
            this.node.emit("all_goals_complete_event", bonusesToSpawn);

            this.isComplete = true;

            this.node.emit("publish_record", 'level_' + UserData.instance.getProgress(), this.startMovesCount - this.moves, 0);

            return;
        }

        if(!isGoalsComplete && this.moves <= 0) {
            if(this.isBonusLevel()) {
                UserData.instance.addProgress();
                this.node.emit("all_goals_complete_event", 0);

                let totalReward = this.coinsCollected * this.difficultyMultiplier;

                this.node.emit("publish_record", 'level_' + UserData.instance.getProgress(), this.startMovesCount - this.moves, totalReward);
            }

            if(!this.isMovesUnlimited) {
                this.isFailed = true;
            }
        }
    }


    setLevelCompleteEvent(goldEarned: number) {
        let totalReward = this.isBonusGoldAvailable() ? (goldEarned * this.difficultyMultiplier + this.completionReward) : this.completionReward;
        totalReward = this.isBonusLevel() ? this.coinsCollected * this.difficultyMultiplier : totalReward;

        UserData.instance.addResource("gold", totalReward);

        switch(this.difficulty) {
            case "common":
                UserData.instance.addResource("stars", 1);
                break;
            case "hard":
                UserData.instance.addResource("stars", 3);
                break;
            case "superhard":
                UserData.instance.addResource("stars", 5);
                break;
        }

        this.node.emit("complete", true, totalReward);
        this.node.emit("complete_statistics", this.stats);

        if(this.stats.fails === 0) {
            gamepush.player.add('stat_win', 1);
            gamepush.player.sync();
        }

        SaveData.instance.clearLevelProgress();
    }


    fail() {
        this.stats.redDestroyed = 0;
        this.stats.rocketsDestroyed = 0;
        this.stats.destroyedByDiscoball = 0;

        SaveData.instance.saveStatistics();

        this.node.emit("fail");

        UserData.instance.subResource("energy", 1);
    }


    isBonusGoldAvailable(): boolean {
        return this.difficulty !== "nightmare" && this.difficulty !== "bonus";
    }

    isBonusLevel(): boolean {
        return this.difficulty === "bonus";
    }


    getGoals(): GoalData[] {
        return this.goals;
    }

    getMoves(): number {
        return this.moves;
    }

    getDifficulty(): string {
        return this.difficulty;
    }


    getFailsCount(): number {
        return this.stats.fails;
    }

    getExperimentCategory(): string {
        return this.experimentCategory;
    }


    setExperimentCategory(category: string) {
        //this.isMovesUnlimited = category === "B";
        this.isMovesUnlimited = false;

        this.experimentCategory = category;

        console.log("Experiment Category: " + category);
    }


    getCompletionReward(): number {
        if(this.isBonusLevel()) {
            return this.coinsCollected * this.difficultyMultiplier;
        }
        return this.completionReward;
    }

    getDifficultyMultiplier(): number {
        return this.difficultyMultiplier;
    }
}


