"use strict";
$(function () {
    var canvas = document.getElementById("board");
    canvas.height = 601;
    canvas.width = 601;
    var ctx = canvas.getContext("2d");
    var X, M, Y, N;
    var size = 15, cellsize = 40, halfcellsize = 20, radius = 12, cross = 10, crosswin = 15;
    var WHO, matrix, freecells;
    var hashStep;
    var pattwin = [0, /(1){5}/, /(2){5}/];
    var directions1 = {1: {n: -1, m: -1}, 2: {n: -1, m: 0}, 3: {n: -1, m: 1}, 4: {n: 0, m: -1}, 5: {n: 0, m: 1}, 6: {n: 1, m: -1}, 7: {n: 1, m: 0}, 8: {n: 1, m: 1}};
    var color = {canvas: "#ECEABE", border: "silver", winline: "#6A5D4D"};
    var gameinprocess;
    NewGame(2);
    $("#board").mousemove(function (event) {
        MouseMove(event);
    }).click(Click);
    $(".newgame").click(function () {
        NewGame($(this).data('for'));
    });


    function Step(attack, attackpattern, defence, defencepattern)
    {
        this._id = id;
        this._name = name;
        this.defaultvalue = "MyDefaultValue";

        //Получение текущего значения
        this.getDefaultValue = function ()
        {
            return this.defaultvalue;
        };

        //Установка нового значения
        this.setDefaultValue = function (newvalue)
        {
            this.defaultvalue = newvalue;
        };

        //Произвольная функция
        this.sum = function (a, b)
        {
            return (a + b);
        };
    }

    function MouseMove(event) {
        if (!gameinprocess)
            return;
        X = event.pageX - canvas.offsetLeft;
        Y = event.pageY - canvas.offsetTop;
        N = Math.floor(Y / cellsize);
        M = Math.floor(X / cellsize);
        if (N < size && M < size & matrix[N][M] === 0)
            canvas.style.cursor = "pointer";
        else
            canvas.style.cursor = "default";
    }

    function Click() {
        if (!gameinprocess)
            return;
        if (matrix[N][M] !== 0)
            return;
        gameinprocess = false;
        canvas.style.cursor = "default";
        GameMoveUser(N, M);
        if (gameinprocess)
            GameMoveAI();
    }

    function NewGame(a) {
        WHO = true;
        matrix = [];
        hashStep = {7: {7: {attack: 1, sum: 0, defence: 0}}};
        freecells = size * size;
        for (var i = 0; i < size; i++) {
            matrix[i] = [];
            for (var j = 0; j < size; j++) {
                matrix[i][j] = 0;
            }
        }
        ctx.fillStyle = color.canvas;
        ctx.fillRect(0, 0, canvas.width, canvas.width);
        ctx.beginPath();
        ctx.strokeStyle = color.border;
        ctx.lineWidth = 1;
        for (var x = 0.5; x < canvas.width; x += cellsize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        for (var y = 0.5; y < canvas.height; y += cellsize) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
        gameinprocess = true;
        if (a === 2)
            GameMoveAI();
    }

    function GameMoveAI() {
        var keyN, keyM;
        gameinprocess = false;
        var max = 0;
        for (keyN in hashStep)
        {
            for (keyM in hashStep[keyN])
            {
                hashStep[keyN][keyM].sum = hashStep[keyN][keyM].attack + hashStep[keyN][keyM].defence;
                if (hashStep[keyN][keyM].sum > max)
                    max = hashStep[keyN][keyM].sum;
            }
        }
        var goodmoves = [];
        for (keyN in hashStep)
        {
            for (keyM in hashStep[keyN])
            {
                if (hashStep[keyN][keyM].sum === max) {
                    goodmoves[goodmoves.length] = {n: parseInt(keyN), m: parseInt(keyM)};
                }
            }
        }
        console.log(max);
        var movenow = goodmoves[getRandomInt(0, goodmoves.length - 1)];
        //console.log(JSON.stringify(hashStep));
        N = movenow.n;
        M = movenow.m;

        delete hashStep[N][M];
        for (var key in directions1) {
            var n = N + directions1[key].n;
            var m = M + directions1[key].m;
            if (n < 0 || m < 0 || n >= size || m >= size)
                continue;
            if (matrix[n][m] !== 0)
                continue;
            if (!(n in hashStep))
                hashStep[n] = {};
            if (!(m in hashStep[n]))
                hashStep[n][m] = {attack: 0, sum: 0, defence: 0};
            hashStep[n][m].attack++;
        }
        //hashStep[N][M] = 1;
        for (keyN in hashStep)
        {
            for (keyM in hashStep[keyN])
            {
                var x = keyM * cellsize + 3 * halfcellsize / 4;
                var y = keyN * cellsize + halfcellsize / 4;
                ctx.fillStyle = color.canvas;
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = color.border;
                ctx.textBaseline = "top";
                ctx.fillText((hashStep[keyN][keyM].attack + hashStep[keyN][keyM].defence), x, y);

                var x = keyM * cellsize + halfcellsize / 4;
                var y = keyN * cellsize + 3 * halfcellsize / 4;
                ctx.fillStyle = color.canvas;
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = color.border;
                ctx.textBaseline = "top";
                ctx.fillText(hashStep[keyN][keyM].attack, x, y);

                var x = keyM * cellsize + 6 * halfcellsize / 4;
                var y = keyN * cellsize + 3 * halfcellsize / 4;
                ctx.fillStyle = color.canvas;
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = color.border;
                ctx.textBaseline = "top";
                ctx.fillText(hashStep[keyN][keyM].defence, x, y);
            }
        }
        GameMove(N, M);
    }

    function GameMoveUser(n, m)
    {
        if (hashStep[n] && hashStep[n][m])
            delete hashStep[n][m];
        GameMove(n, m);
        for (var key in directions1) {
            var nD = n + directions1[key].n;
            var mD = m + directions1[key].m;
            if (nD < 0 || mD < 0 || nD >= size || mD >= size)
                continue;
            if (matrix[nD][mD] !== 0)
                continue;
            if (!(nD in hashStep))
                hashStep[nD] = {};
            if (!(mD in hashStep[nD]))
                hashStep[nD][mD] = {attack: 0, sum: 0, defence: 0};
            hashStep[nD][mD].defence++;
        }


    }


    function GameMove(n, m)
    {
        matrix[n][m] = 2 - WHO;
        if (WHO)
            DrawX(n, m);
        else
            DrawO(n, m);
        WHO = !WHO;
        freecells--;
        IsGameOver();
    }

    function IsGameOver() {
        var t = matrix[N][M];
        var s = ['', '', '', ''];
        var nT = Math.min(N, 4);
        var nR = Math.min(size - M - 1, 4);
        var nB = Math.min(size - N - 1, 4);
        var nL = Math.min(M, 4);
        for (var j = N - nT; j <= N + nB; j++)
            s[0] += matrix[j][M];
        for (var i = M - nL; i <= M + nR; i++)
            s[1] += matrix[N][i];
        for (var i = -Math.min(nT, nL); i <= Math.min(nR, nB); i++)
            s[2] += matrix[N + i][M + i];
        for (var i = -Math.min(nB, nL); i <= Math.min(nR, nT); i++)
            s[3] += matrix[N - i][M + i];
        var k;
        if ((k = s[0].search(pattwin[t])) >= 0)
            GameOver(M, N - nT + k, M, N - nT + k + 4);
        else if ((k = s[1].search(pattwin[t])) >= 0)
            GameOver(M - nL + k, N, M - nL + k + 4, N);
        else if ((k = s[2].search(pattwin[t])) >= 0)
            GameOver(M - Math.min(nT, nL) + k, N - Math.min(nT, nL) + k, M - Math.min(nT, nL) + k + 4, N - Math.min(nT, nL) + k + 4);
        else if ((k = s[3].search(pattwin[t])) >= 0)
            GameOver(M - Math.min(nB, nL) + k, N + Math.min(nB, nL) - k, M - Math.min(nB, nL) + k + 4, N + Math.min(nB, nL) - k - 4, -1);
        else if (freecells !== 0)
            gameinprocess = true;
    }

    function GameOver(m1, n1, m2, n2, r)
    {
        r = r || 1;
        ctx.beginPath();
        ctx.strokeStyle = color.winline;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.moveTo(m1 * cellsize + halfcellsize - crosswin * (m1 !== m2), n1 * cellsize + halfcellsize - crosswin * (n1 !== n2) * r);
        ctx.lineTo(m2 * cellsize + halfcellsize + crosswin * (m1 !== m2), n2 * cellsize + halfcellsize + crosswin * (n1 !== n2) * r);
        ctx.stroke();
    }

    function DrawX(n, m)
    {
        ctx.beginPath();
        var x = m * cellsize + halfcellsize;
        var y = n * cellsize + halfcellsize;
        ctx.fillStyle = color.canvas;
        ctx.fillRect(x - halfcellsize + 1, y - halfcellsize + 1, cellsize - 2, cellsize - 2);
        ctx.strokeStyle = "#C1876B";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.moveTo(x - cross, y - cross);
        ctx.lineTo(x + cross, y + cross);
        ctx.moveTo(x - cross, y + cross);
        ctx.lineTo(x + cross, y - cross);
        ctx.stroke();
    }
    function DrawO(n, m)
    {
        ctx.beginPath();
        var x = m * cellsize + halfcellsize;
        var y = n * cellsize + halfcellsize;
        ctx.fillStyle = color.canvas;
        ctx.fillRect(x - halfcellsize + 1, y - halfcellsize + 1, cellsize - 2, cellsize - 2);
        ctx.strokeStyle = "#BEBD7F";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
});
