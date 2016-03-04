$(function () {
    var canvas = document.getElementById("board");
    canvas.height = 601;
    canvas.width = 601;
    var ctx = canvas.getContext("2d");
    var X, Y, N, M;
    var size = 15, cellsize = 40, halfcellsize = 20, radius = 12, cross = 10, crosswin = 15;
    var WHO, matrix, freecells;
    var matrixAttack;
    var pattwin = [0, /(1){5}/, /(2){5}/];
    var directions1 = {1: {n: -1, m: -1}, 2: {n: -1, m: 0}, 3: {n: -1, m: 1}, 4: {n: 0, m: -1}, 5: {n: 0, m: 1}, 6: {n: 1, m: -1}, 7: {n: 1, m: 0}, 8: {n: 1, m: 1}};
    NewGame(2);
    $("#board").mousemove(function (event) {
        MouseMove(event);
    }).click(Click);
    $(".newgame").click(function () {
        NewGame($(this).data('for'));
    });
    function MouseMove(event) {
        if (!gameinprocess)
            return;
        X = event.pageX - canvas.offsetLeft;
        Y = event.pageY - canvas.offsetTop;
        N = Math.floor(X / cellsize);
        M = Math.floor(Y / cellsize);
        if (matrix[N][M] === 0)
            canvas.style.cursor = "pointer";
        else
            canvas.style.cursor = "";
    }

    function Click() {
        if (!gameinprocess)
            return;
        if (matrix[N][M] !== 0)
            return;
        gameinprocess = false;
        canvas.style.cursor = "";
        GameMove(N, M);
        if (gameinprocess)
            GameMoveAI();
    }

    function NewGame(a) {
        WHO = true;
        matrix = [];
        matrixAttack = {7: {7: 1}};
        freecells = size * size;
        for (var i = 0; i < size; i++) {
            matrix[i] = [];
            for (var j = 0; j < size; j++) {
                matrix[i][j] = 0;
            }
        }
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
        gameinprocess = true;
        if (a === 2)
            GameMoveAI();
    }

    function GameMoveAI() {
        gameinprocess = false;
        max = 0;
        for (var keyM in matrixAttack)
        {
            for (var keyN in matrixAttack[keyM])
            {
                if (matrixAttack[keyM][keyN] > max)
                    max = matrixAttack[keyM][keyN];
            }
        }
        goodmoves = [];
        for (var keyM in matrixAttack)
        {
            for (var keyN in matrixAttack[keyM])
            {
                if (matrixAttack[keyM][keyN] === max)
                    goodmoves[goodmoves.length] = {n: keyN, m: keyM};
            }
        }

        /*
         do {
         N = getRandomInt(0, 14);
         M = getRandomInt(0, 14);
         } while (matrix[N][M] !== 0);
         */
        movenow = goodmoves[Math.round(Math.random() * (goodmoves.length - 1))];
        N = movenow[n];
        M = movenow[m];

        delete matrixAttack[N][M];
        for (var key in directions1) {
            n = N + directions1[key].n;
            m = M + directions1[key].m;
            if (n < 0 || m < 0 || n >= size || m >= size)
                continue;
            if (!(m in matrixAttack))
                matrixAttack[m] = {};
            if (!(n in matrixAttack[n]))
                matrixAttack[m][n] = 0;
            matrixAttack[m][n]++;
            //           console.log(JSON.stringify(matrixAttack));
        }
        //matrixAttack[N][M] = 1;
        for (var keyM in matrixAttack)
        {
            for (var keyN in matrixAttack[keyM])
            {
                x = keyN * cellsize + halfcellsize / 4;
                y = keyM * cellsize + halfcellsize / 4;
                ctx.fillStyle = "#ECEABE";
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = "black";
                ctx.textBaseline = "top";
                ctx.fillText(matrixAttack[keyM][keyN], x, y);
            }
        }

        console.log(JSON.stringify(matrixAttack));
        GameMove(N, M);
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
        t = matrix[N][M];
        s = ['', '', '', ''];
        nT = Math.min(M, 4);
        nR = Math.min(size - N - 1, 4);
        nB = Math.min(size - M - 1, 4);
        nL = Math.min(N, 4);
        for (j = M - nT; j <= M + nB; j++)
            s[0] += matrix[N][j];
        for (i = N - nL; i <= N + nR; i++)
            s[1] += matrix[i][M];
        for (i = - Math.min(nT, nL); i <= Math.min(nR, nB); i++)
            s[2] += matrix[N + i][M + i];
        for (i = - Math.min(nB, nL); i <= Math.min(nR, nT); i++)
            s[3] += matrix[N + i][M - i];
        if ((k = s[0].search(pattwin[t])) >= 0)
            GameOver(N, M - nT + k, N, M - nT + k + 4);
        else if ((k = s[1].search(pattwin[t])) >= 0)
            GameOver(N - nL + k, M, N - nL + k + 4, M);
        else if ((k = s[2].search(pattwin[t])) >= 0)
            GameOver(N - Math.min(nT, nL) + k, M - Math.min(nT, nL) + k, N - Math.min(nT, nL) + k + 4, M - Math.min(nT, nL) + k + 4);
        else if ((k = s[3].search(pattwin[t])) >= 0)
            GameOver(N - Math.min(nB, nL) + k, M + Math.min(nB, nL) - k, N - Math.min(nB, nL) + k + 4, M + Math.min(nB, nL) - k - 4, -1);
        else if (freecells !== 0)
            gameinprocess = true;
    }

    function GameOver(a, b, c, d, e)
    {
        e = e || 1;
        DrawWinLine(a, b, c, d, e);
    }


    function DrawWinLine(n1, m1, n2, m2, r)
    {
        ctx.beginPath();
        ctx.strokeStyle = "#6A5D4D";
        ctx.lineWidth = "3";
        ctx.lineCap = "round";
        ctx.moveTo(n1 * cellsize + halfcellsize - crosswin * (n1 !== n2), m1 * cellsize + halfcellsize - crosswin * (m1 !== m2) * r);
        ctx.lineTo(n2 * cellsize + halfcellsize + crosswin * (n1 !== n2), m2 * cellsize + halfcellsize + crosswin * (m1 !== m2) * r);
        ctx.stroke();
    }
    function DrawX(n, m)
    {
        ctx.beginPath();
        ctx.strokeStyle = "#C1876B";
        ctx.lineWidth = "5";
        ctx.lineCap = "round";
        x = n * cellsize + halfcellsize;
        y = m * cellsize + halfcellsize;
        ctx.moveTo(x - cross, y - cross);
        ctx.lineTo(x + cross, y + cross);
        ctx.moveTo(x - cross, y + cross);
        ctx.lineTo(x + cross, y - cross);
        ctx.stroke();
    }
    function DrawO(n, m)
    {
        ctx.beginPath();
        ctx.strokeStyle = "#BEBD7F";
        ctx.lineWidth = "5";
        ctx.lineCap = "round";
        x = n * cellsize + halfcellsize;
        y = m * cellsize + halfcellsize;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
});
