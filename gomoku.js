$(function () {
    var canvas = document.getElementById("board");
    canvas.height = 601;
    canvas.width = 601;
    var ctx = canvas.getContext("2d");
    var X, Y, N, M;
    var cellsize = 40, halfcellsize = 20, radius = 12, cross = 10;
    var WHO = true;

    ctx.fillStyle = '#ECEABE';
    ctx.fillRect(0, 0, canvas.width, canvas.width);
    ctx.beginPath();
    ctx.strokeStyle = "silver";
    ctx.lineWidth = "1";
    for (var x = 0.5; x < canvas.width; x += cellsize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (var y = 0.5; y < canvas.height; y += cellsize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    $("#board").mousemove(function (event) {
        X = event.pageX - canvas.offsetLeft;
        Y = event.pageY - canvas.offsetTop;

    }).click(function () {
        N = Math.floor(X / cellsize);
        M = Math.floor(Y / cellsize);
        if (WHO)
            showX();
        else
            show0();
        WHO = !WHO;
    });

    function showX()
    {
        ctx.beginPath();
        ctx.strokeStyle = "#C1876B";
        ctx.lineWidth = "5";
        ctx.lineCap = "round";
        x = N * cellsize + halfcellsize;
        y = M * cellsize + halfcellsize;
        ctx.moveTo(x - cross, y - cross);
        ctx.lineTo(x + cross, y + cross);
        ctx.moveTo(x - cross, y + cross);
        ctx.lineTo(x + cross, y - cross);
        ctx.stroke();
    }
    function show0()
    {
        ctx.beginPath();
        ctx.strokeStyle = "#BEBD7F";
        ctx.lineWidth = "5";
        ctx.lineCap = "round";
        x = N * cellsize + halfcellsize;
        y = M * cellsize + halfcellsize;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
});
