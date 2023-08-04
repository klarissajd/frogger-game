import "./style.css";

import { zip, interval, fromEvent, merge} from 'rxjs'; 
import { map, filter, scan } from 'rxjs/operators';

function main() {
  /**
   * Inside this function you will use the classes and functions from rx.js
   * to add visuals to the svg element in pong.html, animate them, and make them interactive.
   *
   * Study and complete the tasks in observable examples first to get ideas.
   *
   * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
   *
   * You will be marked on your functional programming style
   * as well as the functionality that you implement.
   *
   * Document your code!
   */

  /**
   * This is the view for your game to add and update your game elements.
   */

  const svg = document.querySelector("#svgCanvas") as SVGElement & HTMLElement;

  type ViewType = 'frog' | 'car' | 'plank'
  
  //MOVING THE FROG
  const FROG = document.createElementNS(svg.namespaceURI, "circle");
  FROG.setAttribute("r", "25");
  FROG.setAttribute("cx", "300");
  FROG.setAttribute("cy", "570");
  FROG.setAttribute("style", "fill: green");
  svg.appendChild(FROG);

  // type State = Readonly <{ 
  //   cx: number;
  //   cy: number;
  //   velocity: number;
  //   height: number;
  //   width: number;
  //   x: number;
  //   y: number;

  // }>

  type State = Readonly <{
      frog: Body,
      //each row handle the obstacles
      rowOne: ReadonlyArray<Body>,
      rowTwo: ReadonlyArray<Body>,
      rowThree: ReadonlyArray<Body>,
      rowFour: ReadonlyArray<Body>,
      rowFive: ReadonlyArray<Body>,
      rowSix: ReadonlyArray<Body>,
      //handle the leaving obstacles
      //exit: ReadonlyArray<Body>,
      gameOver: boolean
  }>

  type Body = Readonly <{
      cx: number,
      cy: number,
      x: number,
      y: number,
      height: number,
      width: number,
      velocity: number,
      viewType: ViewType
  }>

  type Rectangle = Readonly <{
    height: number,
    width: number,
  }>

  type ObjectId = Readonly<{id: string, createTime: number}>

  const Constants = {
    CanvasSize: 600,
    QuickVelocity: 2,
    SlowVelocity: 0.5,
    SmallObject: 80,
    LargeObject: 120,
    ObjectHeight: 60,
    RowOneY: 120,
    RowTwoY: 180,
    RowThreeY: 240,
    RowFourY: 360,
    RowFiveY: 420,
    RowSixY: 480,
    RightToLeft: -120,
    LeftToRight: 600
  }

  // this create the body of the frog and later update the movement
  function createFrog(): Body {
    return {
      cx: 0,
      cy: 0,
      x: 0,
      y: 0,
      height: 0,
      width: 0,
      velocity: 0,
      viewType: 'frog'
    }
  } 

  const createRectangle = (viewType: ViewType) => (rect: Rectangle) => 
  (vel: number, x: number, y: number) => <Body> {
    cx: 0,
    cy: 0,
    x: x,
    y: y,
    height: rect.height,
    width: rect.width,
    velocity: vel,
    viewType: viewType
  },
  createCar = createRectangle('car'),
  createPlank = createRectangle('plank')

  //create size of car (impure since it is random)
  const randomWidth = (Math.floor(Math.random()) * 2 * 40) + 80

  const startCar = interval(50).pipe(map(((_) => createCar({height: Constants.ObjectHeight, width: randomWidth}))),

  INITIAL_STATE: State = {
    frog: createFrog(),
      //each row handle the obstacles
    // rowOne: createPlank,
    // rowTwo: createPlank,
    // rowThree: createPlank,
    // rowFour: startCar(Constants.SlowVelocity, Constants.RowFourY, Constants.LeftToRight),
    // rowFive: createCar,
    // rowSix: createCar,
      //handle the leaving obstacles
    gameOver: false
  };


  // creating the car and plank
  // const createRectangle = (viewType: ViewType) => (Obstacles: Body) => { 
  //   const RECT = document.createElementNS(svg.namespaceURI, "rect");
  //   const width = Obstacles.width
  //   const height = Obstacles.height
  //   RECT.setAttribute("width", String(width));
  //   RECT.setAttribute("height", "60");
  //   //RECT.setAttribute("x", "-120")
  //   const viewType = Obstacles.viewType
  //   viewType === "car" ? RECT.setAttribute("fill", "violet") : RECT.setAttribute("fill", "peru");

  //   svg.appendChild(RECT);
  // },
  // createCar = createRectangle("car"),
  // createPlank = createRectangle("plank");



  // game state
  class MoveHorizontalFrog { constructor(public readonly moveX: number) {}}
  class MoveVerticalFrog { constructor(public readonly moveY: number) {}}

  type Key = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'
 

  //keyobservable handles the keyboard event when arrows are clicked
  const keyObservable$ = <T>(eventName: string, k: Key, result:() => T) =>
  fromEvent<KeyboardEvent>(document, eventName)
  .pipe(filter(({code}) => code === k),
  map(result)),

  //each takes an input to handle the event
  startLeftMove = keyObservable$('keydown', 'ArrowLeft', () => new MoveHorizontalFrog(-60)),
  startRightMove = keyObservable$('keydown', 'ArrowRight', () => new MoveHorizontalFrog(60)),
  startDownMove = keyObservable$('keydown', 'ArrowDown', () => new MoveVerticalFrog(60)),
  startUpMove = keyObservable$('keydown', 'ArrowUp', () => new MoveVerticalFrog(-60))

  //state of frog is checked (updated location based on the keyboard event)
  const reduceState = (s: State, e: MoveHorizontalFrog | MoveVerticalFrog) =>
    e instanceof MoveHorizontalFrog ? {...s, frog: {...s.frog, cx: e.moveX + s.frog.cx}} :
    e instanceof MoveVerticalFrog ? {...s, frog: {...s.frog, cy: e.moveY + s.frog.cy}} :
    //if neither options is selected
    s

  //update the view of the reducestate (which is the new state)
  function updateView(s: State): void {
    FROG.setAttribute('transform', `translate(${s.frog.cx}, ${s.frog.cy})`)
  }

  //keep on updating the state and display the updated view each time
  const subscription = merge(startLeftMove, startRightMove, startDownMove, startUpMove).
  pipe(scan(reduceState, INITIAL_STATE)).subscribe(updateView);



  //CREATING CAR AND PLANK

  // try create 1 row
  

   
  
}



// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
