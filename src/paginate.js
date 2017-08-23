class Paginate {
    get defaults() {
        return {
            page: 1,
            min: 1,
            max: 999,
            size: 10,
            showPageNum: 5,
            hidePageNum: 2,
            ellipsis: "..."
        };
    }

    constructor(opts) {
        this.update(opts);
    }

    update(opts) {
        let that = this;

        Object.assign(that, that.defaults, opts);

        if (that.showPageNum >= that.max) {
            that.showPageNum = that.max;
            that.hidePageNum = 0;
        }
    }

    prev(page) {
        return this.turn(this.page - (page | 0 || 1));
    }

    next(page) {
        return this.turn(this.page + (page | 0 || 1));
    }

    first() {
        return this.turn(this.min);
    }

    last() {
        return this.turn(this.max);
    }

    turn(page) {
        let that = this,
            result = [],
            half = that.showPageNum / 2 | 0;

        page = page | 0 || that.min;

        if (page < that.min) {
            page = that.min;
        } else if (page > that.max) {
            page = that.max;
        }

        let showPageMax = page + half,
            showPageMin = page - half;

        if (showPageMin < that.min) {
            showPageMin = that.min;
        }

        if (showPageMax > that.max) {
            showPageMax = that.max;
        }

        if (showPageMax < that.showPageNum) {
            showPageMax = that.showPageNum;
        }

        if (showPageMax - showPageMin < that.showPageNum) {
            showPageMin = showPageMax - that.showPageNum > that.min ? showPageMax - that.showPageNum : that.min;
        }

        if (showPageMin > that.min) {
            result.push(that.min);
        }

        if (that.hidePageNum > 0 && showPageMin - that.min >= that.hidePageNum) {
            result.push(that.ellipsis);
        }

        result.push(...that.createArray(showPageMax, showPageMin));

        if (that.hidePageNum > 0 && that.max - showPageMax >= that.hidePageNum) {
            result.push(that.ellipsis);
        }

        if (showPageMax < that.max) {
            result.push(that.max);
        }

        that.page = page;

        return result;
    }

    createArray(end, start = 1) {
        let arr = [];

        if (end < 0) {
            return [];
        }

        while (end >= start) {
            arr.unshift(end--);
        }

        return arr;
    }
}