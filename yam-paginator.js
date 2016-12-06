/*!
 * Yet Another Mediocre paginator v0.0.1
 */


 /**
  * usage: var pagination = new Paginator('.elements' [, {itemsPerPage: 10, showLimit: 10, initPage: 3}])
  *
  * @param {string} items - jQuery selector for elements to paginate
  * @param {object} config - config object
  */
var Paginator = function (items, config) {
    this.items = jQuery(items);
    this.el = jQuery('<div class="paginator" data-current_page=""></div>');
    this.first = 0;
    // apply eventual config
    this.config = {
        itemsPerPage: 20,
        showLimit: 5,
        initPage: this.first
    }
    if (config) {
        for (var e in config) {
            if (this.config.hasOwnProperty(e)) {
                this.config[e] = config[e];
            }
        }
    }
    this.last = Math.ceil(this.items.length / this.config.itemsPerPage) - 1;
    this.currentPage = this.config.initPage;
    this.halfCut = Math.floor(this.config.showLimit / 2);
    this.ui = {
        container: '<table class="paginator__nav" role="presentation"><tbody><tr></tr></tbody></table>',
        first: [
            '<td class="paginator__navend"><span class="paginator__switch inactive" aria-hidden="true">&laquo;</span></td>',
            '<td class="paginator__navend"><a href="#" class="paginator__switch active js-paginatorSwitch" data-switch_page="first">&laquo;</a></td>'
        ],
        prev: [
            '<td class="paginator__navend"><span class="paginator__switch inactive" aria-hidden="true">&lsaquo;</span></td>',
            '<td class="paginator__navend"><a href="#" class="paginator__switch active js-paginatorSwitch" data-switch_page="prev">&lsaquo;</a></td>'
        ],
        last: [
            '<td class="paginator__navend"><span class="paginator__switch inactive" aria-hidden="true">&raquo;</span></td>',
            '<td class="paginator__navend"><a href="#" class="paginator__switch active js-paginatorSwitch" data-switch_page="last">&raquo;</a></td>'
        ],
        next: [
            '<td class="paginator__navend"><span class="paginator__switch inactive" aria-hidden="true">&rsaquo;</span></td>',
            '<td class="paginator__navend"><a href="#" class="paginator__switch active js-paginatorSwitch" data-switch_page="next">&rsaquo;</a></td>'
        ]
    };
    // overridable render method
    this._renderItem = function (num) {
        if (num === this.currentPage) {
            return '<td><span class="paginator__switch current" role="button" aria-pressed="true">' + (num + 1) + '</span></td>';
        }
        return '<td><a href="#" class="paginator__switch active js-paginatorSwitch" data-switch_page="' + num + '">' + (num + 1) + '</a></td>';
    };
    // init paginator
    this.init();
};
Paginator.prototype = {
    constructor: Paginator,
    init: function () {
        if (this.items.length > this.config.itemsPerPage) {
            this.el.append(this.ui.container).appendTo(this.items.parent());
        }
        this.switchTo(this.config.initPage, true).listen();
        return this;
    },
    updateItems: function (selector) {
        this.items = (selector && selector.length) ? jQuery(selector) : jQuery(this.items.selector);
        this.last = Math.ceil(this.items.length / this.config.itemsPerPage) - 1;
        this.el.empty();
        this.init();
        return this;
    },
    listen: function () {
        var obj = this;
        obj.el.on('click', '.js-paginatorSwitch', function (e) {
            if (!obj.el.hasClass('idle')) {
                obj.triggerSwitch.call(obj, jQuery(this).attr('data-switch_page'));
            }
            return false
        });
    },
    triggerSwitch: function (page) {
        switch (page) {
            case 'next':
                this.nextPage();
                break;
            case 'prev':
                this.prevPage();
                break;
            case 'first':
                this.firstPage();
                break;
            case 'last':
                this.lastPage();
                break;
            default:
                this.switchTo(parseInt(page));
        }
        return this;
    },
    switchTo: function (page, init) {
        this.setCurrentPage(page).draw();
        if (!init) {
            var self = this;
            self.el.addClass('idle');
            setTimeout(function () {
                self.scrollBackTop(page);
            }, 180);
        } else {
            this.applySwitch(page);
        }
        return this;
    },
    applySwitch: function (page) {
        var firstIndex = page * this.config.itemsPerPage;
        this.items.hide().slice(firstIndex, firstIndex + this.config.itemsPerPage).show();
        return this;
    },
    getCurrentPage: function () {
        return parseInt(this.el.attr('data-current_page'));
    },
    setCurrentPage: function (page) {
        this.currentPage = page;
        this.el.attr('data-current_page', page);
        return this;
    },
    nextPage: function () {
        this.switchTo(this.currentPage + 1);
        return this;
    },
    prevPage: function () {
        this.switchTo(this.currentPage - 1);
        return this;
    },
    firstPage: function () {
        this.switchTo(this.first);
        return this;
    },
    lastPage: function () {
        this.switchTo(this.last);
        return this;
    },
    draw: function () {
        var pages = this.el.find('tr').empty(),
            lCut = this.currentPage - this.halfCut,
            rCut = this.currentPage + this.halfCut,
            start,
            end;
        if (lCut > this.first && rCut > this.last)
            lCut -= rCut - this.last;
        if (rCut < this.last && lCut < this.first)
            rCut += Math.abs(lCut - this.first);
        start = lCut > this.first ? lCut : this.first;
        end = rCut < this.last ? rCut : this.last;
        if (this.currentPage !== this.first) {
            pages.append([this.ui.first[1], this.ui.prev[1]]);
        } else {
            pages.append([this.ui.first[0], this.ui.prev[0]])
        }
        for (var i = start; i <= end; i++) {
            pages.append(this._renderItem(i));
        }
        if (this.currentPage !== this.last) {
            pages.append([this.ui.next[1], this.ui.last[1]]);
        } else {
            pages.append([this.ui.next[0], this.ui.last[0]]);
        }
        return this;
    },
    scrollBackTop: function (page) {
        var self = this,
            scrollPos = self.items.parent().offset().top - 18;
        jQuery('html, body').stop().animate({scrollTop: scrollPos + 'px'}, {
            done: function () {
                self.applySwitch.call(self, page);
                self.el.removeClass('idle');
            }
        });
        return this;
    }
};
