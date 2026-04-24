import { ethers } from "ethers";

// Replace with deployed contract address later
export const CONTRACT_ADDRESS = "0x1eFE3BFe2d9c3533676048c299F99225B5f021E8"; 

const contractABI = [
  "function createPost(string memory _id, string memory _content, string memory _category, string memory _tags) public",
  "function likePost(string memory _id) public",
  "function commentPost(string memory _id, string memory _commentText) public",
  "function flagPost(string memory _id) public",
  "function removePost(string memory _id) public",
  "function getPost(string memory _id) public view returns (tuple(string id, address author, string content, string category, string tags, address[] likers, tuple(address commenter, string commentText)[] comments, address[] flaggers, bool exists))",
  "function listPosts() public view returns (tuple(string id, address author, string content, string category, string tags, address[] likers, tuple(address commenter, string commentText)[] comments, address[] flaggers, bool exists)[])",
  "function getPostCount() public view returns (uint)"
];
const NERO_TESTNET_CHAIN_ID = "0x2b1"; // 689 in hex

// Ensure MetaMask is on the correct NERO Testnet chain
const ensureNeroChain = async () => {
    try {
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        if (currentChainId !== NERO_TESTNET_CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: NERO_TESTNET_CHAIN_ID }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId: NERO_TESTNET_CHAIN_ID,
                            chainName: "NERO Testnet",
                            nativeCurrency: { name: "NERO", symbol: "NERO", decimals: 18 },
                            rpcUrls: ["https://rpc-testnet.nerochain.io"],
                            blockExplorerUrls: ["https://testnetscan.nerochain.io"],
                        }],
                    });
                } else {
                    throw switchError;
                }
            }
        }
    } catch (err) {
        console.warn("Chain switch warning:", err);
    }
};

export const checkConnection = async () => {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to use this app.");
    }

    try {
        const accounts = await window.ethereum.request({ 
            method: "eth_requestAccounts" 
        });
        
        if (accounts.length > 0) {
            await ensureNeroChain();
            return { publicKey: accounts[0] };
        }
        return null;
    } catch (err) {
        console.error("Failed to connect wallet:", err);
        return null;
    }
};

const getContractWithSigner = async () => {
    if (!window.ethereum) throw new Error("MetaMask is not installed.");
    if (!CONTRACT_ADDRESS) throw new Error("Contract address is not set in lib/nero.js");

    const provider = new ethers.BrowserProvider(window.ethereum, 689);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
};

const getContractProvider = async () => {
    if (!window.ethereum) throw new Error("MetaMask is not installed.");
    if (!CONTRACT_ADDRESS) throw new Error("Contract address is not set in lib/nero.js");

    const provider = new ethers.BrowserProvider(window.ethereum, 689);
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
};

export const createPost = async (payload) => {
    if (!payload?.id) throw new Error("id is required");
    const contract = await getContractWithSigner();
    const tx = await contract.createPost(
        payload.id,
        payload.content || "",
        payload.category || "general",
        payload.tags || ""
    );
    return tx.wait();
};

export const likePost = async (payload) => {
    if (!payload?.id) throw new Error("id is required");
    const contract = await getContractWithSigner();
    const tx = await contract.likePost(payload.id);
    return tx.wait();
};

export const commentPost = async (payload) => {
    if (!payload?.id) throw new Error("id is required");
    if (!payload?.commentText) throw new Error("comment text is required");
    const contract = await getContractWithSigner();
    const tx = await contract.commentPost(payload.id, payload.commentText);
    return tx.wait();
};

export const flagPost = async (payload) => {
    if (!payload?.id) throw new Error("id is required");
    const contract = await getContractWithSigner();
    const tx = await contract.flagPost(payload.id);
    return tx.wait();
};

export const removePost = async (payload) => {
    if (!payload?.id) throw new Error("id is required");
    const contract = await getContractWithSigner();
    const tx = await contract.removePost(payload.id);
    return tx.wait();
};

// Convert nested result to a friendlier object
const formatPost = (post) => {
    if (!post || !post.exists) return null;
    return {
        id: post.id,
        author: post.author,
        content: post.content,
        category: post.category,
        tags: post.tags,
        likers: [...post.likers],
        comments: post.comments.map(c => ({
            commenter: c.commenter,
            commentText: c.commentText
        })),
        flaggers: [...post.flaggers],
        exists: post.exists
    };
};

export const getPost = async (id) => {
    if (!id) throw new Error("id is required");
    const contract = await getContractProvider();
    const post = await contract.getPost(id);
    return formatPost(post);
};

export const listPosts = async () => {
    const contract = await getContractProvider();
    const posts = await contract.listPosts();
    return posts.map(formatPost);
};

export const getPostCount = async () => {
    const contract = await getContractProvider();
    const count = await contract.getPostCount();
    return count.toString();
};
