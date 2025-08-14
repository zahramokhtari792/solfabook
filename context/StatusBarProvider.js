import { createContext, useContext, useState, useRef, useEffect } from 'react';
import CustomStatusBar from '../components/CustomStatusBar';
const StatusBarContext = createContext();

export const StatusBarProvider = ({ children }) => {
    return (
        <StatusBarContext.Provider value={{}}>
            <CustomStatusBar/>
            {children}
        </StatusBarContext.Provider>
    );
};

