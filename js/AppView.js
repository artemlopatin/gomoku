;
'use strict';

var AppView = function(model) {
    var AppView = this;
    this.model = model;
    this.canvas;
    this.ctx;
    this.cellsize = 40, this.halfcellsize = 20, this.radius = 12, this.cross = 10, this.crosswin = 15;
    this.color = {canvas: '#ECEABE', border: 'silver', winline: '#6A5D4D'};
    this.init = function() {
        AppView.canvas = document.getElementById('board');
        AppView.ctx = AppView.canvas.getContext('2d');
        AppView.canvas.height = 601;
        AppView.canvas.width = 601;
    };

    this.renderBoard = function() {
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
    };

    this.renderMove = function(nm) {
        n = nm.n || this.model.N;
        m = nm.m || this.model.M;
        if (this.model.matrix[n][m] === 1)
            this.renderX(n, m);
        else
            this.renderO(n, m);
        this.renderMoveHash();
    };

    this.renderMoveHash = function() {
        for (var n in this.model.hashStep)
        {
            for (var m in this.model.hashStep[n])
            {
                var x = m * this.cellsize + 3 * this.halfcellsize / 4;
                var y = n * this.cellsize + this.halfcellsize / 4;
                var ctx = this.ctx;
                var color = this.color;
                ctx.fillStyle = color.canvas;
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = color.border;
                ctx.textBaseline = 'top';
                ctx.fillText((this.model.hashStep[n][m].attack + this.model.hashStep[n][m].defence), x, y);
                var x = m * this.cellsize + this.halfcellsize / 4;
                var y = n * this.cellsize + 3 * this.halfcellsize / 4;
                ctx.fillStyle = color.canvas;
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = color.border;
                ctx.textBaseline = 'top';
                ctx.fillText(this.model.hashStep[n][m].attack, x, y);
                var x = m * this.cellsize + 6 * this.halfcellsize / 4;
                var y = n * this.cellsize + 3 * this.halfcellsize / 4;
                ctx.fillStyle = color.canvas;
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = color.border;
                ctx.textBaseline = 'top';
                ctx.fillText(this.model.hashStep[n][m].defence, x, y);
            }
        }
    };

    this.renderWinLine = function()
    {
        var ctx = this.ctx;
        var cellsize = this.cellsize;
        var halfcellsize = this.halfcellsize;
        var crosswin = this.crosswin;
        var m1 = this.model.winLine[0];
        var n1 = this.model.winLine[1];
        var m2 = this.model.winLine[2];
        var n2 = this.model.winLine[3];
        r = this.model.winLine[4] || 1;
        ctx.beginPath();
        ctx.strokeStyle = this.color.winline;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.moveTo(m1 * cellsize + halfcellsize - crosswin * (m1 !== m2), n1 * cellsize + halfcellsize - crosswin * (n1 !== n2) * r);
        ctx.lineTo(m2 * cellsize + halfcellsize + crosswin * (m1 !== m2), n2 * cellsize + halfcellsize + crosswin * (n1 !== n2) * r);
        ctx.stroke();
    };

    this.renderX = function(n, m)
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

    this.renderO = function(n, m)
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

    this.setStyleCursor = function(x, y) {
        var n = Math.floor(y / this.cellsize);
        var m = Math.floor(x / this.cellsize);
        if (n < this.model.size && m < this.model.size && this.model.matrix[n][m] === 0)
            this.canvas.style.cursor = 'pointer';
        else
            this.canvas.style.cursor = 'default';
        return {n: n, m: m};
    };

    this.init();
};