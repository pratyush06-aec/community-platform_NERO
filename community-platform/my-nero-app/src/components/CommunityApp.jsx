import React, { useState, useRef, useEffect } from "react";
import { checkConnection, createPost, likePost, commentPost, flagPost, removePost, getPost, listPosts, getPostCount } from "../../lib/nero.js";
import { 
    Heart, MessageCircle, AlertTriangle, Trash2, PenTool, Zap, 
    BookOpen, User, Wallet, ArrowLeft, Loader2, Search, BarChart3, ChevronRight, CheckCircle2, X 
} from "lucide-react";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, (key, val) => 
        typeof val === 'bigint' ? val.toString() : val
    , 2);
};

const generatePostId = () => `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

const initialForm = () => ({
    id: generatePostId(),
    author: "",
    content: "Just deployed my first NERO smart contract!",
    category: "general",
    tags: "nero, evm, web3",
    liker: "",
    commenter: "",
    commentText: "",
    flagger: "",
});

const TABS = ["Compose", "Interact", "Feed"];

export default function CommunityApp({ onExit }) {
    const [form, setForm] = useState(initialForm);
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [countValue, setCountValue] = useState("-");
    const [loadingAction, setLoadingAction] = useState(null);
    const [status, setStatus] = useState("idle");
    const [activeTab, setActiveTab] = useState(0);
    const [confirmAction, setConfirmAction] = useState(null);
    const confirmTimer = useRef(null);
    const [connectedAddress, setConnectedAddress] = useState("");
    const [successToast, setSuccessToast] = useState(null);
    const toastTimer = useRef(null);

    useEffect(() => () => {
        if (confirmTimer.current) clearTimeout(confirmTimer.current);
        if (toastTimer.current) clearTimeout(toastTimer.current);
    }, []);

    const showSuccessToast = (message, txHash) => {
        setSuccessToast({ message, txHash });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setSuccessToast(null), 12000);
    };

    const dismissToast = () => {
        setSuccessToast(null);
        if (toastTimer.current) clearTimeout(toastTimer.current);
    };

    const setField = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const runAction = async (action, actionLabel) => {
        setIsBusy(true);
        try {
            const result = await action();
            // Check if the result is a transaction receipt (has a hash)
            if (result && result.hash) {
                const txHash = result.hash;
                const explorerUrl = `https://testnetscan.nerochain.io/tx/${txHash}`;
                const successMsg = `✅ ${actionLabel || "Transaction"} confirmed!\n\n` +
                    `Tx Hash: ${txHash}\n` +
                    `Block: ${result.blockNumber}\n` +
                    `Status: ${result.status === 1 ? "Success" : "Failed"}\n\n` +
                    `View on explorer: ${explorerUrl}`;
                setOutput(successMsg);
                showSuccessToast(`${actionLabel || "Transaction"} confirmed on NERO blockchain!`, txHash);
            } else {
                setOutput(toOutput(result ?? "No data found"));
            }
            setStatus("success");
        } catch (error) {
            let errorMsg = error?.reason || error?.message || String(error);
            if (errorMsg.includes("Post ID already exists") || errorMsg.includes("Error(Contract, #3)")) {
                const newId = generatePostId();
                errorMsg = `Duplicate Post ID! This ID is already taken on the blockchain. A new unique ID has been generated for you: ${newId}`;
                setForm((prev) => ({ ...prev, id: newId }));
                window.alert(errorMsg);
            }
            setOutput(errorMsg);
            setStatus("error");
        } finally {
            setIsBusy(false);
        }
    };

    const withLoading = (key, fn) => async () => {
        setLoadingAction(key);
        await fn();
        setLoadingAction(null);
    };

    const handleDestructive = (key, fn) => () => {
        if (confirmAction === key) {
            clearTimeout(confirmTimer.current);
            setConfirmAction(null);
            fn();
        } else {
            setConfirmAction(key);
            confirmTimer.current = setTimeout(() => setConfirmAction(null), 3000);
        }
    };

    const onConnect = withLoading("connect", () => runAction(async () => {
        const user = await checkConnection();
        if (user) {
            setConnectedAddress(user.publicKey);
            setForm((prev) => ({
                ...prev,
                author: prev.author || user.publicKey,
                liker: prev.liker || user.publicKey,
                commenter: prev.commenter || user.publicKey,
                flagger: prev.flagger || user.publicKey,
            }));
        }
        const next = user ? `Wallet: ${user.publicKey}` : "Wallet: not connected";
        setWalletState(next);
        return next;
    }));

    const onCreate = withLoading("create", () => runAction(async () => {
        // 1. Check if already authorized — no popup if already connected
        const existingAccounts = await window.ethereum.request({ 
            method: "eth_accounts"  // Does NOT trigger popup
        });

        if (existingAccounts.length === 0) {
            const connection = await checkConnection();
            if (!connection) {
                throw new Error("Wallet not connected. Please connect your wallet first.");
            }
            setConnectedAddress(connection.publicKey);
            setForm((prev) => ({
                ...prev,
                author: prev.author || connection.publicKey,
            }));
        }

        // 2. Now fire the transaction
        const result = await createPost({
            id: form.id.trim(),
            author: form.author.trim(),
            content: form.content.trim(),
            category: form.category.trim(),
            tags: form.tags.trim(),
        });
        setForm((prev) => ({ ...prev, id: generatePostId() }));
        return result;
    }, "Post Published"));

    const onLike = withLoading("like", () => runAction(async () => likePost({
        id: form.id.trim(),
        liker: form.liker.trim() || form.author.trim(),
    }), "Post Liked"));

    const onComment = withLoading("comment", () => runAction(async () => commentPost({
        id: form.id.trim(),
        commenter: form.commenter.trim() || form.author.trim(),
        commentText: form.commentText.trim(),
    }), "Comment Added"));

    const onFlag = handleDestructive("flag", withLoading("flag", () => runAction(async () => flagPost({
        id: form.id.trim(),
        flagger: form.flagger.trim() || form.author.trim(),
    }), "Post Flagged")));

    const onRemove = handleDestructive("remove", withLoading("remove", () => runAction(async () => removePost({
        id: form.id.trim(),
        author: form.author.trim(),
    }), "Post Removed")));

    const onGet = withLoading("get", () => runAction(async () => getPost(form.id.trim())));

    const onList = withLoading("list", () => runAction(async () => listPosts()));

    const onCount = withLoading("count", () => runAction(async () => {
        const value = await getPostCount();
        setCountValue(String(value));
        return { count: value };
    }));

    const isConnected = connectedAddress.length > 0;
    const truncAddr = connectedAddress ? connectedAddress.slice(0, 6) + "..." + connectedAddress.slice(-4) : "";

    const outputIsEmpty = output === "Ready.";

    return (
        <main className="dapp-container slide-in">
            {/* Success Toast */}
            {successToast && (
                <div className="success-toast slide-in">
                    <div className="toast-content">
                        <CheckCircle2 size={22} className="toast-icon" />
                        <div className="toast-text">
                            <strong>{successToast.message}</strong>
                            {successToast.txHash && (
                                <a 
                                    href={`https://testnetscan.nerochain.io/tx/${successToast.txHash}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="toast-link"
                                >
                                    View on Explorer →
                                </a>
                            )}
                        </div>
                    </div>
                    <button className="toast-dismiss" onClick={dismissToast}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Header / Nav */}
            <header className="dapp-header glass">
                <button className="back-btn" onClick={onExit} aria-label="Back to landing">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <Zap size={22} className="icon-gradient" />
                    <h2>Nero Hub</h2>
                </div>
                <div className="wallet-actions">
                    <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></div>
                    <button className={`wallet-btn ${isConnected ? 'connected' : ''}`} onClick={onConnect} disabled={isBusy}>
                        <Wallet size={16} />
                        {isConnected ? truncAddr : "Connect"}
                    </button>
                </div>
            </header>

            <div className="dapp-grid">
                {/* Left Area: Navigation Tabs */}
                <aside className="dapp-sidebar glass">
                    <nav className="tab-menu">
                        {TABS.map((tab, i) => {
                            const icons = [<PenTool size={18} />, <Search size={18} />, <BookOpen size={18} />];
                            return (
                                <button
                                    key={tab}
                                    className={`tab-item ${activeTab === i ? "active" : ""}`}
                                    onClick={() => setActiveTab(i)}
                                >
                                    <span className="tab-icon">{icons[i]}</span>
                                    {tab}
                                    {activeTab === i && <ChevronRight size={16} className="active-chevron" />}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="sidebar-stats">
                        <div className="stat-box">
                            <BarChart3 size={16} className="icon-blue" />
                            <div>
                                <div className="stat-label">Total Posts</div>
                                <div className="stat-value">{countValue}</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Interaction Area */}
                <section className="dapp-main">
                    
                    {/* Tab: Compose */}
                    {activeTab === 0 && (
                        <div className="content-panel glass fade-in">
                            <div className="panel-header">
                                <h3>Compose Post</h3>
                            </div>
                            <textarea
                                name="content"
                                rows="4"
                                className="premium-input text-area"
                                value={form.content}
                                onChange={setField}
                                placeholder="What's happening?"
                            />
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Post ID</label>
                                    <input name="id" value={form.id} onChange={setField} className="premium-input" />
                                </div>
                                <div className="input-group">
                                    <label>Category</label>
                                    <input name="category" value={form.category} onChange={setField} className="premium-input" />
                                </div>
                                <div className="input-group">
                                    <label>Tags</label>
                                    <input name="tags" value={form.tags} onChange={setField} className="premium-input" />
                                </div>
                                <div className="input-group">
                                    <label>Author</label>
                                    <input name="author" value={form.author} onChange={setField} className="premium-input" placeholder="0x..." />
                                </div>
                            </div>
                            <div className="panel-footer">
                                <button className="action-btn primary" onClick={onCreate} disabled={isBusy}>
                                    {loadingAction === "create" ? <Loader2 className="spin" size={18} /> : <PenTool size={18} />}
                                    Publish
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab: Interact */}
                    {activeTab === 1 && (
                        <div className="content-panel glass fade-in">
                            <div className="panel-header">
                                <h3>Interact with Content</h3>
                            </div>
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Target Post ID</label>
                                    <input name="id" value={form.id} onChange={setField} className="premium-input" />
                                </div>
                                <div className="input-group">
                                    <label>Comment Text</label>
                                    <input name="commentText" value={form.commentText} onChange={setField} className="premium-input" />
                                </div>
                                <div className="input-group">
                                    <label>Liker/Flagger Address</label>
                                    <input name="liker" value={form.liker} onChange={setField} className="premium-input" placeholder="0x..." />
                                </div>
                                <div className="input-group">
                                    <label>Commenter Address</label>
                                    <input name="commenter" value={form.commenter} onChange={setField} className="premium-input" placeholder="0x..." />
                                </div>
                            </div>
                            <div className="action-row flex-wrap">
                                <button className="action-btn like" onClick={onLike} disabled={isBusy}>
                                    {loadingAction === "like" ? <Loader2 className="spin" size={16} /> : <Heart size={16} />} Like
                                </button>
                                <button className="action-btn comment" onClick={onComment} disabled={isBusy}>
                                    {loadingAction === "comment" ? <Loader2 className="spin" size={16} /> : <MessageCircle size={16} />} Comment
                                </button>
                                <button className="action-btn flag" onClick={onFlag} disabled={isBusy && loadingAction !== "flag"}>
                                    {loadingAction === "flag" ? <Loader2 className="spin" size={16} /> : <AlertTriangle size={16} />} 
                                    {confirmAction === "flag" ? "Confirm?" : "Flag"}
                                </button>
                                <button className="action-btn danger" onClick={onRemove} disabled={isBusy && loadingAction !== "remove"}>
                                    {loadingAction === "remove" ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />} 
                                    {confirmAction === "remove" ? "Confirm?" : "Remove"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab: Feed */}
                    {activeTab === 2 && (
                        <div className="content-panel glass fade-in">
                            <div className="panel-header">
                                <h3>Feed Browser</h3>
                            </div>
                            <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                                <label>Post ID to Fetch</label>
                                <input name="id" value={form.id} onChange={setField} className="premium-input" />
                            </div>
                            <div className="action-row">
                                <button className="action-btn outline" onClick={onGet} disabled={isBusy}>
                                    {loadingAction === "get" && <Loader2 className="spin" size={16} />} Get Post
                                </button>
                                <button className="action-btn outline" onClick={onList} disabled={isBusy}>
                                    {loadingAction === "list" && <Loader2 className="spin" size={16} />} List All
                                </button>
                                <button className="action-btn outline" onClick={onCount} disabled={isBusy}>
                                    {loadingAction === "count" && <Loader2 className="spin" size={16} />} Get Count
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Output Console */}
                    <div className={`terminal-output glass ${status} mt-4`}>
                        <div className="terminal-header">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                            <span className="terminal-title">Output Console</span>
                        </div>
                        {outputIsEmpty ? (
                            <div className="empty-text">No output yet. Perform an action to see results.</div>
                        ) : (
                            <pre className="output-body">{output}</pre>
                        )}
                    </div>

                </section>
            </div>
        </main>
    );
}
