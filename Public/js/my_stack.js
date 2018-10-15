
function constant$10(x) {
    return function constant() {
        return x;
    };
}
function none$2(series) {
    var n = series.length, o = new Array(n);
    while (--n >= 0) o[n] = n;
    return o;
}
function none$1(series, order) {
    if (!((n = series.length) > 1)) return;
    for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
        s0 = s1, s1 = series[order[i]];
        for (j = 0; j < m; ++j) {
            s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
        }
    }
}
function stackValue(d, key) {
    return d[key];
}

function sum$2(series) {
    console.log(series)
    var s = 0, i = -1, n = series.length, v;
    while (++i < n) if (v = +series[i][1]) s += v;
    return s;
}

function variance(series){
    var sum = sum$2(series)/series.length;
    //console.log(series.length);
    var variances=series.map(function(d,i){
        return Math.abs(d[1]-sum)
    })
    //console.log(variances);
    return variances;
}


var slice$6 = Array.prototype.slice;
/*
    copy the codes of stack from d3.v4.js
    2018/10/14
 */
my_stack={
    stack:function() {
        var keys = constant$10([]),
            order = none$2,
            offset = none$1,
            value = stackValue;


        function stack(data) {
            var kz = keys.apply(this, arguments),
                i,
                m = data.length,
                n = kz.length,
                sz = new Array(n),
                oz;

            for (i = 0; i < n; ++i) {
                for (var ki = kz[i], si = sz[i] = new Array(m), j = 0, sij; j < m; ++j) {
                    si[j] = sij = [0, +value(data[j], ki, j, data)];
                    sij.data = data[j];
                }
                si.key = ki;
            }

            for (i = 0, oz = order(sz); i < n; ++i) {
                sz[oz[i]].index = i;
            }

            offset(sz, oz);

            return sz;
        }

        stack.keys = function(_) {
            return arguments.length ? (keys = typeof _ === "function" ? _ : constant$10(slice$6.call(_)), stack) : keys;
        };

        stack.value = function(_) {
            return arguments.length ? (value = typeof _ === "function" ? _ : constant$10(+_), stack) : value;
        };

        stack.order = function(_) {
            return arguments.length ? (order = _ == null ? none$2 : typeof _ === "function" ? _ : constant$10(slice$6.call(_)), stack) : order;
        };

        stack.offset = function(_) {
            return arguments.length ? (offset = _ == null ? none$1 : _, stack) : offset;
        };

        return stack;
    }
    ,variance:function(series){
        return variance(series);
    }

    // set order to stability
    ,stability:function(series) {
        var variances=variance(series);
        return none$2(series).sort(function(a, b) { return variances[a] - variances[b]; });
    }

    // set order to inside out by stability
    ,insideOut_stability:function(series) {
    var n = series.length,
        i,
        j,
        variances = series.map(variance),
        order = none$2(series).sort(function(a, b) { return variances[b] - variances[a]; }),
        top = 0,
        bottom = 0,
        tops = [],
        bottoms = [];
    for (i = 0; i < n; ++i) {
        j = order[i];
        if (top < bottom) {
            top += variances[j];
            tops.push(j);
        } else {
            bottom += variances[j];
            bottoms.push(j);
        }
    }

    return bottoms.reverse().concat(tops);
}
}


