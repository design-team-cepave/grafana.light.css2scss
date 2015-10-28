var gulp        = require('gulp'),
    $           = require('gulp-load-plugins')(),
    path        = require('path'),
    browserSync = require('browser-sync'),
    through2    = require('through2'),
    reload      = browserSync.reload,
    browserify  = require('browserify'),
    del         = require('del'),
    argv        = require('yargs').argv;

var baseDir = './src/bower_components/';

var source = {
  style: {
    normalize: {
      file: [ baseDir + 'normalize-css/normalize.css' ]
    },
    datepicker: {
      file: [ baseDir + 'bootstrap-datepicker/css/datepicker.css' ]
    },
    timepicker: {
      file: [ baseDir + 'bootstrap-timepicker/compiled/timepicker.css' ]
    },
    spectrum: {
      file: [ baseDir + 'spectrum/spectrum.css' ]
    },
    bootstrap: {
      file: [ baseDir + 'bootstrap/docs/assets/css/bootstrap.css' ]
    },
    fontAwesome: {
      file: [ baseDir + 'fontawesome/css/font-awesome.css' ]
    }
  }
};

var vendor = {
  dest: './src/stylesheets/vendor'
}


gulp.task('browser-sync', function() {
  browserSync({
    open: !!argv.open,
    notify: !!argv.notify,
    server: {
      baseDir: "./dist"
    }
  });
});


gulp.task('components', function() {
  gulp.src(source.style.normalize.file)
  .pipe($.rename('_normalize.scss'))
  .pipe(gulp.dest(vendor.dest));
  gulp.src(source.style.datepicker.file)
  .pipe($.rename('_datepicker.scss'))
  .pipe(gulp.dest(vendor.dest));
  gulp.src(source.style.timepicker.file)
  .pipe($.rename('_timepicker.scss'))
  .pipe(gulp.dest(vendor.dest));
  gulp.src(source.style.spectrum.file)
  .pipe($.rename('_spectrum.scss'))
  .pipe(gulp.dest(vendor.dest));
  gulp.src(source.style.bootstrap.file)
  .pipe($.rename('_bootstrap.scss'))
  .pipe(gulp.dest(vendor.dest));
  gulp.src(source.style.fontAwesome.file)
  .pipe($.rename('_font-awesome.scss'))
  .pipe(gulp.dest(vendor.dest));
});


gulp.task('compass', function() {
  return gulp.src('./src/stylesheets/**/*.{scss,sass}')
    .pipe($.plumber())
    .pipe($.compass({
      css:   'dist/stylesheets',
      sass:  'src/stylesheets',
      style: 'expanded'
    }))
    .pipe(gulp.dest('dist/stylesheets'));
});


gulp.task('js', function() {
  return gulp.src('src/scripts/*.js')
    .pipe($.plumber())
    .pipe(through2.obj(function (file, enc, next) {
      browserify(file.path, { debug: true })
        .transform(require('babelify'))
        .transform(require('debowerify'))
        .bundle(function (err, res) {
          if (err) { return next(err); }
          file.contents = res;
            next(null, file);
        });
      }))
      .on('error', function (error) {
        console.log(error.stack);
        this.emit('end')
    })
  .pipe( $.rename('app.js'))
  .pipe( gulp.dest('dist/scripts/'));
});


gulp.task('clean', function(cb) {
  del('./dist', cb);
});

gulp.task('images', function() {
  return gulp.src('./src/images/**/*')
    .pipe($.imagemin({
      progressive: true
    }))
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('templates', function() {
  return gulp.src('src/*.jade')
    .pipe($.plumber())
    .pipe($.jade({
      pretty: true
    }))
    .pipe( gulp.dest('dist/') )
});



gulp.task('build', ['compass', 'js', 'templates', 'images']);

gulp.task('serve', ['build', 'browser-sync'], function () {
  gulp.watch('src/stylesheets/**/*.{scss,sass}',['compass', reload]);
  gulp.watch('src/scripts/**/*.js',['js', reload]);
  gulp.watch('src/images/**/*',['images', reload]);
  gulp.watch('src/*.jade',['templates', reload]);
});

gulp.task('default', ['serve']);
