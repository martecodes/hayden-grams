module.exports = function (app, passport, db, multer, ObjectId) {

  // Image Upload Code =========================================================================
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
  });
  const upload = multer({ storage: storage });

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    let user = req.user
    db.collection('posts').find({ postedBy: user.local.username }).toArray((err, result) => {
      db.collection('comments').find().toArray((err, mainResult) => {

        if (err) return console.log(err)
        res.render('profile.ejs', {
          user: req.user,
          posts: result,
          comments: mainResult
        })
      })
    })
  });

  //new post page
  app.get('/newpost', isLoggedIn, function (req, res) {
    res.render('newpost.ejs', {
      user: req.user
    })
  });
  //feed page
  app.get('/feed', function (req, res) {
    db.collection('posts').find().toArray((err, result) => {
      db.collection('comments').find().toArray((err, mainResult) => {
        if (err) return console.log(err)
        res.render('feed.ejs', {
          user: req.user,
          posts: result,
          comments: mainResult
        })
      })
    })
  });
  //post page
  app.get('/post/:username/:postId', isLoggedIn, function (req, res) {
    let postId = ObjectId(req.params.postId)

    db.collection('posts').find({
      _id: postId
    }).toArray((err, result) => {
      db.collection('comments').find({
        postId: req.params.postId
      }).toArray((err, mainResult) => {

        if (err) return console.log(err)
        res.render('post.ejs', {
          posts: result,
          user: req.user,
          comments: mainResult
        })
      })
    })
  });

  //profile page
  app.get('/page/:username', isLoggedIn, function (req, res) {
    let user = req.params.username;
    db.collection('posts').find({ postedBy: user }).toArray((err, result) => {
      db.collection('comments').find().toArray((err, mainResult) => {
        if (err) return console.log(err)
        res.render('page.ejs', {
          user: req.user,
          posts: result,
          comments: mainResult
        })
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
  // post routes
  app.post('/makePost', upload.single('file-to-upload'), (req, res) => {
    let user = req.user;

    db.collection('posts').insertOne({
      caption: req.body.caption,
      img: 'images/uploads/' + req.file.filename,
      postedBy: user.local.username,
      likes: 0,
      liked: false,
      commentsTotal: 0
    }, (err, result) => {
      if (err) return console.log(err)
      res.redirect('/feed')
    })
  })

  app.post('/comments/:postId', (req, res) => {
    let user = req.user;
    let time = (new Date()).toLocaleString();
    const postId = req.params.postId;

    db.collection('comments').insertOne({
      commentBy: user.local.username,
      comment: req.body.comment,
      likes: 0,
      liked: false,
      time,
      postId: postId
    }, (err, result) => {
      if (err) return console.log(err)
      res.redirect('back')
    })
  })


  // message board routes ===============================================================

  app.put('/postLikes', (req, res) => {

    db.collection('posts')
      .findOneAndUpdate({ _id: ObjectId(req.body._id) }, {
        $inc: {
          likes: 1,
        },
        $set: {
          liked: true,
        }
      }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  });

  app.put('/commentLikes', (req, res) => {
    db.collection('comments')
      .findOneAndUpdate({ _id: ObjectId(req.body._id) }, {
        $inc: {
          likes: 1
        },
        $set: {
          liked: true
        }
      }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  });

  app.delete('/commentDelete', (req, res) => {

    db.collection('comments').findOneAndDelete({
      _id: ObjectId(req.body._id),
      comment: req.body.comment
    }, (err, result) => {
      if (err) return res.send(500, err)
      res.send(result)
    })
  });

  app.delete('/postDelete', (req, res) => {

    db.collection('posts').findOneAndDelete({
      _id: ObjectId(req.body._id),
    }, (err, result) => {
      if (err) return res.send(500, err)
      res.send(result)
    })
  });
  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/feed', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
