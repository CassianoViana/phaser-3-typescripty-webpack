import { GameObjects, Physics, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import InterfaceElement from "../InterfaceElement";
import { DEPTH_OVERLAY_PANEL_TUTORIAL } from "../scenes/Game";
import TutorialAction from "./TutorialAction";
import TutorialDropLocation from "./TutorialDropLocation";
import TutorialHighlight from "./TutorialHighlight";

export default class MazePhase {

    setupTutorialsAndObjectsPositions: () => void;
    obstacles: Matrix;
    ground: Matrix;
    scene: Scene;
    grid: AlignGrid
    firstAction: TutorialAction;
    action: TutorialAction;
    next: MazePhase
    backgroundOverlay: GameObjects.Sprite;

    dudeFacedTo: string = 'right'
    dudeStartPosition: { row: number, col: number } = { row: 0, col: 0 }
    actions: TutorialAction[] = [];

    constructor(scene: Scene, grid: AlignGrid) {
        this.scene = scene;
        this.grid = grid;
    }

    setupMatrixAndTutorials() {
        this.clearTutorials();
        this.setupTutorialsAndObjectsPositions();
    }

    addTutorialHighlight(
        fnGetInterfaceElement: () => InterfaceElement,
        fnGetDropLocation: () => TutorialDropLocation = null
    ): TutorialAction {
        return this.addTutorialHighlights(
            [new TutorialHighlight(this.scene, this.grid, fnGetInterfaceElement, fnGetDropLocation)]
        )
    }

    addTutorialHighlights(
        highlights: Array<TutorialHighlight>
    ): TutorialAction {
        const tutorialAction = new TutorialAction(this.scene, highlights);
        tutorialAction.onHighlight = () => {
            //this.addBackgroundOverlay()
        }
        tutorialAction.onAdvance = () => {
            this.action = tutorialAction.nextTutorialAction
            console.log('TUTORIAL_ADVANCE [this.action.index]', this.action?.index)
        }
        let index = -1;
        if (!this.firstAction) {
            this.firstAction = tutorialAction
        } else {
            index = this.action.index + 1;
            tutorialAction.previousTutorialAction = this.action
            this.action.nextTutorialAction = tutorialAction;
        }
        tutorialAction.index = index;
        this.action = tutorialAction;
        this.actions.push(tutorialAction);
        return tutorialAction;
    }

    showTutorialActionsIfExists() {
        this.firstAction?.highlight();
    }

    updateTutorial() {
        console.log('TUTORIAL_UPDATE [this.action.index]', this.action?.index)
        this.action?.highlight();
    }

    isTutorialPhase() {
        return this.firstAction != null
    }

    clearTutorials() {
        this.removeBackgroundTutorialOverlay();
        this.action = null;
        this.firstAction = null;
        this.actions.forEach(a => a.reset())
        this.actions = [];
    }

    addBackgroundOverlay() {
        if (!this.backgroundOverlay) {
            this.backgroundOverlay = this.scene.add.sprite(0, 0, 'tutorial-block-click-background')
                .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL);
            this.grid.placeAt(0, 0, this.backgroundOverlay, this.grid.cols, this.grid.rows);
        }
    }

    removeBackgroundTutorialOverlay() {
        if (this.backgroundOverlay) {
            this.scene.children.remove(this.backgroundOverlay);
            this.backgroundOverlay = null;
        }
    }
}