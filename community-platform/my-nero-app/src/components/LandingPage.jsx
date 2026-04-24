import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Rocket, Cpu, Shield, Globe } from "lucide-react";

export default function LandingPage({ onLaunch }) {
    const heroRef = useRef(null);
    const elementsRef = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Main Hero Animation
            gsap.fromTo(
                ".hero-text",
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power4.out" }
            );

            // Floating Background Elements
            elementsRef.current.forEach((el, index) => {
                gsap.to(el, {
                    y: `-${20 + index * 10}`,
                    x: `${index % 2 === 0 ? 10 : -10}`,
                    duration: 3 + index,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });

        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={heroRef} className="landing-container">
            {/* Background Orbs */}
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            
            {/* Floating Glass Panels */}
            <div 
                ref={(el) => (elementsRef.current[0] = el)} 
                className="floating-panel panel-1 glass"
            >
                <Cpu size={24} className="icon-blue" />
                <span>Smart Contracts</span>
            </div>
            <div 
                ref={(el) => (elementsRef.current[1] = el)} 
                className="floating-panel panel-2 glass"
            >
                <Shield size={24} className="icon-purple" />
                <span>Secure & Immutable</span>
            </div>
            
            {/* Main Content */}
            <div className="landing-content glass hero-main">
                <div className="hero-text hero-badge">NERO Chain Project 2026</div>
                <h1 className="hero-text title-gradient">Decentralized<br />Community Hub</h1>
                <p className="hero-text subtitle">
                    Experience the next generation of social interaction on the NERO blockchain. Connect your wallet, share ideas, and engage seamlessly.
                </p>
                <div className="hero-text action-row">
                    <button className="primary-btn launch-btn" onClick={onLaunch}>
                        <Globe size={20} />
                        Launch DApp
                    </button>
                    <a href="https://nerochain.io" target="_blank" rel="noreferrer" className="secondary-btn">
                        <Rocket size={20} />
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    );
}
