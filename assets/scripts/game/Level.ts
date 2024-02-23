import { _decorator, Component, Node } from 'cc';
import { GoalData, LevelData } from '../data/GameData';
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


    start() {
        this.field.on("move", () => this.moveCallback());
        this.field.on("level_init", (level) => this.init(level));
        this.field.on("destroy", (tileType) => this.updateGoals(tileType));
        this.field.on("goal_inc", (tileType) => this.incrementGoal(tileType));
        this.field.on("complete", (goldEarned) => this.setLevelCompleteEvent(goldEarned));
        this.field.on("move_end", () => this.moveEndCallback());

        this.movesShop.on("extra_moves", (movesCount) => this.addExtraMoves(movesCount));
    }

    resetStats() {
        this.stats = new LevelProgressStatisticsData();
        this.stats.levelId = UserData.instance.getProgress();
        this.stats.redDestroyed = 0;
        this.stats.rocketsDestroyed = 0;
        this.stats.destroyedByDiscoball = 0;
        this.stats.fails = 0;
    }


    init(level: LevelData) {
        this.goals = [];
        this.moves = level.movesCount;
        this.difficulty = level.difficulty;
        this.coinsCollected = 0;

        this.resetStats();

        let loadedStats = Statistics.instance.loadLevelStat(UserData.instance.getProgress());
        if(loadedStats) {
            this.stats.levelId = loadedStats.levelId;
            this.stats.redDestroyed = loadedStats.redDestroyed;
            this.stats.rocketsDestroyed = loadedStats.rocketsDestroyed;
            this.stats.destroyedByDiscoball = loadedStats.destroyedByDiscoball;
            this.stats.fails = loadedStats.fails;
        }
        else {
            Statistics.instance.updateLevelStat(this.stats);
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

        if(this.moves > 0) {
            this.moves--;

            if(this.moves <= 0) {
                this.checkLevelStatus();
            }
        }

        this.node.emit("refresh", this.moves);
    }

    moveEndCallback() {
        if(!this.isFailed) {
            return;
        }

        this.stats.fails++;
        this.node.emit("complete", false, 0);

        Statistics.instance.updateLevelStat(this.stats);
        SaveData.instance.saveStatistics();
    }

    addExtraMoves(movesCount: number) {
        this.isFailed = false;

        this.moves += movesCount;

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
        this.node.emit("goal_complete_event", goalId);
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

            return;
        }

        if(!isGoalsComplete && this.moves <= 0) {
            if(this.isBonusLevel()) {
                UserData.instance.addProgress();
                this.node.emit("all_goals_complete_event", 0);

                return;
            }

            this.isFailed = true;
        }
    }


    setLevelCompleteEvent(goldEarned: number) {
        let totalReward = this.isBonusGoldAvailable() ? (goldEarned * this.difficultyMultiplier + this.completionReward) : this.completionReward;
        totalReward = this.isBonusLevel() ? this.coinsCollected * this.difficultyMultiplier : totalReward;

        UserData.instance.addResource("gold", totalReward);

        SaveData.instance.clearLevelProgress();

        this.node.emit("complete", true, totalReward);
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
}


