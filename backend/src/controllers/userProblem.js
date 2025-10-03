const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission')
const {getLanguageById, submitBatch, submitToken} = require('../utils/problemUtility');
const SolutionVideo = require('../models/solutionVideo');
const resultId = [
  {
    "id": 1,
    "description": "In Queue"
  },
  {
    "id": 2,
    "description": "Processing"
  },
  {
    "id": 3,
    "description": "Accepted"
  },
  {
    "id": 4,
    "description": "Wrong Answer"
  },
  {
    "id": 5,
    "description": "Time Limit Exceeded"
  },
  {
    "id": 6,
    "description": "Compilation Error"
  },
  {
    "id": 7,
    "description": "Runtime Error (SIGSEGV)"
  },
  {
    "id": 8,
    "description": "Runtime Error (SIGXFSZ)"
  },
  {
    "id": 9,
    "description": "Runtime Error (SIGFPE)"
  },
  {
    "id": 10,
    "description": "Runtime Error (SIGABRT)"
  },
  {
    "id": 11,
    "description": "Runtime Error (NZEC)"
  },
  {
    "id": 12,
    "description": "Runtime Error (Other)"
  },
  {
    "id": 13,
    "description": "Internal Error"
  },
  {
    "id": 14,
    "description": "Exec Format Error"
  }
]

const createProblem = async(req,res)=>{
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator} = req.body;

    try{
        for(const {language,completeCode} of referenceSolution){
            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testCase)=>({
                source_code:completeCode,
                language_id:languageId,
                stdin:testCase.input,
                expected_output:testCase.output
            }))

            const submitResult = await submitBatch(submissions);

            const resultToken = submitResult.map((value)=>value.token);
            const testResult = await submitToken(resultToken);

            for(const test of testResult){
                if(test.status_id!=3){
                    return res.status(400).send("Error Occured!");
                }
            }
            
        }

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        res.status(201).send("Problem saved successfully!");
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
}

const updateProblem = async(req,res)=>{
    const {id} = req.params;
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator} = req.body;
    try{
        if(!id)
            return res.status(400).send("Missing ID Field!");

        const DSAProblem = await Problem.findById(id);

        if(!DSAProblem)
            return res.status(404).send("Id is not present in server!");

        for(const {language,completeCode} of referenceSolution){

            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map(({input,output})=>({
                source_code:completeCode,
                language_id:languageId,
                stdin:input,
                expected_output:output
            }))

            const submitResult = await submitBatch(submissions);

            const resultToken = submitResult.map((value)=>value.token);
            const testResult = await submitToken(resultToken);

            for(const test of testResult){
                if(test.status_id!=3){
                    return res.status(400).send("Error Occured!");
                }
            }
            
        }

        const newProblem = await Problem.findByIdAndUpdate(id, {...req.body}, {runValidators:true, new:true})

        res.status(200).send("Problem updated successfully!");
    }
    catch(err){
        res.status(404).send("Error: "+err.message);
    }
}

const deleteProblem = async(req,res)=>{
    const {id} = req.params;
    try{
        if(!id)
            return res.status(400).send("Id is Missing!");

        const deletedProblem = await Problem.findByIdAndDelete(id);
        if(!deletedProblem)
            return res.status(404).send("Problem is Missing!");

        res.status(200).send("Problem deleted successfully!")
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}

const getProblemById = async(req,res)=>{
    const {id} = req.params;
    try{
        if(!id)
            return res.status(400).send("Id is Missing!");

        const requestedProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');

        if(!requestedProblem)
            return res.status(404).send("Problem is Missing!");

        const requestedVideo = await SolutionVideo.findOne({problemId:id});

        if(requestedVideo){
            const responseData = {
                ...requestedProblem.toObject(),
                secureUrl:videos.secureUrl,
                thumbnailUrl : videos.thumbnailUrl,
                duration : videos.duration,
            }
            return res.status(200).send(responseData);
        }
        res.status(200).send(requestedProblem);
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}

const getAllProblem = async(req,res)=>{
    try{

        const problems = await Problem.find({}).select('_id title difficulty tags');

        if(problems.length == 0)
            return res.status(404).send("Problem is Missing!");

        res.status(200).send(problems);
    }
    catch(err){   
        res.status(500).send("Error: "+err.message);
    }
}

const solvedProblemsByUser = async(req,res)=>{
    try{
        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path:"problemSolved",
            select:"_id title difficulty tags"
        });
        res.status(200).send(user.problemSolved);
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}

const submittedProblem = async(req,res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.pid;

        const ans = await Submission.find({userId, problemId});
        if(ans.length==0)
            res.status(200).send("No submission!");


        res.status(200).send(ans);
    }
    catch(err){
        res.status(500).send("Internal server Error!");
    }
}

module.exports = {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedProblemsByUser, submittedProblem};


// pagenation 
// localhost:3000/problem/getAllProblem?page=1&limit=10
// const getProblem = await Problem.find().skip((page-1)*10).limit(10);

// Filter 
// await Problem.find({difficulty:'easy'};)

