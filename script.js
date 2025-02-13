const img = new Image();


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
                        console.log(diffValues);

                        // Create a new text element to instruct user
                        const instrText = document.createElement('p');
                        instrText.textContent = "This Image is already posterized, next step is to choose desired colors.";

                        instructionContainer.appendChild(instrText);


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
    console.log(values);
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

    // Create a new image element to display the modified image
    const newImage = document.createElement('img');
    newImage.src = canvas.toDataURL();
    newImage.width = maxWidth;
    newImage.height = (img.height / img.width) * maxWidth;

    // Optionally, add the image to the page (append it to the container)
    imageContainer.innerHTML = '';
    imageContainer.appendChild(newImage);

    // now prompt user about colors
    
}

