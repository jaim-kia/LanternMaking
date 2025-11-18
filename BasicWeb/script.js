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

function adjustCanvasSize() {
    const desiredWidth = 400;
    const desiredHeight = 300;

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