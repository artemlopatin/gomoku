;
'use strict';
console.log('model file');

var AppModel = function() {
    console.log('model');
    var AppModel = this;
    this.canvas;
    this.ctx;
    this.mouse;
    this.X, this.M, this.Y, this.N;
    this.size = 15, this.cellsize = 40, this.halfcellsize = 20, this.radius = 12, this.cross = 10, this.crosswin = 15;
    this.WHO;
    this.matrix;
    this.freecells;
    this.hashStep;
    this.pattwin = [0, /(1){5}/, /(2){5}/];
    this.directions1 = {1: {n: -1, m: -1}, 2: {n: -1, m: 0}, 3: {n: -1, m: 1}, 4: {n: 0, m: -1}, 5: {n: 0, m: 1}, 6: {n: 1, m: -1}, 7: {n: 1, m: 0}, 8: {n: 1, m: 1}};
    this.color = {canvas: '#ECEABE', border: 'silver', winline: '#6A5D4D'};
    this.gameinprocess;

    this.move = function(x, y) {
        if (!AppModel.gameinprocess)
            return;
        AppModel.N = Math.floor(y / AppModel.cellsize);
        AppModel.M = Math.floor(x / AppModel.cellsize);
        if (AppModel.N < AppModel.size && AppModel.M < AppModel.size && AppModel.matrix[AppModel.N][AppModel.M] === 0)
            AppModel.canvas.style.cursor = 'pointer';
        else
            AppModel.canvas.style.cursor = 'default';
    };

    this.click = function() {
        if (!AppModel.gameinprocess)
            return;
        if (AppModel.matrix[AppModel.N][AppModel.M] !== 0)
            return;
        AppModel.gameinprocess = false;
        AppModel.canvas.style.cursor = 'default';
        AppModel.GameMoveUser(AppModel.N, AppModel.M);
        if (AppModel.gameinprocess)
            AppModel.GameMoveAI();
    };
    this.init = function() {
        AppModel.canvas = document.getElementById('board');
        AppModel.ctx = AppModel.canvas.getContext('2d');
        AppModel.canvas.height = 601;
        AppModel.canvas.width = 601;
        AppModel.mouse = new MouseController(AppModel.canvas, AppModel.move, AppModel.click);
        AppModel.newGame(2);
    };
    this.newGame = function(a) {
        this.WHO = true;
        this.matrix = [];
        this.hashStep = {7: {7: {attack: 1, sum: 0, defence: 0}}};
        this.freecells = this.size * this.size;
        for (var i = 0; i < this.size; i++) {
            this.matrix[i] = [];
            for (var j = 0; j < this.size; j++) {
                this.matrix[i][j] = 0;
            }
        }
        this.ctx.fillStyle = this.color.canvas;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.width);
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color.border;
        this.ctx.lineWidth = 1;
        for (var x = 0.5; x < this.canvas.width; x += this.cellsize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        for (var y = 0.5; y < this.canvas.height; y += this.cellsize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        this.ctx.stroke();
        this.gameinprocess = true;
        if (a === 2)
            this.GameMoveAI();
    };
    this.GameMoveAI = function() {
        var keyN, keyM;
        this.gameinprocess = false;
        var max = 0;
        for (keyN in this.hashStep)
        {
            for (keyM in this.hashStep[keyN])
            {
                this.hashStep[keyN][keyM].sum = this.hashStep[keyN][keyM].attack + this.hashStep[keyN][keyM].defence;
                if (this.hashStep[keyN][keyM].sum > max)
                    max = this.hashStep[keyN][keyM].sum;
            }
        }
        var goodmoves = [];
        for (keyN in this.hashStep)
        {
            for (keyM in this.hashStep[keyN])
            {
                if (this.hashStep[keyN][keyM].sum === max) {
                    goodmoves[goodmoves.length] = {n: parseInt(keyN), m: parseInt(keyM)};
                }
            }
        }
        var movenow = goodmoves[this.getRandomInt(0, goodmoves.length - 1)];
        //console.log(JSON.stringify(this.hashStep));
        this.N = movenow.n;
        this.M = movenow.m;
        delete this.hashStep[this.N][this.M];
        for (var key in this.directions1) {
            var n = this.N + this.directions1[key].n;
            var m = this.M + this.directions1[key].m;
            if (n < 0 || m < 0 || n >= this.size || m >= this.size)
                continue;
            if (this.matrix[n][m] !== 0)
                continue;
            if (!(n in this.hashStep))
                this.hashStep[n] = {};
            if (!(m in this.hashStep[n]))
                this.hashStep[n][m] = {attack: 0, sum: 0, defence: 0};
            this.hashStep[n][m].attack++;
        }
        //hashStep[N][M] = 1;
        for (keyN in this.hashStep)
        {
            for (keyM in this.hashStep[keyN])
            {
                var x = keyM * this.cellsize + 3 * this.halfcellsize / 4;
                var y = keyN * this.cellsize + this.halfcellsize / 4;
                var ctx = this.ctx;
                var color = this.color;
                ctx.fillStyle = color.canvas;
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = color.border;
                ctx.textBaseline = 'top';
                ctx.fillText((this.hashStep[keyN][keyM].attack + this.hashStep[keyN][keyM].defence), x, y);
                var x = keyM * this.cellsize + this.halfcellsize / 4;
                var y = keyN * this.cellsize + 3 * this.halfcellsize / 4;
                ctx.fillStyle = color.canvas;
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = color.border;
                ctx.textBaseline = 'top';
                ctx.fillText(this.hashStep[keyN][keyM].attack, x, y);
                var x = keyM * this.cellsize + 6 * this.halfcellsize / 4;
                var y = keyN * this.cellsize + 3 * this.halfcellsize / 4;
                ctx.fillStyle = color.canvas;
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = color.border;
                ctx.textBaseline = 'top';
                ctx.fillText(this.hashStep[keyN][keyM].defence, x, y);
            }
        }
        this.GameMove(this.N, this.M);
    };

    this.GameMoveUser = function(n, m)
    {
        if (this.hashStep[n] && this.hashStep[n][m])
            delete this.hashStep[n][m];
        this.GameMove(n, m);
        for (var key in this.directions1) {
            var nD = n + this.directions1[key].n;
            var mD = m + this.directions1[key].m;
            if (nD < 0 || mD < 0 || nD >= this.size || mD >= this.size)
                continue;
            if (this.matrix[nD][mD] !== 0)
                continue;
            if (!(nD in this.hashStep))
                this.hashStep[nD] = {};
            if (!(mD in this.hashStep[nD]))
                this.hashStep[nD][mD] = {attack: 0, sum: 0, defence: 0};
            this.hashStep[nD][mD].defence++;
        }
    };

    this.GameMove = function(n, m)
    {
        this.matrix[n][m] = 2 - this.WHO;
        if (this.WHO)
            this.DrawX(n, m);
        else
            this.DrawO(n, m);
        this.WHO = !this.WHO;
        this.freecells--;
        this.IsGameOver();
    };

    this.IsGameOver = function() {
        //console.log(this.N);
        var t = this.matrix[this.N][this.M];
        var s = ['', '', '', ''];
        var nT = Math.min(this.N, 4);
        var nR = Math.min(this.size - this.M - 1, 4);
        var nB = Math.min(this.size - this.N - 1, 4);
        var nL = Math.min(this.M, 4);
        for (var j = this.N - nT; j <= this.N + nB; j++)
            s[0] += this.matrix[j][this.M];
        for (var i = this.M - nL; i <= this.M + nR; i++)
            s[1] += this.matrix[this.N][i];
        for (var i = -Math.min(nT, nL); i <= Math.min(nR, nB); i++)
            s[2] += this.matrix[this.N + i][this.M + i];
        for (var i = -Math.min(nB, nL); i <= Math.min(nR, nT); i++)
            s[3] += this.matrix[this.N - i][this.M + i];
        var k;
        if ((k = s[0].search(this.pattwin[t])) >= 0)
            this.GameOver(this.M, this.N - nT + k, this.M, this.N - nT + k + 4);
        else if ((k = s[1].search(this.pattwin[t])) >= 0)
            this.GameOver(this.M - nL + k, this.N, this.M - nL + k + 4, this.N);
        else if ((k = s[2].search(this.pattwin[t])) >= 0)
            this.GameOver(this.M - Math.min(nT, nL) + k, this.N - Math.min(nT, nL) + k, this.M - Math.min(nT, nL) + k + 4, this.N - Math.min(nT, nL) + k + 4);
        else if ((k = s[3].search(this.pattwin[t])) >= 0)
            this.GameOver(this.M - Math.min(nB, nL) + k, this.N + Math.min(nB, nL) - k, this.M - Math.min(nB, nL) + k + 4, this.N + Math.min(nB, nL) - k - 4, -1);
        else if (this.freecells !== 0)
            this.gameinprocess = true;
    };
    this.GameOver = function(m1, n1, m2, n2, r)
    {
        var ctx = this.ctx;
        var cellsize = this.cellsize;
        var halfcellsize = this.halfcellsize;
        var crosswin = this.crosswin;
        r = r || 1;
        ctx.beginPath();
        ctx.strokeStyle = this.color.winline;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.moveTo(m1 * cellsize + halfcellsize - crosswin * (m1 !== m2), n1 * cellsize + halfcellsize - crosswin * (n1 !== n2) * r);
        ctx.lineTo(m2 * cellsize + halfcellsize + crosswin * (m1 !== m2), n2 * cellsize + halfcellsize + crosswin * (n1 !== n2) * r);
        ctx.stroke();
    };
    this.DrawX = function(n, m)
    {
        var ctx = this.ctx;
        ctx.beginPath();
        var x = m * this.cellsize + this.halfcellsize;
        var y = n * this.cellsize + this.halfcellsize;
        ctx.fillStyle = this.color.canvas;
        ctx.fillRect(x - this.halfcellsize + 1, y - this.halfcellsize + 1, this.cellsize - 2, this.cellsize - 2);
        ctx.strokeStyle = '#C1876B';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.moveTo(x - this.cross, y - this.cross);
        ctx.lineTo(x + this.cross, y + this.cross);
        ctx.moveTo(x - this.cross, y + this.cross);
        ctx.lineTo(x + this.cross, y - this.cross);
        ctx.stroke();
    };
    this.DrawO = function(n, m)
    {
        var ctx = this.ctx;
        ctx.beginPath();
        var x = m * this.cellsize + this.halfcellsize;
        var y = n * this.cellsize + this.halfcellsize;
        ctx.fillStyle = this.color.canvas;
        ctx.fillRect(x - this.halfcellsize + 1, y - this.halfcellsize + 1, this.cellsize - 2, this.cellsize - 2);
        ctx.strokeStyle = '#BEBD7F';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
    };
    this.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
};
/*
 
 
 
 */