const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const replace = require("gulp-replace");
const browserSync = require("browser-sync").create();
var flatten = require("gulp-flatten");

// File paths
const files = {
  scssPath: "app/scss/**/*.scss",
  jsPath: "app/js/scripts/**/*.js",
  imgPath: "app/img/**/*"
};

function scssTask() {
  return src(files.scssPath, { sourcemaps: true })
    .pipe(sass())
    .pipe(dest("app/css"));
}

function scssBuildTask() {
  return src(files.scssPath, { sourcemaps: true })
    .pipe(sass())
    .pipe(
      replace(
        /(url\(["'])([^\)]+?\.[woff|eot|woff2|ttf|svg|png|jpg]*)(["']\))/g,
        function(match) {
          if (match.includes("http")) {
            return match;
          } else {
            let str = match;

            let regex = /(url\(["'])([^\)]+?\.[woff|eot|woff2|ttf|svg|png|jpg]*)(["']\))/;

            let group1 = regex.exec(str)[1];
            let group2 = regex.exec(str)[2].replace(/^.*[\\/]/, "");
            let group3 = regex.exec(str)[3];
            return group1 + group2 + group3;
          }
        }
      )
    )
    .pipe(postcss([autoprefixer(), cssnano()]))

    .pipe(flatten())
    .pipe(dest("app/src", { sourcemaps: "." }));
}

function imgBuild() {
  return src([files.imgPath])
    .pipe(flatten())
    .pipe(dest("app/src"));
}

function jsTask() {
  return (
    src([files.jsPath], { sourcemaps: true })
      .pipe(concat("app.js"))
      // .pipe(terser())
      .pipe(dest("app/js"))
      .pipe(flatten())
      .pipe(dest("app/src", { sourcemaps: "." }))
  );
}

function cacheBustTask() {
  var cbString = new Date().getTime();
  return src(["app/index.html"])
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(dest("app/"));
}

// BrowserSync to spin up a local server
function browserSyncServe(cb) {
  // initializes browserSync server
  browserSync.init({
    server: {
      baseDir: "app/"
    },
    notify: {
      styles: {
        top: "auto",
        bottom: "0"
      }
    }
  });
  cb();
}
function browserSyncReload(cb) {
  // reloads browserSync server
  browserSync.reload();
  cb();
}

function watchTask() {
  watch(
    [files.scssPath, files.jsPath],
    { interval: 1000, usePolling: true },
    series(parallel(scssTask, scssBuildTask, jsTask, imgBuild), cacheBustTask)
  );
}

function bsWatchTask() {
  watch("app/index.html", series(browserSyncReload, indexTask, imgBuild));
  watch(
    [files.scssPath, files.jsPath],
    { interval: 1000, usePolling: true },
    series(
      parallel(scssTask, imgBuild, scssBuildTask, jsTask),
      cacheBustTask,
      browserSyncReload
    )
  );
}

function indexTask() {
  return src(["app/index.html"])
    .pipe(
      replace(/src=['"](.*?)['"]/g, function(match) {
        if (
          match.includes("http") ||
          match === `src=""` ||
          match === `src=''`
        ) {
          return match;
        } else {
          return "src=" + '"' + match.replace(/^.*[\\/]/, "");
        }
      })
    )
    .pipe(
      replace(/(<link\s+(?:[^>]*?\s+)?href=["'])(.*?)(["'].*)/g, function(
        match
      ) {
        let str = match;

        let regex = /(<link\s+(?:[^>]*?\s+)?href=["'])(.*?)(["'].*)/;

        let group1 = regex.exec(str)[1];
        let group2 = regex.exec(str)[2].replace(/^.*[\\/]/, "");
        let group3 = regex.exec(str)[3];
        return group1 + group2 + group3;
      })
    )
    .pipe(flatten())
    .pipe(dest("app/src"));
}

exports.default = series(
  parallel(scssTask, imgBuild, scssBuildTask, jsTask),
  cacheBustTask,
  watchTask
);

exports.start = series(
  parallel(scssTask, jsTask),
  cacheBustTask,
  browserSyncServe,
  bsWatchTask
);
