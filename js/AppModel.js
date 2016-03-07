;
'use strict';

var AppModel = function() {
    this.mouse;
    this.X, this.M, this.Y, this.N;
    this.size = 15;
    this.who;
    this.matrix;
    this.freecells;
    this.hashStep;
    this.pattwin = [0, /(1){5}/, /(2){5}/];
    this.directions = {1: {n: -1, m: -1}, 2: {n: -1, m: 0}, 3: {n: -1, m: 1}, 4: {n: 0, m: -1}, 5: {n: 0, m: 1}, 6: {n: 1, m: -1}, 7: {n: 1, m: 0}, 8: {n: 1, m: 1}};
    this.gameinprocess;
    this.winLine;

    this.init = function() {
    };

    this.setStartData = function() {
        this.who = true;
        this.matrix = [];
        this.winLine = [0,10,20,30,1];
        this.hashStep = {7: {7: {attack: 1, sum: 0, defence: 0}}};
        this.freecells = this.size * this.size;
        for (var i = 0; i < this.size; i++) {
            this.matrix[i] = [];
            for (var j = 0; j < this.size; j++) {
                this.matrix[i][j] = 0;
            }
        }
        this.gameinprocess = true;
        
    };

    this.setNM = function(a) {
        this.N = a.n;
        this.M = a.m;
    };

    this.moveUser = function() {
        this.gameinprocess = false;
        var n = this.N;
        var m = this.M;
        if (this.matrix[n][m] !== 0)
            return false;

        if (this.hashStep[n] && this.hashStep[n][m])
            delete this.hashStep[n][m];

        for (var key in this.directions) {
            var i = n + this.directions[key].n;
            var j = m + this.directions[key].m;
            if (i < 0 || j < 0 || i >= this.size || j >= this.size)
                continue;
            if (this.matrix[i][j] !== 0)
                continue;
            if (!(i in this.hashStep))
                this.hashStep[i] = {};
            if (!(j in this.hashStep[i]))
                this.hashStep[i][j] = {attack: 0, sum: 0, defence: 0};
            this.hashStep[i][j].defence++;
        }
        return this.move(n, m);
    };


    this.moveAI = function() {
        this.gameinprocess = false;
        var keyN, keyM;
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
        var movenow = goodmoves[getRandomInt(0, goodmoves.length - 1)];
        //console.log(JSON.stringify(this.hashStep));
        this.N = movenow.n;
        this.M = movenow.m;
        delete this.hashStep[this.N][this.M];
        for (var key in this.directions) {
            var n = this.N + this.directions[key].n;
            var m = this.M + this.directions[key].m;
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
        return this.move(this.N, this.M);
    };

    this.move = function(n, m) {
        this.matrix[n][m] = 2 - this.who;
        this.who = !this.who;
        this.freecells--;

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
            this.winLine = [this.M, this.N - nT + k, this.M, this.N - nT + k + 4];
        else if ((k = s[1].search(this.pattwin[t])) >= 0)
            this.winLine = [this.M - nL + k, this.N, this.M - nL + k + 4, this.N];
        else if ((k = s[2].search(this.pattwin[t])) >= 0)
            this.winLine = [this.M - Math.min(nT, nL) + k, this.N - Math.min(nT, nL) + k, this.M - Math.min(nT, nL) + k + 4, this.N - Math.min(nT, nL) + k + 4];
        else if ((k = s[3].search(this.pattwin[t])) >= 0)
            this.winLine = [this.M - Math.min(nB, nL) + k, this.N + Math.min(nB, nL) - k, this.M - Math.min(nB, nL) + k + 4, this.N + Math.min(nB, nL) - k - 4, -1];
        else if (this.freecells !== 0)
            this.gameinprocess = true;
        return {n: n, m: m};
    };

    this.init();
};