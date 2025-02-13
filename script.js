const img = new Image();


document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('imageInput');

    // Create an empty container to hold the image and text
    const imageContainer = document.getElementById('imageContainer');
    const textContainer = document.getElementById('textContainer');
    const inputContainer = document.getElementById('inputContainer');

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
                    textContainer.innerHTML = '';
                    inputContainer.innerHTML = '';
                    
                    if (posterized) {
                        console.log("Image is posterized with " + diffValues.length + " value steps");
                        console.log(diffValues);

                        // Create a new text element to instruct user
                        const instrText = document.createElement('p');
                        instrText.textContent = "This Image is already posterized, next step is to choose desired colors.";

                        textContainer.appendChild(instrText);


                    }
                    else {
                        console.log("Image is not posterized");
                        // Create a new text element to instruct user
                        const instrText = document.createElement('p');
                        instrText.textContent = "This Image is not posterized. Please select the number of value steps, and the lightest and darkest values you want.";
                        textContainer.innerHTML = ''; // Clear previous image if any
                        textContainer.appendChild(instrText);

                        const stepsInput = document.createElement('input');
                        stepsInput.type = "number";
                        stepsInput.id = "valueSteps";
                        stepsInput.defaultValue = 5;

                        const confirmButton = document.createElement('button');
                        confirmButton.onclick = posterizeImage;
                        confirmButton.textContent = "Confirm Value Steps";

                        inputContainer.appendChild(stepsInput);
                        inputContainer.appendChild(confirmButton);
                        
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
    var numSteps = document.getElementById("valueSteps").value;
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

    // Posterize it
    var ranges = [];
    stepSize = 255 / numSteps;
    for (let i = 0; i < numSteps; i++) {
        ranges.push([i * stepSize, (i + 1) * stepSize - 1]);
    }
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            for (let k = 0; k < 3; k++) {
                var range = 0
                for (let l = 0; l < ranges.length; l++) {
                    if (dt[i][j][k] >= ranges[l][0] && dt[i][j][k] <= ranges[l][1]) {
                        range = l;
                    }
                }
                dt[i][j][k] = ranges[range][0];
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
}

/*
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('imageInput');
    const imageDisplay = document.getElementById('imageDisplay');

    fileInput.addEventListener('change', handleImageUpload);

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.src = e.target.result;

                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        data[i] = avg;
                        data[i + 1] = avg;
                        data[i + 2] = avg;
                    }
                    ctx.putImageData(imageData, 0, 0);
                    imageDisplay.src = canvas.toDataURL();
                };
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please select a valid image file.");
        }
    }
});*/