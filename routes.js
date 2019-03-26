'use strict';

const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

const User = require('./model/user');
const Course = require('./model/course');

// Capture course whenever route contains id
router.param("id", function(req,res,next,id){
	Course.findById(id, function(err, course){
		if(err) return next(err);
		if(!course) {
			err = new Error("Not Found");
			err.status = 404;
			return next(err);
		}
		req.course = course;
		return next();
  })
  .populate({path: 'user', model: 'User'})
});

// Authentication
const authenticateUser = async (req, res, next) => {
  let message = null;
  // Parse user's credentials from the Authorization header.
  const credentials = auth(req);
  if(credentials) {
    const user = await User.findOne({emailAddress: credentials.name});
    if(user){
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);

        if(authenticated){
          req.currentUser = user;
        } else {
          message = "Authentication failed";
        }
    } else {
      message = "User not found";
    }
  } else {
    message = "Auth header not found";
  }
  if(message){
    res.status(401).send("Login failed");
  } else {

  next();
  }
}

//GET root route
router.get('/', (req, res) => {
  res.send("Welcome to the rest-api");
})

// FOR DEV USE
/* router.get('/api/users/all', (req, res) => {
  User.find({})
    .exec(function(err, users){
      if(err){
        return next(err)
      } else {
      res.json(users)
      }
    })
})

router.get('/api/users/:lastname', (req, res, next) => {
  User.find({lastName: req.params.lastname})
    .exec((err, user) => {
      if(err){
        res.send("You don goofed")
      } else {
      res.status(200).json(user);
      }
    })
})

 router.delete('/api/users/:lastname', (req, res, next) => {
  User.find({lastName: req.params.lastname})
    .remove(function(err){
      if(err){
        return next(err);
      } else {
      res.sendStatus(204);
      res.location('/');
      }
    })
})  */
// END


// GET /api/users
// Return currently authenticated user
router.get('/api/users', authenticateUser, (req, res) => {
  const currentUser = req.currentUser;
  res.send(currentUser);
});

//Post /users
// Create a user, set the Location header to "/" and return no content
router.post('/api/users', (req, res, next) => {
  const user = new User(req.body);
  user.password = bcryptjs.hashSync(user.password);

  user.save(function(err){
    if(err){
      let error = new Error();
      error.status = 400;
      error.message = err.message;
      return next(error)   
    } else {
      res.location('/');
      res.sendStatus(201)
    }
  })
})

// GET /courses
// Return full list of courses including (populate()) user that owns each course
router.get("/api/courses", function(req, res, next){
  Course.find({})
    .populate({path:'user', model: 'User'})
    .exec(function(err, courses){
      if(err){
        return next(err)
      } else {
        res.status(200)
        res.json(courses)
      }
    });
});

// GET /courses/:id 200
// Return the course (including the user that owns the course) for provided ID
router.get('/api/courses/:id', (req, res, next) => {
  res.status(200).json(req.course);
});

// POST /courses 201
// Create course, set Location header to URI for the course
// Return no content
router.post('/api/courses', authenticateUser, (req, res, next) => {
  const course = new Course(req.body);

  course.save(function(err, course){
    if(err){
      let error = new Error();
      error.status = 400;
      error.message = err.message;

      return next(error) 
    } else {
      res.location(`/${course.id}`);
      res.sendStatus(201);
    }
  })
})

// PUT /courses/:id 201
//Updates a course and returns no content
router.put('/api/courses/:id', authenticateUser, (req, res, next) => {
  req.course.update(req.body, function(err, result){
    if(err){
      return next(err)
    } else {
      res.sendStatus(204);
    }
  })
})

// DELETE /api/courses/:id
// Deletes a course and returns no content
router.delete('/api/courses/:id', authenticateUser, (req, res, next) => {
  req.course.remove(err => {
    if(err){
      return next(err)
    } else {
      res.sendStatus(204)
    }
  })
})


module.exports = router;