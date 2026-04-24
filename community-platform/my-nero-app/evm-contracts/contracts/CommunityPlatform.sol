// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CommunityPlatform {
    struct Comment {
        address commenter;
        string commentText;
    }

    struct Post {
        string id;
        address author;
        string content;
        string category;
        string tags;
        address[] likers;
        Comment[] comments;
        address[] flaggers;
        bool exists;
    }

    mapping(string => Post) private posts;
    string[] private postIds;

    function createPost(string memory _id, string memory _content, string memory _category, string memory _tags) public {
        require(!posts[_id].exists, "Post ID already exists");
        
        Post storage newPost = posts[_id];
        newPost.id = _id;
        newPost.author = msg.sender;
        newPost.content = _content;
        newPost.category = _category;
        newPost.tags = _tags;
        newPost.exists = true;

        postIds.push(_id);
    }

    function likePost(string memory _id) public {
        require(posts[_id].exists, "Post does not exist");
        posts[_id].likers.push(msg.sender);
    }

    function commentPost(string memory _id, string memory _commentText) public {
        require(posts[_id].exists, "Post does not exist");
        posts[_id].comments.push(Comment(msg.sender, _commentText));
    }

    function flagPost(string memory _id) public {
        require(posts[_id].exists, "Post does not exist");
        posts[_id].flaggers.push(msg.sender);
    }

    function removePost(string memory _id) public {
        require(posts[_id].exists, "Post does not exist");
        require(posts[_id].author == msg.sender, "Only author can remove");
        
        delete posts[_id];
        // Remove from postIds
        for (uint i = 0; i < postIds.length; i++) {
            if (keccak256(abi.encodePacked(postIds[i])) == keccak256(abi.encodePacked(_id))) {
                postIds[i] = postIds[postIds.length - 1];
                postIds.pop();
                break;
            }
        }
    }

    function getPost(string memory _id) public view returns (Post memory) {
        require(posts[_id].exists, "Post does not exist");
        return posts[_id];
    }

    function listPosts() public view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](postIds.length);
        for (uint i = 0; i < postIds.length; i++) {
            allPosts[i] = posts[postIds[i]];
        }
        return allPosts;
    }

    function getPostCount() public view returns (uint) {
        return postIds.length;
    }
}
