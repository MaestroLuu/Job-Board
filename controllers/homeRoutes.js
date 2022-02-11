const router = require("express").Router();
const { User, Job } = require("../models");
const withAuth = require("../utils/withAuth");

//directs to about page (works)
router.get("/", (req, res) => {
    res.render("about");
});

//directs to login page (works)
router.get("/login", (req, res) => {
  res.render("login", { title: "Log-In Page" });
});

//directs to registration page (works)
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Registration Page" });
});

//directs to homepage (works)
router.get("/home", withAuth, async (req,res) => {
    res.render('home', {
        title: "Home Page",
        logged_in: req.session.logged_in,
    });
}); 

//directs to jobs page; missing cookie information
router.get("/jobs", withAuth, async (req, res) =>{
    // find all jobs in db
    const jobPosts = await Job.findAll({
        attributes: {exclude: req.session.userId},
    }).catch((err) => {
        res.status(500).json(err);
    });
    //serialize jobs so that appropriate values can be displayed
    const jobs = jobPosts.map((posts) => posts.get({ plain:true}));
    
    // create a jobs.handlebars and partial cards for each job post
    res.render('jobs', {
      jobs,
      title: "Job Posts",
      logged_in: req.session.logged_in,
    });
});

// directs to job description page
router.get("/jobs/:id", withAuth, async (req, res) =>{
    try {
        const jobPost = await Job.findByPk(req.params.id);
        if(!jobPost) {
            res.status(404).json({ message: 'No job post exists with this id!'});
            return;
        }        
        //serializes that specific job post 
        const jobDescription = jobPost.get({ plain: true});
        // create a description.handlebars
        res.render('description', {
          jobDescription,
          title: "Job Description",
          logged_in: req.session.logged_in,
        });
    } catch (err) {
        res.status(500).json(err)
    }
});

//missing cooking information
router.get("/hiring", withAuth, async (req, res) =>{
    const jobPosts = await Job.findAll({where: {id: req.body.id}}).catch((err) => {
        res.status(500).json(err);
    });
    
    //serialize jobs so that appropriate values can be displayed
    const jobs = jobPosts.map((posts) => posts.get({ plain:true}));

    // create hiring handlebars
    res.render ('hire', {
        jobs, 
        where: {id: req.body.id},
        title: "Job Posts",
        logged_in: req.session.logged_in
    });
});

module.exports = router;
