import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import CommunityApp from "./components/CommunityApp";
import "./App.css";

export default function App() {
    const [inApp, setInApp] = useState(false);

    return (
        <>
            {inApp ? (
                <CommunityApp onExit={() => setInApp(false)} />
            ) : (
                <LandingPage onLaunch={() => setInApp(true)} />
            )}
        </>
    );
}