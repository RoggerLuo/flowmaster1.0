var gp = require('gulp');
var uglify = require('gulp-uglify');
gp.task("default",function(){
    // 把1.js和2.js合并压缩为main.js，输出到dest/js目录下
    gp.src(['dist/bundle.js']).pipe(uglify()).pipe(gp.dest('./dist'))
})