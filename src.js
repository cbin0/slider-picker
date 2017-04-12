(function(){
  if(!window.jQuery) return

  let $ = window.jQuery

  let defaults = {
    points: 10,
    start: 1,
    end: 10,
    tooltip: (index) => {
      return index
    },
    onchange: (start, end) => {
    }
  }
  let template = `
    <div class="slider-slot">
      <div class="slider-points"></div>
      <div class="slider-bar"></div>
    </div>
  `
  let templatePoint = `
    <div class="slider-point"></div>
  `
  let templateCurrent = `
    <div class="slider-current">
      <div class="slider-current-tooltip"></div>
      <div class="slider-current-tooltip-arrow"></div>
    </div>
  `

  $.fn.silderRange = function(opts) {
    let options = $.extend({}, defaults, opts)

    options.start = Math.floor(options.start)
    options.end = Math.floor(options.end)

    if(options.start < 1) {
      options.start = 1
    }
    if(options.end > options.points) {
      options.end = options.points
    }

    this.slider = new Slider(this, options)
  }

  class Slider {
    constructor(input, options) {
      let el = $(template)
      this.input = input
      this.$el = el
      this.$slot = el.find('.slider-slot')
      this.$bar = el.find('.slider-bar')
      this.$points = el.find('.slider-points')
      this.options = options
      this.status = {
        mousedown: false,
        current: null
      }
      this.anchors = []
      this.pointEls = []
      this.pointSpace = 0

      input.parent().append(el)
      input.hide()

      this.appendPoints()
      this.initAnchors()
      this.initCurrent()
    }

    // 初始化点
    appendPoints() {
      let _this = this
      let { points } = this.options
      this.pointSpace = 100 / (points - 1)
      this.pointEls = []
      for(let i = 1; i <= points; i++) {
        let left = `${this.pointSpace * (i - 1)}%`
        let $point = $(templatePoint)
          .css({
            left: left
          })
          .data('point', i)
          .data('left', left)
        this.$points.append($point)
        this.pointEls.push($point)
      }
    }

    // 初始化锚点
    initAnchors() {
      let _this = this
      let pointSpacePx = this.pointSpace * this.$points.width() / 100
      this.anchors = []
      this.pointEls.forEach(($point, i) => {
        _this.anchors.push({
          left: pointSpacePx * (i - 1) + pointSpacePx / 2,
          rightPoint: $point.data('left'),
          rightPointIndex: i + 1
        })
      })
    }

    // 初始化开始和结束点
    initCurrent() {
      let _this = this
      this.currents = [
        $(templateCurrent),
        $(templateCurrent)
      ]
      this.currents.forEach((current) => {
        _this.$points.append(current)
      })
      this.setTo(
        this.currents[0],
        this.pointEls[this.options.start-1].data('left'),
        this.options.start
      )
      this.setTo(
        this.currents[1],
        this.pointEls[this.options.end-1].data('left'),
        this.options.end
      )
      _this.bindEvents()
    }

    // 绑定事件
    bindEvents() {
      let _this = this
      let pointsLeft = _this.$points.offset().left
      let mousedown = (e) => {
        e.preventDefault()
        let $this = $(e.currentTarget)
        _this.status.mousedown = true
        _this.status.current = $this
        $this.addClass('grabbing')
      }
      let mouseup = (e) => {
        e.preventDefault()
        _this.status.mousedown = false
        if(!_this.status.current) return
        if(typeof _this.options.onchange == 'function') {
          let indexs = this.currents.map((current) => {
            return parseInt(current.attr('data-index')) || 1
          })
          let start = Math.min.apply(window, indexs)
          let end = Math.max.apply(window, indexs)
          _this.options.onchange(start, end)
          _this.input.val(`${start}-${end}`)
        }
        _this.status.current.removeClass('grabbing')
        _this.status.current = null
      }
      let mousemove = (e) => {
        e.preventDefault()
        if(!_this.status.current || !_this.status.mousedown) {
          return
        }
        let cLeft = e.pageX - pointsLeft
        _this.anchors.forEach((a) => {
          if(cLeft >= a.left) {
            _this.setTo(_this.status.current, a.rightPoint, a.rightPointIndex)
            return false
          }
        })
      }
      this.currents.forEach((current) => {
        current.off("mousedown").on("mousedown", mousedown)
      })
      $(window)
        .off("mouseup").on("mouseup", mouseup)
        .off("mousemove").on("mousemove", mousemove)
        .off("resize").on("resize", this.initAnchors.bind(this))
    }

    // 选定一个点
    setTo(current, left, index) {
      let _this = this
      if(!current) return
      current.css({
        left: left
      }).attr('data-left', left)
      .attr('data-index', index)
      this.tooltip(current, index)
      let lefts = this.currents.map((current) => {
        return parseFloat(current.attr('data-left')) || 0
      })
      this.$bar.css({
        left: `${Math.min.apply(window, lefts)}%`,
        right: -Math.max.apply(window, lefts) + 100 + "%"
      })
    }

    tooltip(current, index) {
      let tooltip = current.find(".slider-current-tooltip")
      let tooltipArrow = current.find(".slider-current-tooltip-arrow")
      tooltip.html(this.options.tooltip(index))
      tooltip.css({
        left: (current.width() / 2) - (tooltip.outerWidth() / 2)
      })
      tooltipArrow.css({
        left: (current.width() / 2) - (tooltipArrow.width() / 2)
      })
    }
  }
}())
