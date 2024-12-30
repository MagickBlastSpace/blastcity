import { _decorator, Component, Node, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadingAnimation_2')
export class LoadingAnimation_2 extends Component {
    @property({ type: [Node] })
    loadingNodes: Node[] = []; // Nodes for the animation, set in the editor

    @property
    interval: number = 0.5; // Interval for each step in seconds

    private sequence: boolean[][] = [];
    private currentStep = 0;

    start() {
        if (this.loadingNodes.length !== 3) {
            console.warn('Exactly 3 nodes are required for this animation!');
            return;
        }

        // Define the animation sequence
        this.sequence = [
            [false, false, false], // All inactive
            [true, false, false],  // First active
            [true, true, false],   // First and second active
            [true, true, true],    // All active
            [false, true, true],   // Second and third active
            [false, false, true],  // Third active
            [false, false, false], // All inactive
        ];

        // Ensure all nodes are initially inactive
        this.updateNodeStates(this.sequence[0]);

        // Start the animation loop
        this.schedule(this.updateAnimation, this.interval);
    }

    updateAnimation() {
        // Update the states of nodes based on the current step
        this.updateNodeStates(this.sequence[this.currentStep]);

        // Move to the next step in the sequence
        this.currentStep = (this.currentStep + 1) % this.sequence.length;
    }

    updateNodeStates(stateArray: boolean[]) {
        for (let i = 0; i < this.loadingNodes.length; i++) {
            this.loadingNodes[i].active = stateArray[i];
        }
    }
}
