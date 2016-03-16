;
'use strict';

var GamePattern = function() {
    this.prePattern = [ // Шаблоны построения фигур и их веса. "x" в дальнейшем заменяется на крестик (1) или нолик (2), 0 - свободная ячейка
        {w: 10000, p: ['xxxxx']}, // Пять в ряд. Победа
        {w: 1000, p: ['0xxxx0']}, // Открытая четверка. Один ход до победы, 100% победа (соперник не может закрыть одним ходом)
        {w: 500, p: ['xxxx0']}, // Полузакрытая четверка. Один ход до победы, но соперник может заблокировать
        {w: 400, p: ['x0xxx', 'xx0xx']}, // Четверка с брешью. Один ход до победы, но соперник может заблокировать
        {w: 100, p: ['00xxx000']}, // Открытая тройка (как 2 полузакрытых)
        {w: 80, p: ['00xxx00']}, // Открытая тройка (как 2 полузакрытых)
        {w: 75, p: ['0xxx00']}, // Открытая тройка (как 2 полузакрытых)
        {w: 50, p: ['0xxx0','xxx00']}, // Полузакрытая тройка
        {w: 25, p: ['x0xx0', 'xx0x0', 'x00xx']}, // Тройка с брешью
        {w: 10, p: ['000xx000']}, // Открытая двойка
        {w: 5, p: ['0xx0']} // Открытая двойка
    ];
    this.pattern = [[], [], []]; // Массив шаблонов для Х и 0, генерируется из предыдущих шаблонов. Вес, для X, для O
    this.winnerLine = ['', /(1){5,}/, /(2){5,}/]; // Выигрышный шаблон, 1 - для Х, 2 - для О
    this.possibleLine = ['', /[01]*7[01]*/, /[02]*7[02]*/]; // Шаблон определения возможности поставить 5 в ряд (если длина линии будет >=5)
    this.emptyPatern = '000070000'; // Шаблон "пустой строки" бессмысленной для анализа

    this.init = function() {
        var s, a, l;
        for (var i in this.prePattern)
            for (var j in this.prePattern[i].p) { // Заполнение массива шаблонов построений фигур для крестиков (1) и ноликов (2)
                s = this.prePattern[i].p[j];
                a = replace7x(s);
                if ((s2 = reverseString(s)) !== s)
                    a = a.concat(replace7x(s2));
                s = '(' + a.join('|') + ')';
                l = this.pattern[0].length;
                this.pattern[0][l] = this.prePattern[i].w; // Веса шаблонов
                this.pattern[1][l] = new RegExp(s.replace(/x/g, '1')); // Шаблоны для Х, например 01110 - открытая четверка
                this.pattern[2][l] = new RegExp(s.replace(/x/g, '2')); // Аналогично для 0 - 022220
            }
    };

    this.isWinnerLine = function(xo, s) {
        return s.search(this.winnerLine[xo]) !== -1;
    };

    this.getWinnerLine = function(xo, s) {
        var start = s.search(this.winnerLine[xo]);
        if (start === -1)
            return false;
        return [start, this.winnerLine[xo].exec(s)[0].length];
    };

    this.getLengthWinnerLine = function(xo, s) {
        return this.winnerLine[xo].exec(s)[0].length;
    };

    this.isPossibleLine = function(xo, s) {
        var r = this.possibleLine[xo].exec(s);
        if (r !== null)
            return r[0].length >= 5;
        return false;
    };

    this.getWeightPattern = function(xo, s) {
        var w = 0;
        for (var i in this.pattern[xo]) // перебор по всем шаблонам
            if (this.pattern[xo][i].test(s)) { // если нашли соответствие
                w += this.pattern[0][i];
                break;
            }
        return w;
    };

    this.init();
};