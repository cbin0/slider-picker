'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  if (!window.jQuery) return;

  var $ = window.jQuery;

  var defaults = {
    points: 10,
    start: 1,
    end: 10,
    tooltipPosition: 'bottom',
    tooltip: function tooltip(index) {
      return index;
    },
    onchange: function onchange(start, end) {}
  };
  var template = '\n    <div class="slider-slot">\n      <div class="slider-points"></div>\n      <div class="slider-bar"></div>\n    </div>\n  ';
  var templatePoint = '\n    <div class="slider-point"></div>\n  ';
  var templateCurrent = '\n    <div class="slider-current">\n      <div class="slider-current-tooltip"></div>\n      <div class="slider-current-tooltip-arrow"></div>\n    </div>\n  ';

  $.fn.silderRange = function (opts) {
    var options = $.extend({}, defaults, opts);

    options.start = Math.floor(options.start);
    options.end = Math.floor(options.end);

    if (options.start < 1) {
      options.start = 1;
    }
    if (options.end > options.points) {
      options.end = options.points;
    }
    if (['top', 'bottom'].indexOf(options.tooltipPosition) < 0) {
      options.tooltipPosition = 'bottom';
    }

    this.slider = new Slider(this, options);
  };

  var Slider = function () {
    function Slider(input, options) {
      _classCallCheck(this, Slider);

      var el = $(template);
      this.input = input;
      this.$el = el;
      this.$slot = el.find('.slider-slot');
      this.$bar = el.find('.slider-bar');
      this.$points = el.find('.slider-points');
      this.options = options;
      this.status = {
        mousedown: false,
        current: null
      };
      this.anchors = [];
      this.pointEls = [];
      this.pointSpace = 0;

      input.parent().append(el);
      input.hide();

      this.appendPoints();
      this.initAnchors();
      this.initCurrent();
      this.bindEvents();
      this.change(this.options.start, this.options.end);
    }

    // 初始化点


    _createClass(Slider, [{
      key: 'appendPoints',
      value: function appendPoints() {
        var _this = this;
        var points = this.options.points;

        this.pointSpace = 100 / (points - 1);
        this.pointEls = [];
        for (var i = 1; i <= points; i++) {
          var left = this.pointSpace * (i - 1) + '%';
          var $point = $(templatePoint).css({
            left: left
          }).data('point', i).data('left', left);
          this.$points.append($point);
          this.pointEls.push($point);
        }
      }

      // 初始化锚点

    }, {
      key: 'initAnchors',
      value: function initAnchors() {
        var _this = this;
        var pointSpacePx = this.pointSpace * this.$points.width() / 100;
        this.anchors = [];
        this.pointEls.forEach(function ($point, i) {
          _this.anchors.push({
            left: pointSpacePx * (i - 1) + pointSpacePx / 2,
            rightPoint: $point.data('left'),
            rightPointIndex: i + 1
          });
        });
      }

      // 初始化开始和结束点

    }, {
      key: 'initCurrent',
      value: function initCurrent() {
        var _this2 = this;

        var _this = this;
        this.currents = [$(templateCurrent), $(templateCurrent)];
        this.currents.forEach(function (current) {
          _this.$points.append(current);
          current.addClass(_this2.options.tooltipPosition);
        });
        this.setTo(this.currents[0], this.pointEls[this.options.start - 1].data('left'), this.options.start);
        this.setTo(this.currents[1], this.pointEls[this.options.end - 1].data('left'), this.options.end);
      }

      // 绑定事件

    }, {
      key: 'bindEvents',
      value: function bindEvents() {
        var _this3 = this;

        var _this = this;
        var pointsLeft = _this.$points.offset().left;
        var mousedown = function mousedown(e) {
          e.preventDefault();
          var $this = $(e.currentTarget);
          _this.status.mousedown = true;
          _this.status.current = $this;
          $this.addClass('grabbing');
        };
        var mouseup = function mouseup(e) {
          e.preventDefault();
          _this.status.mousedown = false;
          if (!_this.status.current) return;
          if (typeof _this.options.onchange == 'function') {
            var indexs = _this3.currents.map(function (current) {
              return parseInt(current.attr('data-index')) || 1;
            });
            var start = Math.min.apply(window, indexs);
            var end = Math.max.apply(window, indexs);
            _this.change(start, end);
          }
          _this.status.current.removeClass('grabbing');
          _this.status.current = null;
        };
        var mousemove = function mousemove(e) {
          e.preventDefault();
          if (!_this.status.current || !_this.status.mousedown) {
            return;
          }
          var cLeft = e.pageX - pointsLeft;
          var bestMatchAnchor = null;
          _this.anchors.forEach(function (a) {
            if (cLeft >= a.left) {
              bestMatchAnchor = a;
              return false;
            }
          });
          if (bestMatchAnchor) _this.setTo(_this.status.current, bestMatchAnchor.rightPoint, bestMatchAnchor.rightPointIndex);
        };
        this.currents.forEach(function (current) {
          current.off("mousedown").on("mousedown", mousedown);
        });
        $(window).off("mouseup").on("mouseup", mouseup).off("mousemove").on("mousemove", mousemove).off("resize").on("resize", this.initAnchors.bind(this));
      }

      // 选定一个点

    }, {
      key: 'setTo',
      value: function setTo(current, left, index) {
        var _this = this;
        if (!current) return;
        current.css({
          left: left
        }).attr('data-left', left).attr('data-index', index);
        this.tooltip(current, index);
        var lefts = this.currents.map(function (current) {
          return parseFloat(current.attr('data-left')) || 0;
        });
        this.$bar.css({
          left: Math.min.apply(window, lefts) + '%',
          right: -Math.max.apply(window, lefts) + 100 + "%"
        });
      }
    }, {
      key: 'change',
      value: function change(start, end) {
        this.options.onchange(start, end);
        this.input.val(start + '-' + end);
      }
    }, {
      key: 'tooltip',
      value: function tooltip(current, index) {
        var tooltip = current.find(".slider-current-tooltip");
        var tooltipArrow = current.find(".slider-current-tooltip-arrow");
        tooltip.html(this.options.tooltip(index));
        tooltip.css({
          left: current.width() / 2 - tooltip.outerWidth() / 2
        });
        tooltipArrow.css({
          left: current.width() / 2 - tooltipArrow.width() / 2
        });
      }
    }]);

    return Slider;
  }();
})();
