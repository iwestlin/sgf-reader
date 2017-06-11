import React from 'react'

const Root = React.createClass({
  getInitialState: function () {
    return {
      width: 19,
      game: [],
      boardArr: [],
      timeouts: [],
      reg: /[BW]\[([a-s]{2})\]/g,
      colors: {
        W: '○',
        B: '●'
      }
    }
  },
  componentDidMount: function () {
    this.setState({
      mounted: true,
      boardArr: this.getDefaultBoard()
    })
  },
  getDefaultBoard: function() {
    var width = this.state.width
    var result = []
    for (let i = 0; i < width; i++) {
      var temp = []
      for (let j = 0; j < width; j++) {
        temp.push(this.getChar(i, j))
      }
      temp.push('\n')
      result.push(temp)
    }
    return result
  },
  clear: function () {
    var to = this.state.timeouts
    if (to.length) {
      for (let i = 0; i < to.length; i++) {
        clearTimeout(to[i])
      }
    }
    this.setState({
      boardArr: this.getDefaultBoard(),
      timeouts: []
    })
  },
  getChar: function (i, j) {
    var edge = this.state.width - 1
    if (i === 0) {
      if (j === 0) {
        return '┌'
      } else if (j === edge) {
        return '┐'
      } else {
        return '┬'
      }
    } else if (i === edge) {
      if (j === 0) {
        return '└'
      } else if (j === edge) {
        return '┘'
      } else {
        return '┴'
      }
    } else if (j === 0) {
      return '├'
    } else if (j === edge) {
      return '┤'
    } else {
      return '┼'
    }
  },
  flatten: function (arr) {
    return Array.prototype.concat.apply([], arr)
  },
  draw: function (position) {
    if (!position) return
    var colors = this.state.colors
    var removeDead = this.removeDead
    var ba = this.state.boardArr
    ba[position[1]][position[0]] = position[2]
    this.setState({boardArr: ba})
    if (position[2] === colors['B']) {
      removeDead(colors['W'])
      removeDead(colors['B'])
    } else {
      removeDead(colors['B'])
      removeDead(colors['W'])
    }
  },
  trans: function (pos, color) {
    var line = 'abcdefghijklmnopqrs'
    return [line.indexOf(pos[0]), line.indexOf(pos[1]), this.state.colors[color]]
  },
  removeDead: function (type) {
    var groups = this.group(type)
    for (let i = 0; i < groups.length; i++) {
      var qi = 0
      for (let j = 0; j < groups[i].length; j++) {
        qi += this.getQi.apply(null, groups[i][j])
      }
      if (!qi) {
        this.removeGroup(groups[i])
      }
    }
  },
  removeGroup: function (arr) {
    for (var i = 0; i < arr.length; i++) {
      var x = arr[i][0]
      var y = arr[i][1]
      this.state.boardArr[x][y] = this.getChar(x, y)
    }
  },
  group: function (type) {
    var result = []
    var checked = []
    var boardArr = this.state.boardArr
    function getGroup (x, y) {
      var temp = []
      function connect (x, y) {
        var str = x + '-' + y
        if (checked.indexOf(str) < 0) {
          checked.push(str)
          temp.push([x, y])
          if (boardArr[x - 1] && boardArr[x - 1][y] === type) {
            connect(x - 1, y)
          }
          if (boardArr[x + 1] && boardArr[x + 1][y] === type) {
            connect(x + 1, y)
          }
          if (boardArr[x][y - 1] === type) {
            connect(x, y - 1)
          }
          if (boardArr[x][y + 1] === type) {
            connect(x, y + 1)
          }
        }
      }
      connect(x, y)
      result.push(temp)
    }
    for (let i = 0; i < boardArr.length; i++) {
      for (let j = 0; j < boardArr[i].length; j++) {
        if (checked.indexOf(i + '-' + j) < 0 && boardArr[i][j] === type) {
          getGroup(i, j)
        }
      }
    }
    return result
  },
  getQi: function (x, y) {
    var boardArr = this.state.boardArr
    var n = 0
    if (boardArr[x - 1] && '┌┬┐┼┤├└┘┴'.indexOf(boardArr[x - 1][y]) >= 0) { n++ }
    if (boardArr[x + 1] && '┌┬┐┼┤├└┘┴'.indexOf(boardArr[x + 1][y]) >= 0) { n++ }
    if ('┌┬┐┼┤├└┘┴'.indexOf(boardArr[x][y - 1]) >= 0) { n++ }
    if ('┌┬┐┼┤├└┘┴'.indexOf(boardArr[x][y + 1]) >= 0) { n++ }
    return n
  },
  read: function (s) {
    var game = []
    var r
    while (r = this.state.reg.exec(s)) {
      game.push(this.trans(r[1], r[0][0]))
    }
    return game
  },
  start: function (s) {
    var timeouts = []
    var delay = 500
    for (let i = 0; i < this.state.game.length; i++) {
      var t = setTimeout(function () {
        this.draw(this.state.game[i])
      }.bind(this), i * delay)
      timeouts.push(t)
    }
    this.setState({timeouts: timeouts})
  },
  readText: function (e) {
    this.clear()
    var that = this
    var file = e.target.files[0]
    var reader = new FileReader()
    reader.onload = function (file) {
      var s = this.result
      that.state.game = that.read(s)
      that.start()
    }
    reader.readAsText(file)
  },
  alphago: function () {
    this.clear()
    var s = ';B[pd];W[dd];B[pp];W[dp];B[pj];W[nc];B[pf];W[nq];B[pn];W[oo];B[po];W[pr];B[fc];W[cf];B[oc];W[qc];B[nb];W[rf];B[rg];W[qg];B[re];W[rh];B[rj];W[fq];B[fe];W[mb];B[mc];W[nd];B[lb];W[ec];B[fb];W[og];B[ma];W[oi];B[oj];W[dk];B[dg];W[cg];B[dh];W[ch];B[di];W[bj];B[lg];W[mi];B[ek];W[el];B[fl];W[em];B[nh];W[ni];B[ph];W[pg];B[oh];W[of];B[qf];W[pi];B[qi];W[qh];B[mh];W[sg];B[qd];W[li];B[se];W[le];B[md];W[si];B[ri];W[jh];B[kf];W[if];B[ke];W[gg];B[fk];W[dj];B[il];W[ef];B[fm];W[id];B[hi];W[kd];B[me];W[ll];B[gp];W[en];B[fn];W[hc];B[ig];W[ih];B[hf];W[hg];B[ie];W[he];B[jf];W[gf];B[ol];W[qq];B[cc];W[eb];B[cd];W[de];B[db];W[ea];B[be];W[iq];B[km];W[lm];B[jo];W[gq];B[cq];W[rk];B[ro];W[hp];B[ho];W[go];B[oq];W[or];B[np];W[hn];B[hm];W[dq];B[eo];W[do];B[mq];W[nr];B[io];W[fi];B[dr];W[er];B[ej];W[gn];B[in];W[fo];B[mo];W[lp];B[mp];W[gi];B[hj];W[lo];B[hh];W[if];B[gh];W[fh];B[hf];W[nl];B[nk];W[if];B[fg];W[om];B[pl];W[eg];B[hf];W[pe];B[qe];W[if];B[gm];W[fp];B[hf];W[pm];B[qm];W[nm];B[ql];W[kn];B[kl];W[kk];B[jk];W[jm];B[jl];W[jn];B[ff];W[ge];B[mr];W[im];B[gd];W[hd];B[eh];W[fd];B[ed];W[ee];B[fd];W[fa];B[kq];W[kp];B[dl];W[cl];B[rr];W[gb];B[kj];W[lj];B[ki];W[lh];B[mf];W[kh];B[hk];W[rq];B[sp];W[sq];B[ns];W[rs];B[qs];W[sr];B[ss];W[bb];B[cb];W[rs];B[bp];W[br];B[ss];W[qo];B[rs];W[op];B[on];W[sj];B[qj];W[rn];B[qn];W[rp];B[qp];W[so];B[jq];W[jp];B[qo];W[sl];B[rm];W[sm];B[sn];W[pq];B[no];W[rn];B[sf];W[nj];B[sn];W[da];B[ca];W[rn];B[mk];W[lk];B[sn];W[bc];B[ab];W[rn];B[lq];W[sn];B[ir];W[hr];B[is];W[ms];B[ls];W[kr];B[jr];W[ks];B[os];W[ps];B[ms];W[nn];B[oq];W[op];B[nf];W[sp];B[mn];W[ln];B[rl];W[sk];B[oe];W[sh];B[oo];W[ml];B[ng];W[mj];B[qk];W[ok];B[nk];W[mk];B[oq];W[mm];B[rg];W[op];B[rf];W[nk];B[oq];W[ba];B[bd];W[op];B[ip];W[hq];B[oq];W[bf];B[qr];W[ae];B[cr];W[bo];B[ei];W[ii];B[ij];W[ci];B[jd];W[jc];B[aa];W[ac];B[jb];W[je];B[co];W[bn];B[jd];W[if];B[fj];W[gc];B[cm];W[cn];B[hf];W[kc];B[ib];W[ic]'
    this.state.game = this.read(s)
    this.start()
  },
  render: function () {
    var boardStr = this.flatten(this.state.boardArr).join('')
    return (
      <div>
        <h2>SGF Reader of Go</h2>
        <span>Upload SGF File: </span>
        <input type="file" onChange={this.readText} />
        <a download href="//js007-1253509220.costj.myqcloud.com/sample.sgf">download sample.sgf</a>
        <pre id="board" ref="board">{boardStr}</pre>
        <button onClick={this.alphago}>Load AlphaGo Self Play #2</button>
        <button onClick={this.clear}>clear</button>
      </div>
    )
  }
})

export default Root
