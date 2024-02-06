import Post from '../Models/Post.js';
import User from '../Models/User.js';

export const loadPosts = async (req, res) => {
  try {
    const selectedUserId = req.query.user; // Get user selection from query parameters
    let query = {};

    if (selectedUserId && selectedUserId !== 'all') {
      query.author = selectedUserId; // Filter posts by selected user
    }

    // Fetch posts based on the query and populate the author's username
    const posts = await Post.find(query).populate('author', 'username');

    // Count the total number of posts for display
    const totalPosts = await Post.countDocuments(query);

    // Fetch all users for the dropdown
    const users = await User.find();

    // Render the template with the necessary data
    res.render('posts/index', {
      posts,
      totalPosts,
      users,
      selectedUser: selectedUserId, // Pass the selected user ID to the template
      user: req.user ? req.user : null,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
};


export const writePost = (req, res) => { 
  res.render('posts/new', {post: null});
}

export const createPost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = new Post({ title, content, author: req.user._id });
    await post.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error.toString());
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await Post.findOneAndDelete({ _id: id });
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error.toString());
  }
};


// Show form to edit a post (only for post author or admin)
 export const editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).send('Unauthorized');
    }
    res.render('posts/new', { post });
  } catch (error) {
    res.status(500).send(error.toString());
  }
};

// Update a post (only for post author or admin)
 export const savePost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).send('Unauthorized');
    }
    post.title = title;
    post.content = content;
    await post.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error.toString());
  }
};

