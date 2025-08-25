const express = require("express")
const bodyParser = require('body-parser')
const posts = require("./posts.json")
const fs = require("fs");
const path = require("path");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const session = require('express-session');
const bcrypt = require('bcrypt');
const postModel = require("./models/posts")
const userModel = require("./models/user")
const dbConnection = require("./config/db")
require('dotenv').config();

// NOTE: Removed global email. Use per-user sessions instead.

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary environment variables are missing. Check your .env file and restart the server.');
}

// Ensure uploads directory exists for temporary storage
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for disk storage (temporary before uploading to Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });

const postsPath = path.join(__dirname, "posts.json");
const userPath = path.join(__dirname, "user.json");

const app = express()
const port = 3000

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json())
app.use(express.json())

// Sessions: per-user login state
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))
// Make userEmail available to all views as a default
app.use((req, res, next) => {
  res.locals.userEmail = (req.session && req.session.email) ? req.session.email : "";
  next();
})

let user = []
// Function to update JSON file
function updateJSONFile(newData, filePath) {
  try {
    // Read existing file
    const fileData = fs.readFileSync(filePath, "utf-8");
    // Parse JSON
    let jsonArr = JSON.parse(fileData);

    // Add new data (push into array)
    jsonArr.push(newData);

    // Write back updated JSON
    fs.writeFileSync(filePath, JSON.stringify(jsonArr, null, 2));

    console.log("✅ JSON file updated successfully!");
  } catch (err) {
    console.error("❌ Error updating JSON file:", err);
  }
}


app.use(express.static("public"));

app.get('/', async (req, res) => {
  const postsData = await postModel.find().lean()

  // Use MongoDB ObjectId instead of array index
  const postsWithId = postsData.map((p) => ({ ...p, id: p._id }));
  let randomPosts = postsWithId
    .sort(() => Math.random() - 0.5) // shuffle
    .slice(0, 4); // take 4
  
  res.render('index', { postsData: randomPosts, userEmail: (req.session && req.session.email) ? req.session.email : "", userName: req.session.username || ""})
})

app.get('/:user/dashboard', async (req, res) => {
  try {
    console.log(req.session.username)
    
    // Fetch posts for the current user from MongoDB
    const userEmail = req.session.email;
    const userPosts = await postModel.find({ userEmail: userEmail }).lean();
    let total = 0
    for(let i = 0; i < userPosts.length; i++){
      total += userPosts[i].views
    }
    const tviews = total
    res.render('dashboard', {
      userName: req.session.username,
      postArr: userPosts || [],
      totalViews: tviews
    });
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.render('dashboard', {
      userName: req.session.username,
      postArr: [],
      totalViews: NaN
    });
  }
})

app.post('/:user/dashboard', async (req, res)=>{
  console.log(req.body.action)
  console.log(req.body.action.split(",")[1])
  const changeId = req.body.action.split(",")[1]
  console.log(changeId)
  if(req.body.action.split(",")[0] === "delete"){
    await postModel.deleteOne({ _id: changeId });
  }
  try {
    
    // Fetch posts for the current user from MongoDB
    const userEmail = req.session.email;
    const userPosts = await postModel.find({ userEmail: userEmail }).lean();
    let total = 0
    for(let i = 0; i < userPosts.length; i++){
      total += userPosts[i].views
    }
    const tviews = total
    res.render('dashboard', {
      userName: req.session.username,
      postArr: userPosts || [],
      totalViews: tviews
    });
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.render('dashboard', {
      userName: req.session.username,
      postArr: [],
      totalViews: NaN
    });
  }
  
})

app.get('/blogs', async (req, res) => {
  try {
    const category = req.query.category;
    let query = {};
    
    // If category is specified, filter by category
    if (category && category !== 'all') {
      query.category = new RegExp(category, 'i'); // Case-insensitive search
    }
    
    const postsData = await postModel.find(query).lean();
    // Use MongoDB ObjectId instead of array index
    const postsWithId = postsData.map((p) => ({ ...p, id: p._id }));
    
    // Get all unique categories for the filter dropdown
    const allPosts = await postModel.find().lean();
    const categories = [...new Set(allPosts.map(post => post.category).filter(cat => cat))];
    
    res.render('blog', { 
      postsData: postsWithId, 
      userName: req.session.username,
      categories: categories,
      selectedCategory: category || 'all'
    });
  } catch (err) {
    console.error('Error reading posts:', err);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

app.get('/blogs/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Try to find post by MongoDB ObjectId first
    let post = await postModel.findById(postId).lean();
    
    // If not found by ObjectId, try to find by array index for backward compatibility
    if (!post) {
      const allPosts = await postModel.find().lean();
      const index = parseInt(postId, 10);
      if (!Number.isNaN(index) && index >= 0 && index < allPosts.length) {
        post = allPosts[index];
      }
    }
    
    if (!post) {
      return res.status(404).render('single_post', { post: null, error: 'Post not found' });
    }
    
    // Increment views count
    if (post._id) {
      await postModel.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
      post.views = (post.views || 0) + 1; // Update local copy for display
    }
    
    res.render('single_post', { post, Author: req.session.username});
  } catch (err) {
    console.error('Error loading post:', err);
    res.status(500).render('single_post', { post: null, error: 'Failed to load post' });
  }
});

app.get(`/:user/create_post`, (req, res) => {
  res.render('create_posts')
})

app.post('/:user/create-post', upload.single('image'), async (req, res) => {
  try {
    const { title, category, content, tags } = req.body;
    const newPost = { title, category, content, tags };

    console.log('Form fields:', { title, category, hasContent: !!content, tags });
    console.log('Received file:', req.file ? { originalname: req.file.originalname, path: req.file.path, mimetype: req.file.mimetype, size: req.file.size } : null);

    if (req.file && req.file.path) {
      // Prepare a processed (resized) temp file path
      const ext = path.extname(req.file.originalname || '.jpg') || '.jpg';
      const processedPath = path.join(uploadDir, `processed-${Date.now()}${ext}`);

      // Resize to exactly 400x405. Use cover to fill and center crop to avoid distortion.
      await sharp(req.file.path)
        .resize(400, 405, { fit: 'cover', position: 'centre' })
        .toFile(processedPath);

      // Upload the processed image to Cloudinary
      const result = await cloudinary.uploader.upload(processedPath, {
        folder: 'blog_posts',
      });
      console.log('Cloudinary upload success:', { url: result.secure_url, public_id: result.public_id });
      newPost.imageUrl = result.secure_url;
      newPost.imagePublicId = result.public_id;
      newPost.userEmail = (req.session && req.session.email) ? req.session.email : '';
      newPost.Author = req.session.username;
      newPost.views = 1

      // Cleanup temp files (original and processed)
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting original temp file:', err);
      });
      fs.unlink(processedPath, (err) => {
        if (err) console.error('Error deleting processed temp file:', err);
      });
    } else {
      console.warn('No image file received in request.');
    }

    await postModel.create(newPost);
    console.log('✅ Blog post saved to MongoDB successfully!');
    res.send('Blog post received and saved to database!');
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).send('Failed to create post: ' + (err && err.message ? err.message : 'unknown error'));
  }
});

app.get('/login', (req, res) => {
  res.render('login', { error: null })
})

app.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body)
    let passwd = req.body.password
    let email = req.body.email
    const userData = await userModel.find({email: email})
    
    console.log('User found:', userData[0])
    if(userData[0] === undefined){
      console.log('User not found in database')
      return res.render('login', { error: "User doesn't exist. Please check your email or sign up." })
    }
    else{
      console.log('Stored password:', userData[0].password)
      console.log('Provided password:', passwd)
      
      // Check if password is already hashed (starts with $2b$ for bcrypt)
      if (userData[0].password.startsWith('$2b$')) {
        console.log('Password is hashed, using bcrypt compare')
        // Use bcrypt to compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(passwd, userData[0].password);
        
        if(isPasswordValid){
          // Set session data after successful login
          req.session.email = email
          req.session.username = userData[0].fullName
          
          // Get posts from MongoDB instead of JSON file
          const postsData = await postModel.find().lean()
          const postsWithId = postsData.map((p) => ({ ...p, id: p._id }));
          let randomPosts = postsWithId
            .sort(() => Math.random() - 0.5) // shuffle
            .slice(0, 4); // take 4
          console.log("Login successful with hashed password")
          res.render("index", {postsData: randomPosts, userEmail: email, userName: userData[0].fullName})
        }
        else{
          console.log('Bcrypt comparison failed')
          return res.render('login', { error: "Invalid credentials. Please check your email and password." })
        }
      } else {
        console.log('Password is plain text, doing direct comparison')
        // For backward compatibility with plain text passwords
        if (passwd === userData[0].password) {
          // Hash the password and update it in the database
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(passwd, saltRounds);
          await userModel.findByIdAndUpdate(userData[0]._id, { 
            password: hashedPassword,
            confirmPassword: hashedPassword 
          });
          
          // Set session data after successful login
          req.session.email = email
          req.session.username = userData[0].fullName
          
          // Get posts from MongoDB instead of JSON file
          const postsData = await postModel.find().lean()
          const postsWithId = postsData.map((p) => ({ ...p, id: p._id }));
          let randomPosts = postsWithId
            .sort(() => Math.random() - 0.5) // shuffle
            .slice(0, 4); // take 4
          console.log("Login successful with plain text password (now hashed)")
          res.render("index", {postsData: randomPosts, userEmail: email, userName: userData[0].fullName})
        } else {
          console.log('Plain text comparison failed')
          return res.render('login', { error: "Invalid credentials. Please check your email and password." })
        }
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.render('login', { error: "Login failed. Please try again." })
  }
})

app.get('/signup', (req, res) => {
  res.render('signup')
})

app.post('/signup', async (req, res) => {
  try {
    console.log(req.body)
    const { fullName, email, password, confirmPassword } = req.body

    // Basic server-side validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).send('All fields are required')
    }
    if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match')
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User with this email already exists')
    }

    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await userModel.create({
      fullName,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    })

    req.session.username = fullName
    res.render('login')
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).send('Signup failed');
  }
})

app.listen(port, () => {
  console.log(`http://localhost:3000`)
  console.log(`Example app listening on port ${port}`)
})