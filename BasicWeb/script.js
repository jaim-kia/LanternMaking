const lanternParts = {
    top: {
        images: [
            "/Assets/Lantern/lantern-top.png",
            "/Assets/Lantern/lantern-top_ALT.png",
        ],
        currentIndex: 0,
        element: document.getElementById('lanternTop')
    },
    tassel: {
        images: [
            "/Assets/Lantern/lantern-tassel-BLUE.png",
            "/Assets/Lantern/lantern-tassel-GREEN.png",
            "/Assets/Lantern/lantern-tassel-RED.png",
        ],
        currentIndex: 0,
        element: document.getElementById('lanternTassel')
    },
    bottom: {
        images: [
            "/Assets/Lantern/lantern-bottom.png",
            "/Assets/Lantern/lantern-bottom_ALT.png",
        ],
        currentIndex: 0,
        element: document.getElementById('lanternBottom')
    }
};

// Function to update lantern part
function updateLanternPart(part, direction) {
    const partData = lanternParts[part];
    
    if (direction === 'next') {
        partData.currentIndex = (partData.currentIndex + 1) % partData.images.length;
    } else {
        partData.currentIndex = (partData.currentIndex - 1 + partData.images.length) % partData.images.length;
    }
    
    const newSrc = partData.images[partData.currentIndex];
    partData.element.src = newSrc;
}

// Add event listeners to navigation buttons
const navButtons = document.querySelectorAll('.lantern-nav-btn');
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const part = button.getAttribute('data-part');
        const direction = button.classList.contains('lantern-nav-right') ? 'next' : 'prev';
        updateLanternPart(part, direction);
    });
});

const canvas = 
    document.querySelector("canvas"),
toolBtns = 
    document.querySelectorAll(".toolbar-option.tool"),
fillColor = 
    document.querySelector("#fill-color"),
sizeSlider = 
    document.querySelector("#size-slider"),
colorBtns = 
    document.querySelectorAll(".toolbar-color"),
colorPicker = 
    document.querySelector("#color-picker"),
cleatCanvas = 
    document.querySelector(".clear-canvas"),
saveImage = 
    document.querySelector(".save-img"),
ctx = canvas.getContext("2d");

let frameImg = null;

// Shape management
let currentShapeIndex = 0;
const shapes = ['roundish', 'rectangular', 'hexagonal'];

//global variabels wiht default values
let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    previousTool = "brush",
    brushWidth = 5,
    selectedColor = "#000";

const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}

function adjustCanvasSize(width = 400, height = 300) {
    const desiredWidth = width;
    const desiredHeight = height;

    canvas.width = desiredWidth;
    canvas.height = desiredHeight;

    canvas.style.width = desiredWidth + "px";
    canvas.style.height = desiredHeight + "px";
    setCanvasBackground();
}

window.addEventListener("load", () => {
   adjustCanvasSize();
    // initialize selectedColor from toolbar swatch if present
    const initSwatch = document.querySelector('.toolbar-color.selected');
    if (initSwatch) {
        selectedColor = initSwatch.dataset.color || window.getComputedStyle(initSwatch).getPropertyValue('background-color');
    }
});


const drawRect = (e) => {
    // If fillColor isn't checked draw a react wiht 
    // border else draw rect wiht backgorund
    if (!fillColor.checked) {
        const width = prevMouseX - e.offsetX;
        const height = prevMouseY - e.offsetY;
        return ctx.strokeRect(e.offsetX, e.offsetY,
        width, height);

    }
    const width = prevMouseX - e.offsetX;
    const height = prevMouseY - e.offsetY;
    ctx.fillRect(e.offsetX, e.offsetY, width, height);
}

const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX -
    e.offsetX), 2) 
    + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawTriangle = (e) => {
    ctx.beginPath(); 
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY); 
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); 
    ctx.closePath(); 
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// Function to draw a square
const drawSquare = (e) => {
    const sideLength = Math.abs(prevMouseX - e.offsetX);
    ctx.beginPath();
    ctx.rect(e.offsetX, e.offsetY, sideLength, sideLength);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawLine = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

const pickColor = (e) => {
    const imageData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
    const data = imageData.data;
    const hex = '#' + [data[0], data[1], data[2]].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Update the custom color
    const customSwatch = document.querySelector('.toolbar-color.custom-color');
    customSwatch.style.background = hex;
    customColorManager.colorPicker.value = hex;
    
    // Select the custom color and update drawing color
    const prev = document.querySelector('.toolbar-color.selected');
    if (prev) prev.classList.remove('selected');
    customSwatch.classList.add('selected');
    selectedColor = hex;
    
    // Switch back to the previous tool
    const eyedropperTool = document.querySelector('#eyedropper');
    const previousToolElement = document.querySelector(`#${previousTool}`);
    
    eyedropperTool.classList.remove('active');
    previousToolElement.classList.add('active');
    selectedTool = previousTool;
}

const startDraw = (e) => {
    // If eyedropper, just pick the color and don't start drawing
    if (selectedTool === "eyedropper") {
        pickColor(e);
        return;
    }
    
    isDrawing = true;
    prevMouseX = e.offsetX; 
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width,
    canvas.height);
}

const drawPencil = (e) => {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" && selectedTool === "pencil" 
    || selectedTool === "eraser") {

        ctx.strokeStyle = selectedTool === "eraser" 
        ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(e);

    }
    else if (selectedTool === "circle") {
        drawCircle(e);

    } else if (selectedTool === "triangle") {
        drawTriangle(e);

    } else if (selectedTool === "square") {
        drawRect(e);
    } else if (selectedTool === "hexagon") {
        drawHexagon(e);
    } else if (selectedTool === "pentagon") {
        drawPentagon(e);
    } else if (selectedTool === "line") {
        drawLine(e);
    } else if (selectedTool === "arrow") {
        drawArrow(e);
    } else if (selectedTool === "eyedropper") {
        pickColor(e);
    } else if (selectedTool === "curve") {
        drawCurve(e);
    }
    else {
        drawPencil(e);

    }
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const prev = document.querySelector(".toolbar-option.tool.active");
        if (prev) prev.classList.remove("active");
        btn.classList.add("active");
        
        // Store previous tool if not switching from eyedropper
        if (selectedTool !== "eyedropper") {
            previousTool = selectedTool;
        }
        selectedTool = btn.id;
        console.log(selectedTool);

    });

});

// fill toggle (droplet) - sync with hidden checkbox #fill-color
const fillToggle = document.querySelector('#fill-toggle');
if (fillToggle) {
    // reflect initial state
    if (fillColor && fillColor.checked) fillToggle.classList.add('active');
    fillToggle.addEventListener('click', (ev) => {
        // toggle the hidden checkbox value
        if (fillColor) {
            fillColor.checked = !fillColor.checked;
            fillToggle.classList.toggle('active', fillColor.checked);
        } else {
            // fallback: toggle class
            fillToggle.classList.toggle('active');
        }
    });
}

    sizeSlider.addEventListener("change", () => 
    brushWidth = sizeSlider.value)

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const prev = document.querySelector(".toolbar-color.selected");
        if (prev) prev.classList.remove("selected");
        btn.classList.add("selected"); 
        selectedColor = window.getComputedStyle(btn)
        .getPropertyValue("background-color");
    });
});

// helper: convert rgb(...) to #rrggbb; leaves hex strings as-is
function rgbToHex(color) {
    if (!color) return color;
    color = color.trim();
    if (color.startsWith('#')) return color;
    const m = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (!m) return color;
    return '#' + [1,2,3].map(i => parseInt(m[i]).toString(16).padStart(2,'0')).join('');
}

const backgroundFiles = [
    "default",
    "bg-1.png",
    "bg-2.png",
];

const bgFolderPath = "../Assets/Backgrounds/";
let currentBgIndex = 0;
const drawingBoard = document.querySelector(".drawing-board");
const prevBgBtn = document.querySelector("#prev-bg");
const nextBgBtn = document.querySelector("#next-bg");

const updateBackground = () => {
    const fileName = backgroundFiles[currentBgIndex];

    if (fileName === "default") {
        // Reset to the solid green color
        drawingBoard.style.backgroundImage = "none";
        drawingBoard.style.backgroundColor = "#AA361A";
    } else {
        // Set the image
        // Note: We use replace to handle spaces in filenames if necessary
        drawingBoard.style.backgroundImage = `url('${bgFolderPath}${fileName}')`;
        console.log(`Set background to: ${bgFolderPath}${fileName}`);
    }
};

// Event Listener for Next Button
nextBgBtn.addEventListener("click", () => {
    currentBgIndex++;
    // If we reach the end, loop back to start
    if (currentBgIndex >= backgroundFiles.length) {
        currentBgIndex = 0;
    }
    updateBackground();
});

// Event Listener for Previous Button
prevBgBtn.addEventListener("click", () => {
    currentBgIndex--;
    // If we go below 0, loop to the end
    if (currentBgIndex < 0) {
        currentBgIndex = backgroundFiles.length - 1;
    }
    updateBackground();
});


// Custom Color Manager Class
class CustomColorManager {
    constructor() {
        this.colorPicker = document.querySelector('#color-picker');
        this.customSwatch = document.querySelector('.toolbar-color.custom-color');
        this.editBtn = document.querySelector('#edit-color');
        this.isPickerOpen = false;
        
        this.init();
    }

    init() {
        // When color changes, update swatch and selection
        this.colorPicker.addEventListener('change', (e) => {
            this.updateSwatch(e.target.value);
        });

        // Custom swatch click = select only, don't open picker
        this.customSwatch.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectCustomColor();
        });

        // Edit button click = open color picker
        this.editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openPicker();
        });
    }

    updateSwatch(hexColor) {
        this.customSwatch.style.background = hexColor;
        this.selectCustomColor();
        selectedColor = hexColor;
    }

    selectCustomColor() {
        const prev = document.querySelector('.toolbar-color.selected');
        if (prev) prev.classList.remove('selected');
        this.customSwatch.classList.add('selected');
    }

    openPicker() {
        // Remove pointer-events restriction temporarily
        this.colorPicker.style.pointerEvents = 'auto';
        this.colorPicker.click();
        
        // Re-apply restriction after picker closes
        setTimeout(() => {
            this.colorPicker.style.pointerEvents = 'none';
        }, 50);
    }
}

// Initialize custom color manager
const customColorManager = new CustomColorManager();

// Hide the color picker input by default
colorPicker.style.pointerEvents = 'none';

cleatCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setCanvasBackground();

})

saveImage.addEventListener("click", () => {
    const target = document.querySelector('.drawing-board');
    if (window.html2canvas) {
        html2canvas(target).then(domCanvas => {
            const link = document.createElement('a');
            link.download = `lantern-${Date.now()}.png`;
            link.href = domCanvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('html2canvas error:', err);
        });
    } else {
        // fallback to exporting only the raw canvas but composite frame if present
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const ectx = exportCanvas.getContext('2d');

        // white background
        ectx.fillStyle = '#fff';
        ectx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // draw user canvas
        ectx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

        // if a frame overlay exists, draw it over the canvas
        if (frameImg && frameImg.complete) {
            try {
                ectx.drawImage(frameImg, 0, 0, exportCanvas.width, exportCanvas.height);
            } catch (err) {
                console.warn('Could not draw frame onto export canvas:', err);
            }
        }

        const link = document.createElement("a");
        link.download = `lantern-${Date.now()}.png`;
        link.href = exportCanvas.toDataURL("image/png");
        link.click();
    }
})

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);

// Shape changing functionality
const shapePrevBtn = document.querySelector('#shape-prev');
const shapeNextBtn = document.querySelector('#shape-next');
const lanternTop = document.querySelector('.lantern-top');
const lanternBottom = document.querySelector('.lantern-bottom');
const lanternTassel = document.querySelector('.lantern-tassel');

// Define position offsets for each shape
const shapePositions = {
    roundish: {
        top: 'calc(50% - 450px + 100px)',
        bottom: 'calc(50% - 450px + 465px)',
        tassel: 'calc(50% - 450px + 500px)'
    },
    rectangular: {
        top: 'calc(50% - 450px + 83px)',
        bottom: 'calc(50% - 450px + 652px)',
        tassel: 'calc(50% - 450px + 687px)'
    },
    hexagonal: {
        top: 'calc(50% - 450px + 100px)',
        bottom: 'calc(50% - 450px + 480px)',
        tassel: 'calc(50% - 450px + 515px)'
    }
};

// Add CSS transitions for smooth animation
function initializeAnimations() {
    const elements = [lanternTop, lanternBottom, lanternTassel];
    elements.forEach(element => {
        if (element) {
            element.style.transition = 'top 0.5s ease-in-out';
        }
    });
}

function updateCanvasShape() {
    const shape = shapes[currentShapeIndex];
    // Remove all shape classes
    canvas.classList.remove('shape-roundish', 'shape-rectangular', 'shape-hexagonal');
    // Add current shape class
    canvas.classList.add(`shape-${shape}`);
    
    if (shape === 'roundish') {
        adjustCanvasSize(); // Width, Height for roundish
    } else if (shape === 'rectangular') {
        adjustCanvasSize(400, 450); // Width, Height for rectangular
    } else if (shape === 'hexagonal') {
        adjustCanvasSize(400, 300); // Width, Height for hexagonal
    }

    // Update lantern image positions with animation
    const positions = shapePositions[shape];
    if (lanternTop) lanternTop.style.top = positions.top;
    if (lanternBottom) lanternBottom.style.top = positions.bottom;
    if (lanternTassel) lanternTassel.style.top = positions.tassel;
}

// Initialize animations and shape
initializeAnimations();
updateCanvasShape();

shapePrevBtn.addEventListener('click', () => {
    currentShapeIndex = (currentShapeIndex - 1 + shapes.length) % shapes.length;
    updateCanvasShape();
});

shapeNextBtn.addEventListener('click', () => {
    currentShapeIndex = (currentShapeIndex + 1) % shapes.length;
    updateCanvasShape();
});

// sticker and scene logic
const finishStickerBtn = document.querySelector("#finish-sticker-btn");
const stickerDock = document.querySelector("#sticker-dock");
const saveSceneBtn = document.querySelector("#save-scene-btn");
let currentStickerSrc = null; // Stores the dataURL of the current lantern

let isStickerMode = false; // State variable to track the toggle

finishStickerBtn.addEventListener("click", () => {
    
    // Group the elements we want to hide/show (Canvas + Lantern Images)
    const drawingElements = document.querySelectorAll("canvas, .lantern-top, .lantern-tassel, .lantern-bottom");
    const shapeButtons = document.querySelectorAll("#shape-prev, #shape-next");

    if (!isStickerMode) {
        // === MODE: TURN INTO STICKER ===
        
        // 1. Temporarily hide arrows for capture
        document.querySelector("#prev-bg").style.display = "none";
        document.querySelector("#next-bg").style.display = "none";
        document.querySelectorAll(".lantern-nav-group").forEach(el => el.style.display = "none");
        shapeButtons.forEach(btn => btn.style.display = "none");

        // 2. Prepare Background for capture
        const originalBg = drawingBoard.style.backgroundImage;
        const originalBgColor = drawingBoard.style.backgroundColor;
        drawingBoard.style.backgroundImage = "none";
        drawingBoard.style.backgroundColor = "transparent";

        // 3. Calculate Crop (Same as before)
        const captureWidth = 600;  
        const captureHeight = 1500; 
        const startX = (drawingBoard.offsetWidth / 2) - (captureWidth / 2);
        const startY = (drawingBoard.offsetHeight / 2) - (captureHeight / 2);

        // 4. Run Capture
        html2canvas(drawingBoard, {
            backgroundColor: null,
            x: startX,
            y: startY,
            width: captureWidth,
            height: captureHeight,
            scale: 2
        }).then(canvas => {
            // Generate Sticker Image
            currentStickerSrc = canvas.toDataURL("image/png");
            
            // Restore Background & Arrows
            if(originalBg) drawingBoard.style.backgroundImage = originalBg;
            drawingBoard.style.backgroundColor = originalBgColor;
            document.querySelector("#prev-bg").style.display = "flex";
            document.querySelector("#next-bg").style.display = "flex";

            // Put in Dock
            stickerDock.innerHTML = ""; 
            const img = document.createElement("img");
            img.src = currentStickerSrc;
            img.classList.add("dock-sticker");
            img.title = "Drag me to the background!";
            img.addEventListener("mousedown", startDragSticker);
            stickerDock.appendChild(img);

            // --- NEW: HIDE DRAWING ELEMENTS ---
            drawingElements.forEach(el => el.style.display = "none");

            // Change Button to "Make New"
            finishStickerBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Make New Sticker';
            finishStickerBtn.style.backgroundColor = "#4CAF50"; // Optional: Change color to Green
            finishStickerBtn.style.color = "white";

            // Update State
            isStickerMode = true;
        });

    } else {
        // === MODE: MAKE NEW STICKER (RESET) ===

        // 1. Clear the previous drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCanvasBackground(); // Helper function from your code to reset white/color bg

        // 2. Show Drawing Elements again
        drawingElements.forEach(el => el.style.display = "block"); // Or "initial"
        document.querySelectorAll(".lantern-nav-group").forEach(el => el.style.display = "flex");
        shapeButtons.forEach(btn => btn.style.display = "flex");

        // 3. Change Button back to "Make Sticker"
        finishStickerBtn.innerHTML = '<i class="fa-solid fa-magic-wand-sparkles"></i> Make Sticker';
        finishStickerBtn.style.backgroundColor = ""; // Reset color
        finishStickerBtn.style.color = "";

        // Update State
        isStickerMode = false;
    }
});

// 2. DRAG AND DROP LOGIC
function startDragSticker(e) {
    e.preventDefault();
    
    // Create a "Ghost" sticker that follows mouse
    const ghost = document.createElement("img");
    ghost.src = currentStickerSrc;
    ghost.classList.add("placed-sticker");
    ghost.style.width = "100px"; // Smaller while dragging
    ghost.style.opacity = "0.7";
    ghost.style.pointerEvents = "none"; // Let mouse events pass through to board
    ghost.style.position = "fixed"; // Fixed relative to viewport
    ghost.style.left = e.clientX + "px";
    ghost.style.top = e.clientY + "px";
    ghost.style.transform = "translate(-50%, -50%)"; // Center on mouse
    
    document.body.appendChild(ghost);

    function moveGhost(event) {
        ghost.style.left = event.clientX + "px";
        ghost.style.top = event.clientY + "px";
    }

    function dropSticker(event) {
        // Remove listeners
        document.removeEventListener("mousemove", moveGhost);
        document.removeEventListener("mouseup", dropSticker);
        ghost.remove(); // Remove the ghost

        // Calculate if we dropped it INSIDE the drawing board
        const boardRect = drawingBoard.getBoundingClientRect();
        
        // Check boundaries
        if (
            event.clientX >= boardRect.left &&
            event.clientX <= boardRect.right &&
            event.clientY >= boardRect.top &&
            event.clientY <= boardRect.bottom
        ) {
            // CREATE PERMANENT STICKER
            const newSticker = document.createElement("img");
            newSticker.src = currentStickerSrc;
            newSticker.classList.add("placed-sticker");
            
            // Calculate position relative to the board container
            // (Current Mouse X - Board Left Edge)
            const relativeX = event.clientX - boardRect.left;
            const relativeY = event.clientY - boardRect.top;

            newSticker.style.left = relativeX + "px";
            newSticker.style.top = relativeY + "px";
            newSticker.style.transform = "translate(-50%, -50%)"; // Center image on coordinate

            // Optional: Allow the placed sticker to be dragged again (repositioning)
            addRepositionLogic(newSticker);

            drawingBoard.appendChild(newSticker);
        }
    }

    document.addEventListener("mousemove", moveGhost);
    document.addEventListener("mouseup", dropSticker);
}

// Helper to move stickers AFTER they are placed
function addRepositionLogic(element) {
    element.addEventListener("mousedown", (e) => {
        e.stopPropagation(); // Don't draw on canvas
        e.preventDefault();

        let startX = e.clientX;
        let startY = e.clientY;
        let elemLeft = element.offsetLeft;
        let elemTop = element.offsetTop;

        function moveElem(ev) {
            let dx = ev.clientX - startX;
            let dy = ev.clientY - startY;
            element.style.left = (elemLeft + dx) + "px";
            element.style.top = (elemTop + dy) + "px";
        }

        function stopMove() {
            document.removeEventListener("mousemove", moveElem);
            document.removeEventListener("mouseup", stopMove);
        }

        document.addEventListener("mousemove", moveElem);
        document.addEventListener("mouseup", stopMove);
    });
}

// 3. SAVE FINAL SCENE
saveSceneBtn.addEventListener("click", () => {
    // Hide arrows again for clean save
    document.querySelector("#prev-bg").style.display = "none";
    document.querySelector("#next-bg").style.display = "none";

    html2canvas(drawingBoard).then(domCanvas => {
        const link = document.createElement('a');
        link.download = `lantern-scene-${Date.now()}.png`;
        link.href = domCanvas.toDataURL('image/png');
        link.click();

        // Show arrows back
        document.querySelector("#prev-bg").style.display = "flex";
        document.querySelector("#next-bg").style.display = "flex";
    });
});