import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const FRONT_GIFT = "FRONT_GIFT";
const BACK_GIFT = "BACK_GIFT";
const TOP_GIFT = "TOP_GIFT";
const BOTTOM_GIFT = "BOTTOM_GIFT";
const RIGHT_GIFT = "RIGHT_GIFT";
const LEFT_GIFT = "LEFT_GIFT";
const YOU_WIN = "YOU WIN!!!";
const YOU_LOSE = "YOU LOSE";

const params = {
    numberOfDice: 1,
    segments: 80,
    edgeRadius: .12,
    startTime: performance.now(),
    spinTime: 0,
    frontGift: FRONT_GIFT,
    backGift: BACK_GIFT,
    topGift: TOP_GIFT,
    bottomGift: BOTTOM_GIFT,
    rightGift: RIGHT_GIFT,
    leftGift: LEFT_GIFT,
    diceSize: 1,
    xyz: 2,
    isWin: 1,
    result: FRONT_GIFT,
    isAnimate: false,
};

let spinTimeInput:HTMLInputElement | null;
let diceSizeInput:HTMLInputElement | null;

let frontGiftInput:HTMLInputElement | null;
let backGiftInput:HTMLInputElement | null;
let topGiftInput:HTMLInputElement | null;
let bottomGiftInput:HTMLInputElement | null;
let rightGiftInput:HTMLInputElement | null;
let leftGiftInput:HTMLInputElement | null;

let frontSelectBtn:HTMLButtonElement | null;
let backSelectBtn:HTMLButtonElement | null;
let topSelectBtn:HTMLButtonElement | null;
let bottomSelectBtn:HTMLButtonElement | null;
let rightSelectBtn:HTMLButtonElement | null;
let leftSelectBtn:HTMLButtonElement | null;

let rollBtn:HTMLButtonElement | null;

var actionDiv:HTMLDivElement | null;
let resultSpan:HTMLSpanElement | null;
let backBtn:HTMLButtonElement | null;
let againBtn:HTMLButtonElement | null;


let renderer, scene, camera, diceMesh, physicsWorld, intervalID, myDice;
// const diceArray = [];

const canvas1 = document.createElement('canvas'), ctx1 = canvas1.getContext('2d');  //  right
const canvas2 = document.createElement('canvas'), ctx2 = canvas2.getContext('2d');  //  left
const canvas3 = document.createElement('canvas'), ctx3 = canvas3.getContext('2d');  //  top
const canvas4 = document.createElement('canvas'), ctx4 = canvas4.getContext('2d');  //  bottom
const canvas5 = document.createElement('canvas'), ctx5 = canvas5.getContext('2d');  //  front
const canvas6 = document.createElement('canvas'), ctx6 = canvas6.getContext('2d');  //  back

const changeCanvas = (ctx: { font: string; fillStyle: string; fillRect: (arg0: number, arg1: number, arg2: number, arg3: number) => void; textAlign: string; textBaseline: string; fillText: (arg0: any, arg1: number, arg2: number) => void; }, gift: any) => {
    if(ctx) {
        ctx.font = '20pt Arial';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas1.width, canvas1.height);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gift, canvas1.width / 2, canvas1.height / 2);
    }
};

changeCanvas(ctx1, params.rightGift);
changeCanvas(ctx2, params.leftGift);
changeCanvas(ctx3, params.topGift);
changeCanvas(ctx4, params.bottomGift);
changeCanvas(ctx5, params.frontGift);
changeCanvas(ctx6, params.backGift);

const texture1 = new THREE.Texture(canvas1);
const texture2 = new THREE.Texture(canvas2);
const texture3 = new THREE.Texture(canvas3);
const texture4 = new THREE.Texture(canvas4);
const texture5 = new THREE.Texture(canvas5);
const texture6 = new THREE.Texture(canvas6);


const initScene = (canvasEL:HTMLCanvasElement) => {
    params.startTime = performance.now();
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvasEL
    });
    renderer.shadowMap.enabled = true
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 300)
    camera.position.set((22 - params.diceSize) * 0.2, (22 - params.diceSize) * 0.2, (22 - params.diceSize) * 0.2);
    camera.lookAt(0, -1, 0);

    updateSceneSize();



    //  directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0xffffff, 1);
    topLight.position.set(10, 15, 0);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 2048;
    topLight.shadow.mapSize.height = 2048;
    topLight.shadow.camera.near = 3;
    topLight.shadow.camera.far = 400;
    scene.add(topLight);

    //  hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000);
    hemisphereLight.position.set(1, 1, 1);
    scene.add(hemisphereLight);

    
    createFloor();
    diceMesh = createDiceMesh();

    // for (let i = 0; i < params.numberOfDice; i++) {
    //     diceArray.push(createDice());
    //     addDiceEvents(diceArray[i]);
    // }

    myDice = createDice();
    addDiceEvents(myDice);

    params.xyz = getRandomInt(0, 59) % 6;
    intervalID = setInterval(determinXYZ, 1000);

    changeCanvas(ctx1, params.rightGift);
    changeCanvas(ctx2, params.leftGift);
    changeCanvas(ctx3, params.topGift);
    changeCanvas(ctx4, params.bottomGift);
    changeCanvas(ctx5, params.frontGift);
    changeCanvas(ctx6, params.backGift);
    texture1.needsUpdate = true;
    texture2.needsUpdate = true;
    texture3.needsUpdate = true;
    texture4.needsUpdate = true;
    texture5.needsUpdate = true;
    texture6.needsUpdate = true;
    params.isAnimate = true;
    (canvasEL.style as CSSStyleDeclaration).display = 'block';
    animate();
}

const determinXYZ = () => {
    let rand = getRandomInt(0, 59);
    params.xyz = rand % 6;
}

const initPhysics = () => {
    physicsWorld = new CANNON.World({
        allowSleep: true,
        gravity: new CANNON.Vec3(0, -20, 0),
    })
    physicsWorld.defaultContactMaterial.restitution = .3;
}

const addDiceEvents = (dice) => {
    dice.body.addEventListener('sleep', (e) => {

        dice.body.allowSleep = false;

        const euler = new CANNON.Vec3();
        e.target.quaternion.toEuler(euler);

        const eps = .1;
        let isZero = (angle) => Math.abs(angle) < eps;
        let isHalfPi = (angle) => Math.abs(angle - .5 * Math.PI) < eps;
        let isMinusHalfPi = (angle) => Math.abs(.5 * Math.PI + angle) < eps;
        let isPiOrMinusPi = (angle) => (Math.abs(Math.PI - angle) < eps || Math.abs(Math.PI + angle) < eps);

        // top
        // back
        // front
        // bottom
        // right
        // left


        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
                params.isWin = topSelectBtn?.value;
                params.result = params.topGift;
                // alert(topSelectBtn?.value);
            } else if (isHalfPi(euler.x)) {
                params.isWin = backSelectBtn?.value;
                params.result = params.backGift;
                // alert(backSelectBtn?.value);
            } else if (isMinusHalfPi(euler.x)) {
                params.isWin = frontSelectBtn?.value;
                params.result = params.frontGift;
                // alert(frontSelectBtn?.value);
            } else if (isPiOrMinusPi(euler.x)) {
                params.isWin = bottomSelectBtn?.value;
                params.result = params.bottomGift;
                // alert(bottomSelectBtn?.value);
            } else {
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
            params.isWin = rightSelectBtn?.value;
            params.result = params.rightGift;
            // alert(rightSelectBtn?.value);
        } else if (isMinusHalfPi(euler.z)) {
            params.isWin = leftSelectBtn?.value;
            params.result = params.leftGift;
            // alert(leftSelectBtn?.value);
        } else {
            dice.body.allowSleep = true;
        }

        if(actionDiv && actionDiv.style) {
            (actionDiv.style as CSSStyleDeclaration).display = 'block';
        }

        if(params.isWin == 1) {
            resultSpan!.innerHTML = YOU_WIN + ' ' + params.result;
        } else {
            resultSpan!.innerHTML = YOU_LOSE + ' ' + params.result;
        }

        params.isAnimate = false;

    });

}

const createFloor = () => {
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.ShadowMaterial({
            opacity: .1,
            // color: 0xff00ff
        }),
    )
    floor.receiveShadow = true;
    floor.position.y = -2;
    floor.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * .5);
    scene.add(floor);

    const floorBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    floorBody.position.copy(floor.position);
    floorBody.quaternion.copy(floor.quaternion);
    physicsWorld.addBody(floorBody);
}

const createDiceMesh = () => {
    const geometry = createBoxGeometry();

    const material = [
        new THREE.MeshStandardMaterial({map: texture1, metalness: 0, roughness: 0, color: 0xeeeeee}),
        new THREE.MeshStandardMaterial({map: texture2, metalness: 0, roughness: 0, color: 0xeeeeee}),
        new THREE.MeshStandardMaterial({map: texture3, metalness: 0, roughness: 0, color: 0xeeeeee}),
        new THREE.MeshStandardMaterial({map: texture4, metalness: 0, roughness: 0, color: 0xeeeeee}),
        new THREE.MeshStandardMaterial({map: texture5, metalness: 0, roughness: 0, color: 0xeeeeee}),
        new THREE.MeshStandardMaterial({map: texture6, metalness: 0, roughness: 0, color: 0xeeeeee}),
    ];
    
    diceMesh = new THREE.Mesh(geometry, material);
    diceMesh.castShadow = true;

    return diceMesh;
}

const createDice = () => {
    const mesh = diceMesh.clone();
    scene.add(mesh);

    const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(.5, .5, .5)),
        sleepTimeLimit: .5
    });

    // body.velocity.set(0, 0, 0);

    physicsWorld.addBody(body);

    return {mesh, body};
}

const createBoxGeometry = () => {

    let boxGeometry = new THREE.BoxGeometry(1, 1, 1, params.segments, params.segments, params.segments);

    const positionAttr = boxGeometry.attributes.position;

    const subCubeHalfSize = .5 - params.edgeRadius;


    for (let i = 0; i < positionAttr.count; i++) {

        let position = new THREE.Vector3().fromBufferAttribute(positionAttr, i);

        const subCube = new THREE.Vector3(Math.sign(position.x), Math.sign(position.y), Math.sign(position.z)).multiplyScalar(subCubeHalfSize);
        const addition = new THREE.Vector3().subVectors(position, subCube);

        if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.normalize().multiplyScalar(params.edgeRadius);
            position = subCube.add(addition);
        } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize) {
            addition.z = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.x = subCube.x + addition.x;
            position.y = subCube.y + addition.y;
        } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.y = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.x = subCube.x + addition.x;
            position.z = subCube.z + addition.z;
        } else if (Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.x = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.y = subCube.y + addition.y;
            position.z = subCube.z + addition.z;
        }

        positionAttr.setXYZ(i, position.x, position.y, position.z);
    }


    boxGeometry.deleteAttribute('normal');
    // boxGeometry.deleteAttribute('uv');
    boxGeometry = BufferGeometryUtils.mergeVertices(boxGeometry);

    boxGeometry.computeVertexNormals();

    return boxGeometry;
}

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}
const animate = () => {
    if(params.isAnimate == true) {
        // let dice = diceArray[0];
        let curtime = performance.now();
        let elaptime = curtime - params.startTime;
        physicsWorld.step(1 / 60);
        if(elaptime < params.spinTime) {    
            myDice.body.velocity.set(0, 0.3, 0);
    
            if(params.xyz == 0) {
                myDice.body.angularVelocity.set(Math.PI * 3, 0, 0);
            } else if(params.xyz == 1) {
                myDice.body.angularVelocity.set(0, Math.PI * 3, 0);
            } else if(params.xyz == 2) {
                myDice.body.angularVelocity.set(0, 0, Math.PI * 3);
            } else if(params.xyz == 3) {
                myDice.body.angularVelocity.set(-Math.PI * 3, 0, 0);
            } else if(params.xyz == 4) {
                myDice.body.angularVelocity.set(0, -Math.PI * 3, 0);
            } else {
                myDice.body.angularVelocity.set(0, 0, -Math.PI * 3);
            }
        } else {
            clearInterval(intervalID);
            myDice.body.angularVelocity.set(0, 0, 0);
        }
    
        myDice.mesh.position.copy(myDice.body.position)
        myDice.mesh.quaternion.copy(myDice.body.quaternion)
    
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
}

const updateSceneSize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xbbbbbb);
}




const initElements = () => {
    spinTimeInput = document.querySelector("#spin_time_input");
    diceSizeInput = document.querySelector("#dice_size_input");

    frontGiftInput = document.querySelector("#front_gift_input");
    backGiftInput = document.querySelector("#back_gift_input");
    topGiftInput = document.querySelector("#top_gift_input");
    bottomGiftInput = document.querySelector("#bottom_gift_input");
    rightGiftInput = document.querySelector("#right_gift_input");
    leftGiftInput = document.querySelector("#left_gift_input");

    frontSelectBtn = document.querySelector("#front_select_btn")
    backSelectBtn = document.querySelector("#back_select_btn")
    topSelectBtn = document.querySelector("#top_select_btn")
    bottomSelectBtn = document.querySelector("#bottom_select_btn")
    rightSelectBtn = document.querySelector("#right_select_btn")
    leftSelectBtn = document.querySelector("#left_select_btn")

    rollBtn = document.querySelector("#roll_btn");

    actionDiv = document.querySelector("#action_div");
    resultSpan = document.querySelector("#result_span");
    backBtn = document.querySelector("#back_btn");
    againBtn = document.querySelector("#again_btn");
}

const initParams = () => {
    // init spin time to 3s
    if(spinTimeInput) {
        spinTimeInput.value = "3";
        params.spinTime = 3000;    
    }

    // init dice size num to 1
    if(diceSizeInput) {
        diceSizeInput.value = "1";
        params.diceSize = 1;
    }

    // init gifts
    if(frontGiftInput) {
        frontGiftInput.value = FRONT_GIFT;
        params.frontGift = FRONT_GIFT;    
    }

    if(backGiftInput) {
        backGiftInput.value = BACK_GIFT;
        params.backGift = BACK_GIFT;    
    }

    if(topGiftInput) {
        topGiftInput.value = TOP_GIFT;
        params.topGift = TOP_GIFT;    
    }

    if(bottomGiftInput) {
        bottomGiftInput.value = BOTTOM_GIFT;
        params.bottomGift = BOTTOM_GIFT;    
    }

    if(rightGiftInput) {
        rightGiftInput.value = RIGHT_GIFT;
        params.rightGift = RIGHT_GIFT;    
    }

    if(leftGiftInput) {
        leftGiftInput.value = LEFT_GIFT;
        params.leftGift = LEFT_GIFT;    
    }

    params.isAnimate = true;
}

//  add or remove winning faces
const moveWinningFaces = (face:HTMLButtonElement) => {
    const winningFacesDiv:HTMLDivElement | null = document.querySelector("#winning_faces_div");
    const addingFacesDiv:HTMLDivElement | null = document.querySelector("#adding_faces_div");
    let flag = true;

    face.addEventListener("click", () => {
        if(flag) {
            winningFacesDiv?.appendChild(face);
            face.value = "1"
        } else {
            addingFacesDiv?.appendChild(face);
            face.value = "0"
        }

        flag = !flag;
    });
}

//  init const
export const init = (canvasEL:HTMLCanvasElement) => {
    initElements();
    initParams();
    
    spinTimeInput?.addEventListener("change", () => {
        params.spinTime = spinTimeInput ? parseInt(spinTimeInput.value) * 1000 : 0;
    });

    diceSizeInput?.addEventListener("change", () => {
        params.diceSize = diceSizeInput ? parseInt(diceSizeInput.value) : 0;
    });

    frontGiftInput?.addEventListener("change", () => {
        params.frontGift = frontGiftInput ? frontGiftInput.value : '';
    });

    backGiftInput?.addEventListener("change", () => {
        params.backGift = backGiftInput ? backGiftInput.value : '';

    });

    topGiftInput?.addEventListener("change", () => {
        params.topGift = topGiftInput ? topGiftInput.value : '';

    });

    bottomGiftInput?.addEventListener("change", () => {
        params.bottomGift = bottomGiftInput ? bottomGiftInput.value : '';

    });

    rightGiftInput?.addEventListener("change", () => {
        params.rightGift = rightGiftInput ? rightGiftInput.value : '';

    });

    leftGiftInput?.addEventListener("change", () => {
        params.leftGift = leftGiftInput ? leftGiftInput.value : '';

    });

    if(frontSelectBtn) {
        moveWinningFaces(frontSelectBtn);
    }

    if(backSelectBtn) {
        moveWinningFaces(backSelectBtn);
    }

    if(topSelectBtn) {
        moveWinningFaces(topSelectBtn);
    }

    if(bottomSelectBtn) {
        moveWinningFaces(bottomSelectBtn);
    }

    if(rightSelectBtn) {
        moveWinningFaces(rightSelectBtn);
    }

    if(leftSelectBtn) {
        moveWinningFaces(leftSelectBtn);
    }

    rollBtn?.addEventListener("click", () => {
        if(actionDiv && actionDiv.style) {
            (actionDiv.style as CSSStyleDeclaration).display = 'none';
        }
        if(params.spinTime <= 0 || Number.isNaN(params.spinTime)) {
            alert("Please select a correct spin time");
        } else {
            initPhysics();
            // console.log(params);
            initScene(canvasEL);
            // console.log(params);
        }
    });

    backBtn?.addEventListener("click", () => {
        if(actionDiv && actionDiv.style) {
            (actionDiv.style as CSSStyleDeclaration).display = 'none';
        }

        (canvasEL.style as CSSStyleDeclaration).display = 'none';
    });

    againBtn?.addEventListener("click", () => {
        if(actionDiv && actionDiv.style) {
            (actionDiv.style as CSSStyleDeclaration).display = 'none';
        }
        // initPhysics();
        // initScene(canvasEL);
        params.startTime = performance.now();
        params.isAnimate = true;
        if(actionDiv && actionDiv.style) {
            (actionDiv.style as CSSStyleDeclaration).display = 'none';
        }
        if(params.spinTime <= 0 || Number.isNaN(params.spinTime)) {
            alert("Please select a correct spin time");
        } else {
            initPhysics();
            initScene(canvasEL);
        }
    });
}


