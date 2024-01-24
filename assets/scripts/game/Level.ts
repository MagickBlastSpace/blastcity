import { _decorator, Component, Node } from 'cc';
import { GoalData } from '../data/GameData';
import { UserData } from '../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {
    
    @property(Node)
    field: Node = null;

    private moves: number = 0;
    private maxGoals: number = 5;

    private goals: GoalData[] = [];

    private isInited: boolean = false;


    start() {
        this.field.on("move", () => this.moveCallback());
        this.field.on("level_init", (movesCount: number, goals: GoalData[]) => this.init(movesCount, goals));
        this.field.on("destroy", (tileType) => this.updateGoals(tileType));
        this.field.on("goal_inc", (tileType) => this.incrementGoal(tileType));
        this.field.on("complete", (goldEarned) => this.setLevelCompleteEvent(goldEarned));
    }


    init(movesCount: number, goals: GoalData[]) {
        this.goals = [];
        this.moves = movesCount;
        
        for(let i = 0; i < goals.length; i++) {
            let newGoal = new GoalData();
            newGoal.id = goals[i].id;
            newGoal.count = goals[i].count;

            this.goals.push(newGoal);
        }

        while(this.goals.length < this.maxGoals) {
            let newGoal = new GoalData();
            newGoal.id = "common";
            newGoal.count = 0;

            this.goals.push(newGoal);
        }


        this.node.emit("refresh", this.moves);
        this.node.emit("refresh_goals", this.goals);

        this.isInited = true;
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


    updateGoals(tileType: string) {
        const goal = this.goals.find(g => g.id === tileType);
        if(goal !== null && goal !== undefined) {
            if(goal.count > 0) {
                goal.count--;
                this.node.emit("refresh_goals", this.goals);

                if(goal.count === 0) {
                    this.setGoalCompleteEvent(goal.id);

                    this.checkLevelStatus();
                }
            }
        }
    }

    incrementGoal(tileType: string) {
        const goal = this.goals.find(g => g.id === tileType);
        if(goal !== null && goal !== undefined) {
            goal.count++;
            this.node.emit("refresh_goals", this.goals);
        }
    }

    setGoalCompleteEvent(goalId: string) {
        this.node.emit("goal_complete_event", goalId);
    }


    checkLevelStatus() {
        let isGoalsComplete = true;

        for(let i = 0; i < this.goals.length; i++) {
            if(this.goals[i].count > 0) {
                isGoalsComplete = false;
            }
        }

        if(isGoalsComplete) {
            UserData.instance.addProgress();
            this.node.emit("all_goals_complete_event", this.moves);
            return;
        }

        if(!isGoalsComplete && this.moves <= 0) {
            this.node.emit("complete", false, 0);
        }
    }


    setLevelCompleteEvent(goldEarned: number) {
        this.node.emit("complete", true, goldEarned);
    }
}


