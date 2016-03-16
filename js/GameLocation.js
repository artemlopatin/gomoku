;
'use strict';

var GameLocation = function() {
    this.m; // Номер ячейки по горизонтали (номер столбца)
    this.n; // Номер ячейки по вертикали (номер строки)
    this.size = 15; // Размер поля (15х15 ячеек)
    this.matrix; // Матрица игрового поля 15х15. 0 - свободная клетка, 1 - крестик, 2 - нолик
    this.potentialMove; // Хеш-массив потенциальных ходов
    this.oldN; // Номер ячейки по горизонтали (номер столбца)
    this.oldM; // Номер ячейки по вертикали (номер строки)
    this.oldPotentialMove;
    this.goodMoves;
    this.pattern;

    this.init = function(pattern) {
        this.pattern = pattern;
    };

    this.start = function() { // Начальные установки для каждой новой игры
        this.matrix = [];
        this.potentialMove = {};
        for (var n = 0; n < this.size; n++) {
            this.matrix[n] = [];
            for (var m = 0; m < this.size; m++)
                this.matrix[n][m] = 0;
        }
        this.oldN = -1;
        this.oldM = -1;
    };

    this.setFirstPotentialMove = function() {
        this.potentialMove = {7: {7: {sum: 0, attack: 0, defence: 0}}};
    };

    this.setNM = function(a) { // Установка координат текущего хода (в номерах ячеек)
        this.n = a[0];
        this.m = a[1];
    };

    this.emptyCell = function(a, b) { // Проверка ячейки на доступность для хода
        var n = a || this.n;
        var m = b || this.m;
        return this.matrix[n][m] === 0;
    };

    this.getGoodMoves = function() {
        var hs = this.potentialMove;
        var max = 0;
        var n, m;
        var goodMoves = [];
        for (n in hs)         // Поиск веса лучшего хода
            for (m in hs[n])
                if (hs[n][m].sum > max)
                    max = hs[n][m].sum;
        max = 0.9 * max; // Берем не только самый лучший ход, а несколько из лучших (в пределах 10% по значению важности)
        for (n in hs)
            for (m in hs[n])
                if (hs[n][m].sum >= max)
                    goodMoves[goodMoves.length] = [parseInt(n), parseInt(m)];
        this.goodMoves = goodMoves;
        return goodMoves;
    };

    this.getRandomGoodMove = function() {
        var goodMoves = this.getGoodMoves();
        return goodMoves[getRandomInt(0, goodMoves.length - 1)]; // Выбор хода случайным образом из лучших
    };

    this.saveMove = function(n, m, xo) {
        this.matrix[n][m] = xo;
    };

    this.updatePotentialMove = function(n, m) {
        var hs = this.potentialMove;
        if (hs[n] && hs[n][m])
            delete hs[n][m]; // Если поле хода было в массиве потенциальных ходов, то поле удаляется из него
        var nd, md;
        for (var i = -2; i <= 2; i++)
            for (var j = -2; j <= 2; j++) {
                nd = i + n;
                md = j + m;
                if (nd < 0 || md < 0 || nd >= this.size || md >= this.size)
                    continue;
                if (this.matrix[nd][md] !== 0)
                    continue;
                if (!(nd in hs))
                    hs[nd] = {};
                if (!(md in hs[nd]))
                    hs[nd][md] = {sum: 0, attack: 0, defence: 0};
            }
        this.potentialMove = hs;
    };

    this.getOneSymbol = function(i, n, m, test) {
        if (n >= 0 && m >= 0 && n < this.size && m < this.size)
            return (test && i === 0) ? '7' : this.matrix[n][m];
    };

    this.getLine = function(j, n, m, test) {
        var s;
        for (var i = -4; i <= 4; i++) // Цикл перебора на расстоянии +/- 4 клеток от рассматриваемой
            if (j === 1)
                s += this.getOneSymbol(i, n + i, m, test);
            else if (j === 2)
                s += this.getOneSymbol(i, n, m + i, test);
            else if (j === 3)
                s += this.getOneSymbol(i, n + i, m + i, test);
            else
                s += this.getOneSymbol(i, n - i, m + i, test);
    };

    this.getAllLines = function(n, m, a) { // Получение 4 линий:  | — \ /
        var test = a || false;
        var lines = [];
        for (var j = 1; j <= 4; j++)
            lines[lines.lenght] = getLine(j, n, m, test);
        return lines;
    };

    this.getLines = function(n, m, a) { // Получение 4 линий:  | — \ /  -- оптимизированный аналог getAllLines
        var test = a || false;
        var nT = Math.min(n, 4);
        var nR = Math.min(this.size - m - 1, 4);
        var nB = Math.min(this.size - n - 1, 4);
        var nL = Math.min(m, 4);
        var lines = ['', '', '', ''];//[['', 1, n - nT, m], ['', 1, n, m - nL], ['', 3, n - Math.min(nT, nL), m - Math.min(nT, nL)], ['', 4, n + Math.min(nB, nL), m - Math.min(nB, nL)]];

        for (var j = n - nT; j <= n + nB; j++)
            lines[0] += (test && j === n) ? '7' : this.matrix[j][m];
        for (var i = m - nL; i <= m + nR; i++)
            lines[1] += (test && i === m) ? '7' : this.matrix[n][i];
        for (var i = -Math.min(nT, nL); i <= Math.min(nR, nB); i++)
            lines[2] += (test && i === 0) ? '7' : this.matrix[n + i][m + i];
        for (var i = -Math.min(nB, nL); i <= Math.min(nR, nT); i++)
            lines[3] += (test && i === 0) ? '7' : this.matrix[n - i][m + i];
        return lines;
    };

    this.calculatePotentialMovePattern = function(xAI) { // Расчет весов потенциальных ходов по заданным шаблонам
        var hs = this.potentialMove;
        var s;
        var weight1;
        var weight2;
        var lines;
        for (n in hs)
            for (m in hs[n]) { // Перебор всех потенциальных ходов
                weight1 = 0;
                weight2 = 0;
                lines = this.getLines(parseInt(n), parseInt(m), true);
                for (var i in lines) {
                    s = lines[i];
                    if (s === this.pattern.emptyPatern)
                        continue;
                    if (this.pattern.isPossibleLine(1, s))
                        weight1 += this.pattern.getWeightPattern(1, s);
                    if (this.pattern.isPossibleLine(2, s))
                        weight2 += this.pattern.getWeightPattern(2, s);
                }
                if (xAI) { // если AI играет за X
                    hs[n][m].attack = weight1;
                    hs[n][m].defence = weight2;
                } else {
                    hs[n][m].attack = weight2;
                    hs[n][m].defence = weight1;
                }
                //if (hs[n][m].defence < 20)
                //    hs[n][m].defence = 0;
                hs[n][m].sum = hs[n][m].attack + hs[n][m].defence; // Атака предпочтительнее дефа
            }
        this.potentialMove = hs;
    };
};