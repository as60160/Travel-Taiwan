const gulp = require("gulp");
const pug = require("gulp-pug");
const babel = require('gulp-babel');
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const browserSync = require("browser-sync").create();

gulp.task("pug", function () {
  return gulp
    .src("source/pug/**/*.pug")
    .pipe(
      pug({
        pretty: true
      })
    )
    .pipe(gulp.dest("public/"))
    .pipe(browserSync.stream());
});

gulp.task("js", function () {
  return gulp
    .src("source/js/**/*.js")
    .pipe(babel({
      presets: ["@babel/env"]
    }))
    .pipe(uglify())
    .pipe(gulp.dest("public/js/"))
    .pipe(browserSync.stream())
})

gulp.task("imagemin", () => {
  return gulp
    .src("source/assets/img/*")
    .pipe(imagemin())
    .pipe(gulp.dest("public/img"))
    .pipe(browserSync.stream());
});

gulp.task("watch", function () {
  browserSync.init({
    server: "./public"
  });
  gulp.watch("source/pug/**/*.pug", gulp.series("pug"));
  gulp.watch("source/js/**/*.js", gulp.series("js"))
  gulp.watch("source/assets/img/*", gulp.series("imagemin"));
  gulp.watch("public/**/*.html").on("change", browserSync.reload);
});


gulp.task("default", gulp.series("pug", "imagemin", "js", "watch"));