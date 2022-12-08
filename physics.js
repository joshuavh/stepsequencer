const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
const links = document.getElementsByClassName( "link-container" );
let buttonLength = vw - 60;
if (buttonLength > 420){
    buttonLength = 420;
}


// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: vw,
        height: vh,
        showAngleIndicator: false,
        showVelocity: false,
        wireframes: false,
        background: 'rgba(0,0,0,0)'
    }
});

// create two boxes and a ground

var boxB = Bodies.rectangle(vw/2, 170, 270, 20, { 
    isStatic: true,
    render: {visible: false},
});

var prevBox = boxB; 
for (let i = 0; i < 5; i++){
    var boxA = new Bodies.rectangle(vw/2 + Math.random() * 30, 250 + i*80, buttonLength, 60, {
        render: {
            visible: false,
       }
    });
    Composite.add(engine.world, [boxA]);

    options = {
        bodyA: boxA,
        bodyB: prevBox,
        length: 80,
        stiffness: 0.04,
        render: { 
            type: 'line', 
            anchors: false,
            lineWidth: 1.5,
            strokeStyle: 'white'
        }
    }
    
    var constraint = Constraint.create(options);
    Composite.add(engine.world, [constraint]);

    prevBox = boxA;
}

// var leftWall = Bodies.rectangle(-30, vh/2, 60, vh, { 
//     isStatic: true,
//     constraint: {
//         render: {visible: false}
//     } 
// });
// var rightWall = Bodies.rectangle(vw+30, vh/2, 60, vh, { 
//     isStatic: true,
//     constraint: {
//         render: {visible: false}
//     }  
// });

let mouse = Matter.Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        render: {visible: false}
    }
})
render.mouse = mouse;

// add all of the bodies to the world
Composite.add(engine.world, [boxB, mouseConstraint]);
// Composite.add(engine.world, [boxB, leftWall, rightWall, mouseConstraint])

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

let start, previousTimeStamp;
var allbodies = Composite.allBodies(engine.world);


function step(timestamp) {
  if (start === undefined) {
    start = timestamp;
    }
  const elapsed = timestamp - start;

  if (previousTimeStamp !== timestamp) {
    for (let i = 0; i < links.length; i++){
        links[i].style.top = allbodies[i].position.y + "px";
        links[i].style.left = allbodies[i].position.x + "px";
        links[i].style.transform = "rotate(" + allbodies[i].angle *56 +"deg)";
    }
  }
    previousTimeStamp = timestamp;
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);

const delta = 6;
let startX;
let startY;
let id = 0;

Matter.Events.on(mouseConstraint, 'mousedown' || 'touchstart', (event) => {
 if (mouseConstraint.body) {
    id = mouseConstraint.body.id/2 - 1;
    console.log(id);
    links[id].style.filter = "brightness(85%)";
    startX = mouse.position.x;
    startY = mouse.position.y;
 }
});

let linkto; 

Matter.Events.on(mouseConstraint, 'mouseup' || 'touchend', () => {
    links[id].style.filter = "brightness(100%)";

    const diffX = Math.abs(mouse.position.x - startX);
    const diffY = Math.abs(mouse.position.y - startY);
  
    if (diffX < delta && diffY < delta) {
        linkto = links[id].href;
        location.href = linkto;
    }
});


window.addEventListener('deviceorientation', handleOrientation);


function handleOrientation(event) {
  const alpha = event.alpha;
  document.getElementById("alphaRotation").innerHTML = alpha;
  if (alpha < 180){
    engine.world.gravity.x = -alpha/90;
  }
  else{
    engine.world.gravity.x = (360-alpha)/90;
  }
  document.getElementById("alphaRotation").innerHTML = engine.world.gravity.x;
}

function requestPermission() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // Handle iOS 13+ devices.
      DeviceMotionEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            window.addEventListener('devicemotion', handleOrientation);
          } else {
            console.error('Request to access the orientation was rejected');
          }
        })
        .catch(console.error);
    } else {
      // Handle regular non iOS 13+ devices.
      window.addEventListener('devicemotion', handleOrientation);
    }
  }