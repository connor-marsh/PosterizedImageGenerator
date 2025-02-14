const img = new Image();
const posterizedImage = document.createElement('img');
const selectedColors = [];

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('imageInput');

    // Create an empty container to hold the image and text
    const imageContainer = document.getElementById('imageContainer');
    const instructionContainer = document.getElementById('instructionContainer');

    // Listen for file input change event
    fileInput.addEventListener('change', handleImageUpload);

    function handleImageUpload(event) {
        const file = event.target.files[0];

        // Check if the file is an image
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = function (e) {
                img.src = e.target.result;

                img.onload = function () {
                    // Create a canvas to modify the image
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxWidth = 400;
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // get image data
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    var dt = [];
                    const cols = canvas.width;
                    const rows = canvas.height;

                    // convert it into standard shape of (rows, cols, rgb)
                    dt = image1d2d(data, cols);

                    // operate on it
                    // check if its already grayscale posterized
                    var diffValues = [];
                    var posterized = true;

                    for (let i = 0; i < rows; i++) {
                        if (!posterized) break;
                        for (let j = 0; j < cols; j++) {
                            if (!posterized) break;
                            var newValue = true;
                            var diffIndex = 0;
                            for (let k = 0; k < diffValues.length; k++) {
                                if (Math.abs(dt[i][j][0] - diffValues[k]) < 3) {
                                    newValue = false;
                                    diffIndex = k;
                                }
                            }
                            if (newValue) {
                                diffValues.push(dt[i][j][0]);
                                if (diffValues.length > 10) {
                                    posterized = false;
                                }
                            }

                        }
                    }

                    imageContainer.innerHTML = '';
                    instructionContainer.innerHTML = '';
                    
                    if (posterized) {
                        console.log("Image is posterized with " + diffValues.length + " value steps");

                        // Create a new text element to instruct user
                        const instrText = document.createElement('p');
                        instrText.textContent = "This Image is already posterized, next step is to choose desired colors.";

                        instructionContainer.appendChild(instrText);

                        // now prompt user about moving on or trying again
                        const confirmImageSelectionButton = document.createElement('button');
                        confirmImageSelectionButton.textContent = "Color Selection";
                        confirmImageSelectionButton.onclick = colorSelection;

                        const confirmPosterizeText = document.createElement('p');
                        confirmPosterizeText.textContent = 'Click "Color Selection" to move on to color selection, otherwise, you can try uploading another image.';

                        instructionContainer.appendChild(confirmPosterizeText);
                        instructionContainer.appendChild(confirmImageSelectionButton);


                    }
                    else {
                        console.log("Image is not posterized");
                        // Create a new text element to instruct user
                        const instrText = document.createElement('p');
                        instrText.textContent = "This Image is not posterized. Please select the number of value steps, the darkest value, and the lighest value. (A value of 0 is the darkest, and a value of 255 is the lightest).";
                        

                        const stepsInput = document.createElement('input');
                        stepsInput.type = "number";
                        stepsInput.id = "valueSteps";
                        stepsInput.defaultValue = 5;

                        const minValueInput = document.createElement('input');
                        minValueInput.type = "number";
                        minValueInput.id = "minValue";
                        minValueInput.defaultValue = 0;

                        const maxValueInput = document.createElement('input');
                        maxValueInput.type = "number";
                        maxValueInput.id = "maxValue";
                        maxValueInput.defaultValue = 255;

                        const confirmButton = document.createElement('button');
                        confirmButton.onclick = posterizeImage;
                        confirmButton.textContent = "Confirm Value Steps";


                        instructionContainer.appendChild(instrText);
                        instructionContainer.appendChild(stepsInput);
                        instructionContainer.appendChild(minValueInput);
                        instructionContainer.appendChild(maxValueInput);
                        instructionContainer.appendChild(confirmButton);
                        
                    }
                    
                    // convert back to html format and save it
                    for (let i = 0; i < rows; i++) {
                        for (let j = 0; j < cols; j++) {
                            for (let k = 0; k < 4; k++) {
                                data[i*cols*4+j*4+k]=dt[i][j][k]
                            }
                        }
                    }
                    

                    ctx.putImageData(imageData, 0, 0);

                    // Save image in global posterized image
                    posterizedImage.src = canvas.toDataURL();

                    // Create a new image element to display the modified image
                    const newImage = document.createElement('img');
                    newImage.src = canvas.toDataURL();
                    newImage.width = maxWidth;
                    newImage.height = (img.height / img.width) * maxWidth;

                    // Optionally, add the image to the page (append it to the container)
                    imageContainer.appendChild(newImage);
                };
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please select a valid image file.");
        }
    }
});

function image1d2d(img1d, cols) {
    var img2d = [];
    for (let i = 0; i < img1d.length; i += 4) {
        if (i % (cols * 4) == 0) {
            img2d.push([])
        }
        let r = img1d[i];
        let g = img1d[i + 1];
        let b = img1d[i + 2];
        let a = img1d[i + 3];
        img2d[img2d.length - 1].push([r, g, b, a])
    }
    return img2d;
}

function posterizeImage() {
    var numSteps = parseInt(document.getElementById("valueSteps").value);
    console.log("Posterizing Image with " + numSteps + " steps.");

    // Create a canvas to modify the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const maxWidth = 400;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    var dt = [];
    const cols = canvas.width;
    const rows = canvas.height;

    dt = image1d2d(data, cols);

    // convert to grayscale
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            var avg = dt[i][j][0] + dt[i][j][1] + dt[i][j][2];
            avg /= 3;
            dt[i][j][0] = avg;
            dt[i][j][1] = avg;
            dt[i][j][2] = avg;
        }
    }

    // Posterize it
    var minValue = parseInt(document.getElementById("minValue").value);
    var maxValue = parseInt(document.getElementById("maxValue").value);
    var ranges = [];
    stepSize = 255 / numSteps;
    for (let i = 0; i < numSteps; i++) {
        ranges.push([i * stepSize, (i + 1) * stepSize - 1]);
    }
    var values = []
    stepSizeAlt = (maxValue-minValue) / (numSteps - 1);
    for (let i = 0; i < numSteps; i++) {
        values.push(i * stepSizeAlt + minValue);
    }
    console.log("The 5 steps: " + values);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            for (let k = 0; k < 3; k++) {
                var range = 0
                for (let l = 0; l < ranges.length; l++) {
                    if (dt[i][j][k] >= ranges[l][0] && dt[i][j][k] <= ranges[l][1]) {
                        range = l;
                    }
                }
                dt[i][j][k] = values[range];
            }
        }
    }


    // convert back to html format and save it
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            for (let k = 0; k < 4; k++) {
                data[i * cols * 4 + j * 4 + k] = dt[i][j][k]
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Save image in global posterized image
    posterizedImage.src = canvas.toDataURL();

    // Create a new image element to display the modified image
    const newImage = document.createElement('img');
    newImage.src = canvas.toDataURL();
    newImage.width = maxWidth;
    newImage.height = (img.height / img.width) * maxWidth;

    // Optionally, add the image to the page (append it to the container)
    imageContainer.innerHTML = '';
    imageContainer.appendChild(newImage);

    const confirmContainer = document.getElementById("confirmContainer");
    confirmContainer.innerHTML = '';
    // now prompt user about moving on or trying again
    const confirmPosterizeButton = document.createElement('button');
    confirmPosterizeButton.textContent = "Done Posterizing";
    confirmPosterizeButton.onclick = colorSelection;

    const confirmPosterizeText = document.createElement('p');
    confirmPosterizeText.textContent = 'Click "Done Posterizing" to move on to color selection, otherwise, you can try again with different posterizing settings.';

    confirmContainer.appendChild(confirmPosterizeText);
    confirmContainer.appendChild(confirmPosterizeButton);
}

function colorSelection() {
    selectedColors.length = 0; // reset this array
    console.log("Starting color selection");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 722;
    canvas.height = 202+canvas.width/10;
    // ctx.fillStyle = "black";
    for (let i = 0; i < 361; i++) {
        for (let j = 0; j < 101; j++) {
            pxrgb = hslToRgb(i, 100-j, 50);
            // console.log(pxrgb);
            ctx.fillStyle = "rgb("+pxrgb[0]+","+pxrgb[1]+","+pxrgb[2]+")";
            ctx.fillRect(i * 2, j * 2, 2, 2);
        }
    }
    ctx.fillStyle = "white";
    ctx.fillRect(0, canvas.height - canvas.width / 10, canvas.width, canvas.width / 10);

    
    canvas.addEventListener('click', function (event) {
        var x = event.pageX - canvas.offsetLeft,
            y = event.pageY - canvas.offsetTop;

        if (selectedColors.length <= 10) {
            pxrgb = hslToRgb(x / 2, 100 - y / 2, 50);
            ctx.fillStyle = "rgb(" + pxrgb[0] + "," + pxrgb[1] + "," + pxrgb[2] + ")";
            ctx.fillRect(selectedColors.length * canvas.width / 10, canvas.height - canvas.width / 10, canvas.width / 10, canvas.width / 10);
            selectedColors.push([x / 2, 100 - y / 2, 50]);
        }

    });

    const confirmContainer = document.getElementById("confirmContainer");
    confirmContainer.innerHTML = '';

    const instructionContainer = document.getElementById("instructionContainer");
    instructionContainer.innerHTML = '';

    const colorPickInstructions = document.createElement('p');
    colorPickInstructions.textContent = "Below is a color field of every hue and saturation (intensity), you may click on up to 10 desired colors. Click the reset button to restart, and the confirm button to finish.";

    const colorPickInstructions2 = document.createElement('p');
    colorPickInstructions2.textContent = "(Note that it will generate an image for every possible combination of 2 colors you selected. For the math nerds, thats n Choose 2 images for n colors).";

    const restartColorsButton = document.createElement('button');
    restartColorsButton.textContent = "Restart";
    restartColorsButton.onclick = function () {
        selectedColors.length = 0;
        ctx.fillStyle = "white";
        ctx.fillRect(0, canvas.height - canvas.width / 10, canvas.width, canvas.width / 10);
    };

    const confirmColorsButton = document.createElement('button');
    confirmColorsButton.textContent = "Confirm";
    confirmColorsButton.onclick = function () {
        if (selectedColors.length > 1) {
            generateColorImages();
        }
        else {
            console.log("Select at least 2 colors");
            ctx.fillStyle = "black";
            ctx.font = "10px Arial";
            ctx.fillText("Select at least 2 colors", canvas.width / 10, canvas.height - canvas.width / 20);
        }
    };
    instructionContainer.appendChild(colorPickInstructions);
    instructionContainer.appendChild(colorPickInstructions2);
    instructionContainer.appendChild(canvas);
    instructionContainer.appendChild(restartColorsButton);
    instructionContainer.appendChild(confirmColorsButton);
}

function generateColorImages() {
    console.log("Generating color images");
    const imageContainer = document.getElementById("imageContainer");
    imageContainer.innerHTML = '';
    const instructionContainer = document.getElementById("instructionContainer");
    instructionContainer.innerHTML = '';

    for (let i = 0; i < selectedColors.length; i++) {
        for (let j = 0; j < selectedColors.length; j++) {
            if (i == j) continue;
            generateColorImage(selectedColors[i], selectedColors[j]);
        }
    }
    // generateColorImage(selectedColors[0], selectedColors[1]);
}

function generateColorImage(color1, color2) {

    // Create a canvas to modify the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const maxWidth = 400;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(posterizedImage, 0, 0, canvas.width, canvas.height);

    // get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const cols = canvas.width;
    const rows = canvas.height;

    var dt = image1d2d(data, cols);

    // since image is already greyscale posterized, we can just take the grayscale value as the lightness
    // but we need to alternate back and forth so we need to know which values are what
    // so first scan the image to see its values
    var diffValues = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            var newValue = true;
            for (let k = 0; k < diffValues.length; k++) {
                if (diffValues[k] == dt[i][j][0]) {
                    newValue = false;
                }
            }
            if (newValue) {
                diffValues.push(dt[i][j][0]);
            }
        }
    }
    
    // Sort array so the colors alternate by value
    // do bubble sort because built in sort isnt working
    for (var i = 0; i < diffValues.length; i++) {

        // Last i elements are already in place  
        for (var j = 0; j < (diffValues.length - i - 1); j++) {

            // Checking if the item at present iteration 
            // is greater than the next iteration
            if (diffValues[j] > diffValues[j + 1]) {

                // If the condition is true
                // then swap them
                var temp = diffValues[j]
                diffValues[j] = diffValues[j + 1]
                diffValues[j + 1] = temp
            }
        }
    }

    var valueColors = []
    for (let i = 0; i < diffValues.length; i++) {
        
        var chosenColor = (i % 2 == 0) ? color1 : color2;
        valueColors.push(hslToRgbTrueValue(chosenColor[0], chosenColor[1], diffValues[i] / 255.0 * 100));
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {

            var valueIndex = 0;
            for (let k = 0; k < diffValues.length; k++) {
                if (dt[i][j][0] == diffValues[k]) {
                    valueIndex = k;
                    break;
                }
            }
            
            var newColor = valueColors[valueIndex];
            
            dt[i][j][0] = newColor[0];
            dt[i][j][1] = newColor[1];
            dt[i][j][2] = newColor[2];
        }
    }

    // convert back to html format and save it
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            for (let k = 0; k < 4; k++) {
                data[i * cols * 4 + j * 4 + k] = dt[i][j][k]
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Create a new image element to display the modified image
    const imageContainer = document.getElementById("imageContainer");
    const newImage = document.createElement('img');
    newImage.src = canvas.toDataURL();
    newImage.width = maxWidth;
    newImage.height = (img.height / img.width) * maxWidth;

    // this time dont clear the div so that you can see all the results
    imageContainer.appendChild(newImage);
    console.log("Created new color image");


}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return [h, s, l];
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}

// lightness value is given on a scale of 0 to 100,
// but the hue and saturation can affect the "true value" of the color
// i.e. the grayscale value. So this function essentially just chooses the correct
// hsl lightness value to make the color the desired grayscale value
function hslToRgbTrueValue(h, s, grayscale) {
    var lightness = grayscale;
    var lowestLightness = 0;
    var highestLightness = 100;
    // essentially do binary search
    while (true) {
        // console.log(lightness);
        var rgb = hslToRgb(h, s, lightness);
        var trueGrayscale = Math.sqrt((rgb[0]*rgb[0] + rgb[1]*rgb[1] + rgb[2]*rgb[2]) / 3);
        trueGrayscale *= 100 / 255;
        if (trueGrayscale - grayscale > 0.5) {
            highestLightness = lightness
            lightness = (lightness + lowestLightness) / 2;
        }
        else if (grayscale - trueGrayscale > 0.5) {
            lowestLightness = lightness;
            lightness = (lightness + highestLightness) / 2;
        }
        else {
            return rgb;
        }
    }
}