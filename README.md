## Slider Picker

指定一个总点数和一个文本框，给出一个范围选择器

#### Usage
```bash
npm install slider-picker
```
```javascript
$('#silder-picker-input').silderRange({
  points: 20,  //总点数
  start: 1,  //初始起始点
  end: 10,  //初始结束点
  tooltip: (index) => {
    return index
  }, //提示文字
  onchange: (start, end) => {
  } //change事件
})
```

#### License
```
MIT
```
