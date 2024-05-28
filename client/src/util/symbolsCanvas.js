function compoundSymbol(label, outlineColor) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    var width = 23;
    var height = 23;
    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Calculate circle radius based on canvas size
    var radius = Math.min(width, height) / 2 - 2; // Subtract 2 for better appearance

    // Draw black circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();

    // Draw colored outline
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius - 1.75, 0, 2 * Math.PI);
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    var f = ""
    if (label.length === 1) {
        f = "bold 11px Tahoma";
    }
    else {
        f = "bold 9px Tahoma";
    }
    if (outlineColor === 'gold')
        outlineColor = 'rgb(255,215,0)'
    if (outlineColor === 'silver')
        outlineColor = 'rgb(192,192,192)'
    if (outlineColor === 'bronz')
        outlineColor = 'rgb(193,183,172)'

    ctx.font = f;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, width / 2, height / 2);

    return canvas;
}

function symbolWithLabel(label, fillColor) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    var width = 22;
    var height = 22;
    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Calculate circle radius based on canvas size
    var radius = Math.min(width, height) / 2 - 2; // Subtract 2 for better appearance

    // Draw black circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.font = "bold 10px Tahoma";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, width / 2, height / 2);

    return canvas;
}

export { compoundSymbol, symbolWithLabel }