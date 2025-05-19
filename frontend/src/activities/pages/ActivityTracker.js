import React, { useState, useContext, useEffect, useRef } from 'react';

import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import './ActivityTracker.css';

const ActivityTracker = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedUser, setLoadedUser] = useState(null);

    const [activity, setActivity] = useState("Idle");
    const [speed, setSpeed] = useState(null);
    const [steps, setSteps] = useState(0);
    const [acceleration, setAcceleration] = useState(null);
    const [lastChangeTime, setLastChangeTime] = useState(Date.now());
    const [isMobile, setIsMobile] = useState(false);
    const [motionPermissionStatus, setMotionPermissionStatus] = useState("pending");
    const [activities, setActivities] = useState([]);

    const motionHandlerRef = useRef(() => { });

    useEffect(() => {
        setLoadedUser(null);
        const fetchUser = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/users/current`, 'GET', null, {
                    Authorization: 'Bearer ' + auth.token
                }
                );
                setLoadedUser(responseData.user);
            } catch (err) { }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        loadActivities();
    }, []);

    useEffect(() => {
        setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }, []);

    useEffect(() => {
        const alpha = 0.8;
        let lastAcc = { x: 0, y: 0, z: 0 };
        let lastTime = Date.now();
        const throttleInterval = 100;

        const motionHandler = (event) => {
            const now = Date.now();
            if (now - lastTime < throttleInterval) return;
            lastTime = now;

            const acc = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
            lastAcc.x = alpha * lastAcc.x + (1 - alpha) * acc.x;
            lastAcc.y = alpha * lastAcc.y + (1 - alpha) * acc.y;
            lastAcc.z = alpha * lastAcc.z + (1 - alpha) * acc.z;

            const totalAcc = Math.sqrt(
                lastAcc.x ** 2 + lastAcc.y ** 2 + lastAcc.z ** 2
            );

            setAcceleration(totalAcc.toFixed(2));
        };

        motionHandlerRef.current = motionHandler;

        const enableMotion = async () => {
            if (
                typeof DeviceMotionEvent !== "undefined" &&
                typeof DeviceMotionEvent.requestPermission === "function"
            ) {
                try {
                    const response = await DeviceMotionEvent.requestPermission();
                    if (response === "granted") {
                        setMotionPermissionStatus("granted");
                        window.addEventListener("devicemotion", motionHandlerRef.current);
                    } else {
                        setMotionPermissionStatus("denied");
                    }
                } catch (error) {
                    console.error("Motion permission error:", error);
                    setMotionPermissionStatus("denied");
                }
            } else {
                setMotionPermissionStatus("granted");
                window.addEventListener("devicemotion", motionHandlerRef.current);
            }
        };

        if (isMobile) {
            enableMotion();
        }

        return () => {
            window.removeEventListener("devicemotion", motionHandlerRef.current);
        };
    }, [isMobile]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            const watch = navigator.geolocation.watchPosition(
                (position) => {
                    const currentSpeed = position.coords.speed || 0;
                    const now = Date.now();
                    const seconds = (now - lastChangeTime) / 1000;

                    let newActivity = "Idle";
                    let stepRate = 0;

                    //0.8
                    if (currentSpeed < 0.4) {
                        newActivity = "Idle";
                    } else if (currentSpeed < 2) { //2.5
                        newActivity = "Walking";
                        stepRate = 1.5;
                    } else if (currentSpeed < 4) { //4.5
                        newActivity = "Running";
                        stepRate = 2.5;
                    } else if (currentSpeed < 14) { //15
                        newActivity = "Cycling";
                    } else {
                        newActivity = "Driving";
                    }

                    setSpeed(currentSpeed.toFixed(2));
                    setSteps((prev) => prev + seconds * stepRate);

                    if (newActivity !== activity && seconds > 5) {
                        let weightKg = 70;
                        if (loadedUser !== null) {
                            if (!isNaN(loadedUser.weight)) {
                                weightKg = parseFloat(loadedUser.weight);
                            }
                        }
                        const calories = calculateCalories(activity, seconds, weightKg);
                        const totalSteps = Math.floor(steps);
                        const distance = calculateStepDistance(totalSteps);

                        if (activity !== "Idle") {
                            if (activity !== 'GPS Error') {
                                const addNewActivity = async () => {
                                    // const newActivityObj = {
                                    //     type: activity,
                                    //     duration: seconds,
                                    //     caloriesBurned: calories,
                                    //     startedOn: new Date(now.getTime() - seconds * 1000),
                                    //     endedOn: now,
                                    // };
                                    // await addActivity(newActivityObj);
                                    try {
                                        const secondWholeNumber = Math.floor(seconds);
                                        await sendRequest(
                                            `${process.env.REACT_APP_BACKEND_URL}/workouts`,
                                            'POST',
                                            JSON.stringify({
                                                type: activity,
                                                duration: secondWholeNumber,
                                                caloriesBurned: calories,
                                                startedOn: new Date(new Date().getTime() - secondWholeNumber * 1000),
                                                endedOn: new Date(),
                                                steps: totalSteps,
                                                distance: distance, // in meters
                                            }),
                                            {
                                                'Content-Type': 'application/json',
                                                Authorization: 'Bearer ' + auth.token
                                            }
                                        );
                                    } catch (err) { }
                                    //loadActivities(); // refresh the list
                                };
                                addNewActivity();
                            }
                        }
                        setActivity(newActivity);
                        setLastChangeTime(now);
                    }
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    setActivity("GPS Error");
                },
                { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
            );

            return () => navigator.geolocation.clearWatch(watch);
        } else {
            setActivity("Geolocation Not Supported");
        }
    }, [activity, lastChangeTime]);

    const loadActivities = async () => {
        setActivities([]);
        const fetchActivities = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/workouts/user`, 'GET', null, {
                    Authorization: 'Bearer ' + auth.token
                }
                );
                setActivities(responseData.workouts);
            } catch (err) { }
        };
        fetchActivities();
    };

    const requestMotionPermission = async () => {
        if (
            typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function"
        ) {
            try {
                const response = await DeviceMotionEvent.requestPermission();
                if (response === "granted") {
                    setMotionPermissionStatus("granted");
                    window.addEventListener("devicemotion", motionHandlerRef.current);
                } else {
                    setMotionPermissionStatus("denied");
                }
            } catch (error) {
                console.error("Retry permission error:", error);
                setMotionPermissionStatus("denied");
            }
        }
    };

    const calculateCalories = (type, durationInSeconds, weightKg) => {
        const METS = {
            Idle: 1,
            Walking: 3.5,
            Running: 7.5,
            Cycling: 6.8,
            Driving: 1.5
        };
        const caloriesPerSecond = (METS[type] || 1) * 3.5 * weightKg / 200 / 60;
        const calories = caloriesPerSecond * durationInSeconds;
        return Math.round(calories);
    };

    const calculateStepDistance = (steps, strideLengthMeters = 0.78) => {
        return Math.round(steps * strideLengthMeters); // returns meters
    };

    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!loadedUser && !error) {
        return (
            <div className="center">
                <Card>
                    <h2>Could not find user!</h2>
                </Card>
            </div>
        );
    }

    return <React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
        {!isLoading && loadedUser && (
            <div className='card-form'>
                <h2>Activity Tracker</h2>
                <p><strong>Device:</strong> {isMobile ? "Mobile" : "Desktop"}</p>
                <p><strong>Activity:</strong> {activity}</p>
                <p><strong>Speed:</strong> {speed} m/s</p>
                <p><strong>Estimated Steps:</strong> {Math.floor(steps)}</p>
                <p><strong>Acceleration:</strong> {isMobile ? acceleration : 'N/A'}</p>
                <p><strong>Last Updated:</strong> {new Date(lastChangeTime).toLocaleTimeString()}</p>
                <p><strong>Motion Permission:</strong>
                    {motionPermissionStatus === "pending" && " Requesting..."}
                    {motionPermissionStatus === "granted" && " Granted ✅"}
                    {motionPermissionStatus === "denied" && (
                        <>
                            Denied ❌ <button onClick={requestMotionPermission}>Retry Permission</button>
                        </>
                    )}
                </p>
                <div>
                    <h2>Activity List</h2>
                    {Object.entries(
                        activities.reduce((acc, a) => {
                            const dateKey = new Date(a.startedOn).toLocaleDateString(); // e.g., "6/5/2025"
                            if (!acc[dateKey]) acc[dateKey] = [];
                            acc[dateKey].push(a);
                            return acc;
                        }, {})
                    ).map(([date, items]) => (
                        <div key={date} className="activity-date-group">
                            <h3>{date}</h3>
                            <div className="table-wrapper">
                                <table className="activity-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Duration (sec)</th>
                                            <th>Calories</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((a) => (
                                            <tr key={a.id}>
                                                <td>{a.type}</td>
                                                <td>{a.duration}</td>
                                                <td>{a.caloriesBurned}</td>
                                                <td>{new Date(a.startedOn).toLocaleTimeString()}</td>
                                                <td>{new Date(a.endedOn).toLocaleTimeString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        )}
    </React.Fragment>;
}

export default ActivityTracker;
