import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [emotion, setEmotion] = useState("");

    useEffect(() => {
        const runFacialLandmarksModel = async () => {
            // Loading the face landmarks detection model with runtime 'tfjs'
            const model = await faceLandmarksDetection.createDetector(
                faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
                {
                    runtime: 'tfjs',
                }
            );

            const detect = async () => {
                if (
                    webcamRef.current &&
                    webcamRef.current.video.readyState === 4
                ) {
                    const video = webcamRef.current.video;
                    const videoWidth = video.videoWidth;
                    const videoHeight = video.videoHeight;

                    webcamRef.current.video.width = videoWidth;
                    webcamRef.current.video.height = videoHeight;

                    canvasRef.current.width = videoWidth;
                    canvasRef.current.height = videoHeight;

                    const faces = await model.estimateFaces(video);

                    const ctx = canvasRef.current.getContext("2d");
                    ctx.clearRect(0, 0, videoWidth, videoHeight);
                    ctx.strokeStyle = "#00FF00";
                    ctx.lineWidth = 2;

                    if (faces.length > 0) {
                        faces.forEach((face) => {
                        face.keypoints.forEach(({ x, y }) => {
                            ctx.beginPath();
                            ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
                            ctx.stroke();
                        });
                        });

                        // Simple emotion detection logic based on facial expressions
                        const emotionPrediction = predictEmotion(faces[0]);
                        setEmotion(emotionPrediction);
                    }
                }
            };

            setInterval(detect, 100);
        };

        runFacialLandmarksModel();
    }, []);

    const predictEmotion = (face) => {
        const landmarks = face.keypoints;
        // console.log(landmarks);

        const topLip = landmarks[13]; // y-coordinate of top lip
        const bottomLip = landmarks[14]; // y-coordinate of bottom lip

        const left_brow = landmarks[107]; // y-coordinate of bottom lip
        const right_brow = landmarks[336]; // y-coordinate of bottom lip

        const distance = Math.abs(topLip.y - bottomLip.y);

        if (distance >  9) {
            console.log('Happy');
            return "Happy"; // Larger distance indicates smile
        } else if (distance > 5) {
            console.log('Neutral');
            return "Neutral"; // Medium distance indicates neutral
        } else if (
            Math.abs(left_brow.x - right_brow.x) > 15
        ) {
            console.log('Angry');
            return 'Angry'; // Small distance indicates sadness or anger
        }
    };

    return (
        <div className="App">
            <main className="container">
                <div className="bg-body-tertiary p-5 rounded mt-3">
                    <h1>Emotion Detection with Facial Landmarks</h1>
                    <p className="lead">
                        This project uses TensorFlow.js and MediaPipe to detect facial landmarks and predict emotions based on facial expressions.
                    </p>
                    <a className="btn btn-lg btn-primary" href="/docs/5.3/components/navbar/" role="button">Github Link »</a>
                </div>
            </main>
            <div className="container">
                <div className="row">
                    {/* Detection */}
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Facial Emotion Detection</h5>
                                <p className="card-text">Detected Emotion: {emotion}</p>
                            </div>
                        </div>
                    </div>
                    {/* Canvas */}
                    <div className="col-md-6 position-relative">
                        {/* height:`${17}rem`,  */}
                        <Webcam ref={webcamRef}  
                        style={{ position: "absolute", left: 0, top: 0 }} />
                        <canvas
                            ref={canvasRef}
                            style={{  position: "absolute", left: 0, top: 0 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
