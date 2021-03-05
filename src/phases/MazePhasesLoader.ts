import { Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import { MecanicaRope } from "../ct-platform-classes/MecanicaRope";
import AlignGrid from "../geom/AlignGrid";
import Matrix, { MatrixMode } from "../geom/Matrix";
import { Logger } from "../main";
import GameParams from "../settings/GameParams";
import MazePhase from "./MazePhase";
import HardcodedPhasesCreator from "./hardcodedPhases/HardcodedPhasesCreator";

export default class MazePhasesLoader {

  currentPhase: number = -1
  phases: Array<MazePhase>;
  scene: Scene;
  grid: AlignGrid;
  matrixMode: MatrixMode;
  gridCenterX: number;
  gridCenterY: number;
  gridCellWidth: number;
  codeEditor: CodeEditor;

  constructor(scene: Scene,
    grid: AlignGrid,
    codeEditor: CodeEditor,
    matrixMode: MatrixMode,
    gridCenterX: number,
    gridCenterY: number,
    gridCellWidth: number) {

    this.matrixMode = matrixMode;
    this.gridCenterX = gridCenterX;
    this.gridCenterY = gridCenterY;
    this.gridCellWidth = gridCellWidth;
    this.codeEditor = codeEditor;

    this.scene = scene;
    this.grid = grid;

  }

  async load(gameParams: GameParams): Promise<MazePhasesLoader> {
    let phases: MazePhasesLoader;
    try {
      if (gameParams.isPlaygroundTest()) {
        phases = await this.loadPlaygroundTestItem(gameParams);
      }
      if (gameParams.isTestApplication()) {
        phases = await this.loadTestApplication(gameParams)
      }
      if (phases == null) {
        throw new Error('empty phases');
      }
    } catch (e) {
      Logger.error(e);
      phases = this.createHardCodedPhases();
    }
    return phases
  }

  private async loadPlaygroundTestItem(gameParams: GameParams): Promise<MazePhasesLoader> {
    const baseUrl = gameParams.baseUrl;
    const itemNumber = gameParams.testItemNumber;
    let phase = await this.instantiateItem(baseUrl, itemNumber)
    this.phases = [phase]
    return this
  }

  private async loadTestApplication(gameParams: GameParams): Promise<MazePhasesLoader> {
    const response: Response = await fetch(gameParams.baseUrl + '/test-applications/byHash/' + gameParams.applicationHash)
    let testApplication = await response.json()
    let ids = testApplication.test.items.map((testItem: any) => testItem.item.id)
    this.phases = await Promise.all(ids.map(async (id: string) => await this.instantiateItem(gameParams.baseUrl, id)));
    return this;
  }

  private async instantiateItem(baseUrl: string, itemNumber: any): Promise<MazePhase> {
    const response = await fetch(baseUrl + '/items/instantiate/' + itemNumber);
    let item = await response.json();
    return this.convertMecanicaRopeToPhase(item as MecanicaRope);
  }


  private convertMecanicaRopeToPhase(mecanicaRope: MecanicaRope): MazePhase {
    let phase = new MazePhase(this.scene, this.codeEditor);
    phase.mecanicaRope = mecanicaRope;

    phase.setupTutorialsAndObjectsPositions = () => {
      phase.obstacles = new Matrix(
        this.scene,
        MatrixMode.ISOMETRIC,
        phase.mecanicaRope.obstaculos,
        this.gridCenterX, this.gridCenterY, this.gridCellWidth
      );

      phase.ground = new Matrix(
        this.scene,
        MatrixMode.ISOMETRIC,
        phase.mecanicaRope.mapa,
        this.gridCenterX, this.gridCenterY, this.gridCellWidth
      );

      phase.dudeStartPosition = { row: phase.mecanicaRope.y, col: phase.mecanicaRope.x }
      phase.dudeFacedTo = mecanicaRope.face

      /* if (phase.mecanicaRope.showTutorial) {
        buildTutorial(phase,
          [
            'drag arrow-up say drag-up-to-program',
            'click btn-play say click-get-coin'
          ]
        )
      } */
    }
    return phase
  }

  private createHardCodedPhases(): MazePhasesLoader {
    this.phases = new HardcodedPhasesCreator(
      this.scene,
      this.codeEditor,
      this.gridCenterX,
      this.gridCenterY,
      this.gridCellWidth)
      .createHardCodedPhases()
    return this;
  }

  getNextPhase(): MazePhase {
    this.currentPhase++
    return this.phases[this.currentPhase]
  }


}
