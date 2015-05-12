var gulp = (function () {
  var config = require('./config.json');
  var libName = config['name'];
  var sourceFiles = config['sourceFiles'];
  var folderSource = config['folderSource'];
  var folderCompiled = config['folderCompiled'];
  var gulp = require('gulp');
  var gulpConcat = require('gulp-concat');
  var gulpSourceMaps = require('gulp-sourcemaps');
  var gulpRename = require('gulp-rename');
  var gulpUglify = require('gulp-uglify');
  gulp.task('scripts', function () {
    return gulp.src(sourceFiles)
      .pipe(gulpConcat(libName + '.js'))
      .pipe(gulp.dest('./' + folderCompiled));
  });
  gulp.task('watch', function () {
    gulp.watch('./' + folderSource, ['default']);
  });
  gulp.task('default', ['scripts'], function () {
    gulp
      .src([folderCompiled + '/' + libName + '.js'])
      .pipe(gulpRename({
        extname: '.min.js'
      }))
      .pipe(gulpSourceMaps.init())
      .pipe(gulpUglify({
        compress: {
          sequences: false,
          unsafe: false,
          warnings: true
        }
      }))
      .pipe(gulpSourceMaps.write('.'))
      .pipe(gulp.dest(folderCompiled));
  });
  return gulp;
})();
