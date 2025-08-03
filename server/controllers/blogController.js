import fs from 'fs';
import imagekit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import main from '../configs/gemini.js';

export const addBlog = async (req, res)=>{
    try{
        const {title, subTitle, description, category, isPublished} = JSON.parse(req.body.blog);
        const imageFile = req.file;

        //check if field are ppresent
        if(!title || !description || !category || !imageFile){
            return res.json({success: false, message: 'Missing required fields'})
        }

        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname ,
            folder: "/blogs"
        })

        const optimizedImageURL = imagekit.url({
             path: response.filePath,
             transformation: [
                {quality: 'auto'},
                {format: 'webp'},
                {width: '1280'}
             ]
        });

        const image = optimizedImageURL;

        await Blog.create({title, subTitle, description, category, image, isPublished})

        res.json({success: true, message: 'Blog added successfully'});

    }catch(error){
            res.json({success: false, message: error.message});

    }
    
}

export const getAllBlogs = async (req, res)=>{
    try {
        const blogs = await Blog.find({isPublished: true});
        res.json({success: true, blogs});
    } catch (error) {
        res.json({success: false, message: error.message});

    }
}

export const getBlogById = async (req, res)=>{
    try {
        const {blogId} = req.params;
        const blog = await Blog.findById(blogId);
        if(!blog){
            return res.json({success: false, message: 'Blog not found'});
        }
        res.json({success: true, blog})
    } catch (error) {
        res.json({success: false, message: error.message});

    }
}

export const deleteBlogById = async (req, res)=>{
    try {
        const { id } = req.body;
        await Blog.findByIdAndDelete(id);

        await Comment.deleteMany({blog: id});
        res.json({success: true, message: 'Blog deleted successfully'});
    } catch (error) {
        res.json({success: false, message: error.message});

    }
}

export const togglePublish = async (req, res)=>{
    try {
        const { id } = req.body;
        const blog = await Blog.findById(id);
        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({success: true, message: 'Blog status updated'});

    } catch (error) {
        res.json({success: false, message: error.message});

    }

}

export const addComment = async (req, res)=>{
    try {
        const { blog, name, content } = req.body;
        await Comment.create({blog, name, content});
        res.json({success: true, message: 'Comment added for review'});

    } catch (error) {
        res.json({success: false, message: error.message});

    }
}

export const getBlogComments = async (req, res)=>{
    try {
        const { blogId } = req.body;
        const comments = await Comment.find({blog: blogId, isApproved: true}).sort({createdAt: -1});
        res.json({success: true, comments});

    } catch (error) {
        res.json({success: false, message: error.message});

    }
}

export const generateContent = async (req, res)=>{
    try {
        const {prompt} = req.body;
        // The prompt variable is now only used inside the template string
        const instruction = `
As an expert content strategist and writer, create a comprehensive and engaging blog post.

**Topic:** "${prompt}"

**Content Structure:**
1.  **Main Title:** An attention-grabbing title for the post.
2.  **Introduction:** A brief paragraph (2-3 sentences) that introduces the topic and hooks the reader.
3.  **Body Sections:** At least three distinct sections with clear subheadings. Each section should explore a key benefit or aspect of the topic.
4.  **Bulleted List:** Include at least one bulleted list to highlight key points or tips.
5.  **Conclusion:** A short paragraph that summarizes the main points and provides a final thought.

**Formatting Rules:**
-   The entire response **must** be in clean, standard Markdown.
-   Use a level-two heading \`##\` for the main title.
-   Use level-three headings \`###\` for all body section subheadings.
-   Use asterisks \`*\` for bullet points.
-   Use double asterisks \`**\` for bolding important keywords.
-   **CRITICAL:** Do not include any conversational text or preamble like "Sure, here is your blog post." The response must start directly with the main title.
`;
        const content = await main(instruction);
       // const content = await main(prompt + );
        res.json({success: true, content});
    } catch (error) {
        res.json({success: false, message: error.message});

    }
}
