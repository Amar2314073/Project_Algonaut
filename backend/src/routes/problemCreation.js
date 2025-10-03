const express = require('express');
const problemRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedProblemsByUser, submittedProblem} = require('../controllers/userProblem');
const userMiddleware = require('../middleware/userMiddleware');



// require admin access

problemRouter.post('/create',adminMiddleware, createProblem);
problemRouter.patch('/update/:id',adminMiddleware,updateProblem);
problemRouter.delete('/delete/:id',adminMiddleware,deleteProblem);

// don't require admin access
problemRouter.get('/getProblemById/:id',userMiddleware,getProblemById);
problemRouter.get('/getAllProblem',userMiddleware,getAllProblem);
problemRouter.get('/problemSolvedByUser',userMiddleware,solvedProblemsByUser);
problemRouter.get('/submittedProblem/:pid', userMiddleware, submittedProblem)

module.exports = problemRouter;