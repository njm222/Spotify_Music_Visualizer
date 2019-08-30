//Constants

const width = window.innerWidth;
const height = window.innerHeight;

// Audio Variables
let currFreq = 0;
let lowAvFreq = 0;
let highAvFreq = 0;
let totalFreq = 0;
let avFreq = 0;
let peak = 0;
let rms = 0;
let rmslow = 20;
let rmshigh = 80;

//Spotify features and analysis variables
let g_danceability = 0;
let g_energy = 0;
let g_valence = 0;
let g_tempo = 0;
let g_section = 0;
let g_sections = 0;
let g_bar = 0;
let g_bars = 0;
let g_beat = 0;
let g_beats = 0;
let g_tatum = 0;
let g_tatums = 0;
let g_segment = 0;
let g_segments = 0;

//Visualizer variables
let trackCounter = 0;
let trackEnd = 999999;
let isPaused = true;
let isChangingShape = false;
let isVisualizer = false;
let isLiveVisualizer = false;

let shapeMax = 529;
let layerMarker = [];

let tatumAv = 0.93;
let tatumVar = 0;
let beatAv = 0.93;
let beatVar = 0;

let sectionEnd = 0;

let colourModifier = 0;

let barStart = 0;
let barEnd = 0;
let barCounter = 0;
let barConfidence = 0;

let beatStart = 0;
let beatEnd = 0;
let beatCounter = 0;
let beatConfidence = 0;

let tatumStart = 0;
let tatumEnd = 0;
let tatumCounter = 0;
let tatumConfidence = 0;

let toggleZoom = true;
let toggleRotate = true;

let randomizeColour = true;
let randomizeMode = true;

// Rotation Variables
let spinr, spinf = 0;
const spin2 = 0.03;
const spin3 = 0.015;
const spin4 = 0.075;
const spin5 = 0.0025;
const spin6 = 0.001;

let zoomIntensity = 30;
let xx = 0.4;
let zz = 0.5;
let cc = 7500;
let tc = 0.35;
let bc = 0.5;

let randomizer = false;
let changedColour = true;
let setLargeShape = false;

let shapeArr = [];
let shapeType;
let shapeIncrement = 1;
let colourKey = 7;
let freqKey = 10;
let modeKey = {
    keyInternal: 1,
    keyListener: function (val) {},
    set key(val) {
        this.keyInternal = val;
        this.keyListener(val);
    },
    get key() {
        return this.keyInternal;
    },
    registerListener: function (listener) {
        this.keyListener = listener;
    }
};

modeKey.registerListener(function (val) {
    console.log("modeKey changed to " + val);
    resetMode();

    $('.visualizerMode').css('color', '#FFF');
    $('#mode_' + val).css('color', '#3AD36B');
    if(modeKey.key < 6) {
        shapeCounter = 0; // reset shape
        $('#shapeType').show();
    } else {
        $('#shapeType').hide();
    }
});

let points = 1;
let detail = 1;
let cameraRandom = Math.floor(Math.random() * 7);

//Scene Setup
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75,width/height, 0.1, 1000);
//camera.focalLength = -90;
let renderer = new THREE.WebGLRenderer();
//renderer.setPixelRatio( window.devicePixelRatio );
let controls = new THREE.OrbitControls(camera);

//Stats
/*javascript:(function(){let script=document.createElement('script');script.onload=function(){let stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()*/

//Material
let colour = new THREE.Color("rgb(256,256,256)");
let basicMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
let lambertMaterial = new THREE.MeshLambertMaterial( { color: 0x000000 } );
let phongMaterial = new THREE.MeshPhongMaterial( { color: 0x000000 } );
let depthMaterial = new THREE.MeshDepthMaterial( { wireframe: true } );

//Geometry
let cubeGeo = new THREE.BoxGeometry(10,10,10);
let octaGeo = new THREE.OctahedronGeometry(10, 0);
let dodecaGeo = new THREE.DodecahedronGeometry(10, 0);
let sphereGeo = new THREE.SphereGeometry(5, 32, 32);
let tetraGeo = new THREE.TetrahedronGeometry(10, 0);

//Light
let l1 = new THREE.PointLight(0xffffff);
let spotLight = new THREE.SpotLight(0xffffff);

let noise = new SimplexNoise(Math.random());

//Cube Grid
function addShape(shapeType) {

    if(shapeType == 1) {
        for(let i = 0; i < shapeMax; i++) {
            shapeArr.push(new THREE.Mesh(cubeGeo, new THREE.MeshLambertMaterial( { color: 0x000000 } )));
            scene.add(shapeArr[i]);
            console.log("added new cube");
        }
    } else if(shapeType == 2) {
        for(let i = 0; i < shapeMax; i++) {
            shapeArr.push(new THREE.Mesh(octaGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })));
            scene.add(shapeArr[i]);
            console.log("added new octa");
        }
    } else if(shapeType == 3) {
        for(let i = 0; i < shapeMax; i++) {
            shapeArr.push(new THREE.Mesh(sphereGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })));
            scene.add(shapeArr[i]);
            console.log("added new sphere");
        }
    } else if(shapeType == 4) {
        for(let i = 0; i < shapeMax; i++) {
            shapeArr.push(new THREE.Mesh(tetraGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })));
            scene.add(shapeArr[i]);
            console.log("added new tetra");
        }
    } else {
        for(let i = 0; i < shapeMax; i++) {
            shapeArr.push(new THREE.Mesh(dodecaGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })));
            scene.add(shapeArr[i]);
            console.log("added new dodeca");
        }
    }
}

function changeShape(shapeType) {
    isChangingShape = true;
    removeShape();
    addShape(shapeType);
    setShapePosition();
    isChangingShape = false;
}

function removeShape() {
    for(let i = 0; i < shapeMax; i++) {
        scene.remove(shapeArr[i]);
        shapeArr[i].geometry.dispose();
        shapeArr[i].material.dispose();
    }
    shapeArr = [];
}

//include a removeShape function

function setShapePosition() {
    //variables
    let a = 0;
    let f = 1;
    let x = 0;
    let y = 0;
    let z = 0;
    let distance = 20;
    let shapeCount = 0;
    let lim = 12;

    //layer 0
    shapeArr[shapeCount++].position.set(x,y,z);
    x = x + distance;

    layerMarker[0] = 1;

    //layer 1-<lim
    for(f; f < lim; f++){
        for(a = 1; a < 2*f; a++) {
            shapeArr[shapeCount++].position.set(x,y,z);
            y = y - distance;
        }
        for(a = 0; a < 2*f; a++) {
            shapeArr[shapeCount++].position.set(x,y,z);
            x = x - distance;
        }
        for(a = 0; a < 2*f; a++) {
            shapeArr[shapeCount++].position.set(x,y,z);
            y = y + distance;
        }
        for(a = -1; a < 2*f; a++) {
            shapeArr[shapeCount++].position.set(x,y,z);
            x = x + distance;
        }

        layerMarker[f] = shapeCount;
        console.log(shapeCount);
        z = z - distance;
    }
    console.log(layerMarker);
}

function positionCamera(cameraRandom) {
    switch (cameraRandom) {
        case 0:
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 300;
            spotLight.position.set(0, 0, 350);
            break;
        case 1:
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = -300;
            spotLight.position.set(0, 0, -350);
            break;
        case 2:
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = -300;
            spotLight.position.set(0, 0, -350);
            break;
        case 3:
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 300;
            spotLight.position.set(-peak-300, peak+300, 350);
            break;
        case 4:
            camera.position.x = 0;
            camera.position.y = 90;
            camera.position.z = 0;
            spotLight.position.set(Math.random() * (180 + 180) -180, 100, Math.random() * (180 + 180) -180);
            break;
        case 5:
            camera.position.x = 0;
            camera.position.y = -90;
            camera.position.z = 0;
            spotLight.position.set(Math.random() * (180 + 180) -180, -100, Math.random() * (180 + 180) -180);
            break;
        case 6:
            camera.position.x = 90;
            camera.position.y = 0;
            camera.position.z = 0;
            spotLight.position.set(100, Math.random() * (180 + 180) -180, Math.random() * (180 + 180) -180);
            break;
        case 7:
            camera.position.x = -90;
            camera.position.y = 0;
            camera.position.z = 0;
            spotLight.position.set(-100, Math.random() * (180 + 180) -180, Math.random() * (180 + 180) -180);
            break;
        default:
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 90;
            spotLight.position.set(Math.random() * (180 + 180) -180, Math.random() * (180 + 180) -180, 100);
    }
}

//Variable width/height canvas
window.addEventListener('resize', re => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    /*effect3d.setSize(width, height);*/
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

function rgbToHexHelper(num){
    let hex = Math.ceil(num).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r,g,b) {
    return ("0x" + rgbToHexHelper(r) + rgbToHexHelper(g) + rgbToHexHelper(b));
}

function changeColour(currShape, currColour) {
    currShape.material.color.setHex(currColour);
}

function setColour(key) {
    if(beatConfidence > (beatAv - beatVar/2)) {
        colourModifier = (beatEnd-trackCounter)/4;
        //console.log("colourModifier" + colourModifier);
    }

    switch (key) {
        case 1:
            colour = rgbToHex(avFreq, avFreq, Math.pow(lowAvFreq, 1.12));
            break;
        case 2:
            colour = rgbToHex(avFreq, Math.pow(lowAvFreq, 1.12), avFreq);
            break;
        case 3:
            colour = rgbToHex(Math.pow(lowAvFreq, 1.12), avFreq, avFreq);
            break;
        case 4:
            colour = rgbToHex(avFreq/2, avFreq/2, highAvFreq + colourModifier);
            break;
        case 5:
            colour = rgbToHex(avFreq/2, highAvFreq + colourModifier, avFreq/2);
            break;
        case 6:
            colour = rgbToHex(highAvFreq + colourModifier, avFreq/2, avFreq/2);
            break;
        case 7:
            colour = rgbToHex(rms, avFreq, peak);
            break;
        case 8:
            colour = rgbToHex(peak, avFreq, rms);
            break;
        case 9:
            colour = rgbToHex(avFreq*2, avFreq/10, avFreq*3);
            break;
        case 10:
            colour = rgbToHex(currFreq[13], currFreq[9], currFreq[5]);
            break;
        default:
            colour = rgbToHex(currFreq[4], currFreq[8], currFreq[12]);
    }

}

function setMode(key) {
    switch (key) {
        case 1:
            mode1();
            break;
        case 2:
            mode2();
            break;
        case 3:
            mode3();
            break;
        case 4:
            mode4();
            break;
        case 5:
            mode5();
            break;
        case 6:
            changeColourLayer6();
            break;
        case 7:
            changeColourLayer7();
            break;
        case 8:
            changeColourLayer8();
            break;
        case 9:
            changeColourLayer001();
            break;
        default:
            changeColourLayer1();
    }
}

function changePoints(currShape, currPoints) {
    currShape.material.size = currPoints;
}

function changeShapeType(currDetail, currShape, shapeType) {
    scene.remove(shapeArr[currShape]);
    if(shapeType > 3) {
        shapeArr[currShape] = new THREE.Points(new THREE.OctahedronGeometry(10, currDetail), new THREE.PointsMaterial({size: 1, color: 0x000000}));
    } else {
        shapeArr[currShape] = new THREE.Mesh(cubeGeo, new THREE.MeshLambertMaterial( { color: 0x000000 } ));
    }
    scene.add(shapeArr[currShape]);
}

function rotateShape(shape) {
    spinf = currFreq[freqKey];

    if(spinr % 2 == 0) {
        if(spinf > 150) {
            if (spinf > 200) {
                shape.rotation.x -= spin3;
                shape.rotation.y -= spin2;
                shape.rotation.z -= spin3;
            } else {
                shape.rotation.x -= spin4;
                shape.rotation.y -= spin3;
                shape.rotation.z -= spin4;
            }
        } else {
            if (spinf > 100) {
                shape.rotation.x -= spin5;
                shape.rotation.y += spin3;
                shape.rotation.z -= spin6;
            } else {
                shape.rotation.x -= spin6;
                shape.rotation.y += spin4;
                shape.rotation.z -= spin5;
            }
        }
    } else {
        if(spinf > 150) {
            if (spinf > 200) {
                shape.rotation.x += spin3;
                shape.rotation.y += spin2;
                shape.rotation.z += spin3;
            } else {
                shape.rotation.x += spin4;
                shape.rotation.y += spin3;
                shape.rotation.z += spin4;
            }
        } else {
            if (spinf > 100) {
                shape.rotation.x += spin5;
                shape.rotation.y -= spin3;
                shape.rotation.z += spin6;
            } else {
                shape.rotation.x += spin6;
                shape.rotation.y -= spin4;
                shape.rotation.z += spin5;
            }
        }
    }
}

function getData() {
    rms = 0;
    peak = 0;
    analyser.getByteFrequencyData(frequencyData);
    //smooth evelope this data
    currFreq = frequencyData;
    totalFreq = 0;
    highAvFreq = 0;

    for(let i = 0; i < (bufferLength/32); i++){
        totalFreq += frequencyData[i];
        lowAvFreq += frequencyData[i] * frequencyData[i];
        rms += frequencyData[i] * frequencyData[i];
        if(frequencyData[i] > peak){
            peak = frequencyData[i];
        }
    }

    lowAvFreq = Math.sqrt(lowAvFreq/(bufferLength/32));

    for(let i = (bufferLength/32); i < (bufferLength/32)*4; i++) {
        totalFreq += frequencyData[i];
        highAvFreq += frequencyData[i] * frequencyData[i];
        rms += frequencyData[i] * frequencyData[i];
        if(frequencyData[i] > peak){
            peak = frequencyData[i];
        }
    }

    highAvFreq = Math.sqrt(highAvFreq/((bufferLength/32)*3));

    for(let i = (bufferLength/32)*4; i < bufferLength; i++) {
        totalFreq += frequencyData[i];
        rms += frequencyData[i] * frequencyData[i];
        if(frequencyData[i] > peak){
            peak = frequencyData[i];
        }
    }

    avFreq = totalFreq/bufferLength; // Average Frequency
    rms /= bufferLength;
    rms = Math.sqrt(rms); // Volume

    //console.log("low " + lowAvFreq);
    //console.log("high " + highAvFreq);
    //console.log("av " + avFreq);
    //console.log("rms " + rms);
    //console.log(peak);

    spotLight.intensity = rms/15;

    if(rms < rmslow) {
        analyser.minDecibels -= 1;
        rmslow--;
        rmshigh = 80;
        analyser.maxDecibels = -30;
        spotLight.intensity -= .5;
        //decrease light
    } else if(rms > rmshigh) {
        analyser.maxDecibels += 1;
        rmshigh++;
        rmslow = 20;
        analyser.minDecibels = -85;
        //increase light
        spotLight.intensity += .5;
    }

}

function changeCameraRotation() {
    if(beatConfidence < 0.9) {
        let rotateNoiseX = noise.noise3D(Date.now()/5000, Date.now()/5000, Date.now()/5000);
        let rotateNoiseY = noise.noise3D((Date.now()+500)/5000, (Date.now()+500)/5000, (Date.now()+500)/5000);
        let rotateNoiseZ = noise.noise3D((Date.now()+1500)/5000, (Date.now()+1500)/5000, (Date.now()+1500)/5000);

        //console.log(rotateNoiseX + "\n" + rotateNoiseY + '\n' + rotateNoiseZ);


        camera.rotation.z = (Math.acos(rotateNoiseZ)/2)%(Math.PI/2);
        if(rotateNoiseY > 0)
            camera.rotation.y = (Math.sin(rotateNoiseY)/2)%(Math.PI/2);
        if(rotateNoiseX > 0)
            camera.rotation.x = (Math.sin(rotateNoiseX)/2)%(Math.PI/2);
    }
}

function changeCameraZoom() {

    if(beatConfidence > 0.75) {
        camera.zoom = Math.acos((beatEnd - trackCounter)/1000);
    } else if(tatumConfidence > (tatumAv + tatumVar)) {
        camera.zoom = Math.sin((tatumEnd - trackCounter)/1000);
        console.log('beat22222222222222');
    }

    /*if(beatConfidence > 0.95) {
        camera.zoom = 1 + Math.sin((rms + highAvFreq)/100) * ( Math.asin((beatEnd - trackCounter)/500))/!* * Math.sin((rms+highAvFreq)/75)*!/;
    } else if(beatConfidence > 0.9) {
        camera.zoom = 1 + Math.sin(highAvFreq/100) * ( Math.acos((beatEnd - trackCounter)/500))/!* * Math.sin(highAvFreq/75)*!/;
    } else if(beatConfidence > 0.85) {
        camera.zoom = 1 + Math.sin(highAvFreq/200) * ( Math.asin((beatEnd - trackCounter)/500))/!* * Math.sin(highAvFreq/150)*!/;
    } else if(beatConfidence > 0.8) {
        camera.zoom = 1 + Math.sin((rms + highAvFreq)/200) * ( Math.acos((beatEnd - trackCounter)/500))/!* * Math.sin((rms+highAvFreq)/150)*!/;
    }*/

}

function scaleShape(shapeToScale) {
    let sScale = Math.sqrt(lowAvFreq)/10;
    shapeToScale.scale.set(sScale,sScale,sScale);
}

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("main-visualizer").appendChild(renderer.domElement);

//Add & position assets to scene
camera.position.z = 90;

l1.position.set(300, 200);
scene.add(l1);

spotLight.position.set(0,0,90);
spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;
scene.add(spotLight);

addShape(1);
setShapePosition();

//Rendering
let run = function(){

    controls.update();

    if (!isPaused && !isChangingShape) {

        getData();
        changeBar();
        changeBeat();
        changeTatum();

        changeFreqMode();
        // change these to event listeners
        if(randomizeColour)
            setColourKey();
        if(randomizeMode)
            setModeKey();

        for(let i = 0; i < shapeArr.length; i++) {
            rotateShape(shapeArr[i]);
        }

        // Camera movement
        if(toggleZoom)
            changeCameraZoom();
        if(toggleRotate)
            changeCameraRotation();

        // need a check for if shapeCounter == 0
        // then 'reset' the layer (Maybe add a clear screen animation?)
        setMode(modeKey.key);
        setColour(colourKey);
    }

    camera.updateProjectionMatrix();
    requestAnimationFrame(run);
    renderer.render(scene, camera);
    //effect3d.render(scene, camera);
};
run();