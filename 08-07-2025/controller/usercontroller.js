
import allUsers from "../data/users.js";
import allcomments from "../data/comments.js";
import allPosts from "../data/posts.js";

export const user = async (req, res) => {
    console.log("User endpoint hit!"); 
    return res.json({
        allUsers
    });
};
export const userid = async (req, res) => {
    console.log("User endpoint hit!");
    const id = req.params.id 
    return res.json(allUsers[id-1])
};

export const posts = async (req, res) => {
    console.log("Posts endpoint hit!");
    return res.json(
        allPosts
    );
};
export const postsid = async (req, res) => {
    console.log("Posts endpoint hit!");
    const id = req.params.id;
    return res.json(allPosts[id-1]);
};

export const comments = async (req, res) => {
    console.log("Comments Endpoint Hit");
    return res.json(allcomments)
};

export const commentsid = async (req, res) => {
    const id = req.params.id;
    return res.json(allcomments[id-1]);
};

export const userProfile = async (req, res) => {
    res.send("Profile Updated");
};
export const home = async (req, res) => {
    res.send("Welcome to the Home Page");
};
 