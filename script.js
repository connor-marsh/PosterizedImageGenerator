
function print() {
    console.log("HELLO WORLD");
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('imageInput');

    // Create an empty container to hold the image
    const imageContainer = document.getElementById('imageContainer');

    // Listen for file input change event
    fileInput.addEventListener('change', handleImageUpload);

    function handleImageUpload(event) {
        const file = event.target.files[0];

        // Check if the file is an image
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const img = new Image();
                img.src = e.target.result;

                img.onload = function () {
                    // Create a canvas to modify the image
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Apply a grayscale effect
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        data[i] = avg;
                        data[i + 1] = avg;
                        data[i + 2] = avg;
                    }

                    ctx.putImageData(imageData, 0, 0);

                    // Create a new image element to display the modified image
                    const newImage = document.createElement('img');
                    newImage.src = canvas.toDataURL();
                    document.body.appendChild(newImage);

                    // Optionally, add the image to the page (append it to the container)
                    // imageContainer.innerHTML = ''; // Clear previous image if any
                    // imageContainer.appendChild(newImage);
                };
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please select a valid image file.");
        }
    }
});



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