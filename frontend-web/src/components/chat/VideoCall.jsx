import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  X,
  User,
} from "lucide-react";
import socketService from "../../services/socket";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import toast from "react-hot-toast";

const VideoCall = ({
  isOpen,
  onClose,
  callerData,
  isIncomingCall,
  userToCall,
  onCallEnded,
  isAudioOnly = false,
}) => {
  const currentUser = useSelector(selectCurrentUser);

  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(isAudioOnly);
  const [callDuration, setCallDuration] = useState(0);

  // Debug logging (only on mount/significant changes)
  // console.log("VideoCall Props:", {
  //   isIncomingCall,
  //   callerData,
  //   userToCall,
  //   isAudioOnly,
  //   currentUser,
  // });

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const ringtoneRef = useRef();
  const callTimerRef = useRef();

  useEffect(() => {
    if (!isOpen) return;

    // Play ringing sound for incoming calls
    if (isIncomingCall && !callAccepted) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const playRingtone = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 440; // A4 note
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      };

      const ringtoneInterval = setInterval(playRingtone, 2000);
      playRingtone(); // Play immediately

      ringtoneRef.current = ringtoneInterval;
    }

    // Get media stream - respect isAudioOnly parameter
    const mediaConstraints = {
      video: isAudioOnly ? false : { width: 1280, height: 720 },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };

    console.log("Requesting media with constraints:", mediaConstraints);

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((currentStream) => {
        console.log("Got media stream:", {
          id: currentStream.id,
          active: currentStream.active,
          audioTracks: currentStream.getAudioTracks().map((t) => ({
            id: t.id,
            label: t.label,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState,
          })),
          videoTracks: currentStream.getVideoTracks().map((t) => ({
            id: t.id,
            label: t.label,
            enabled: t.enabled,
            readyState: t.readyState,
          })),
        });
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error("Failed to get media stream:", err);
        toast.error(
          isAudioOnly
            ? "Could not access microphone"
            : "Could not access camera or microphone"
        );
        onClose();
      });

    // Handle call ended from other side
    socketService.onCallEnded(() => {
      setCallEnded(true);
      leaveCall(false); // Don't notify the other user as they ended it
      toast.success("Call ended");
    });

    return () => {
      // Cleanup
      socketService.removeListener("call_accepted");
      socketService.removeListener("call_ended");
      socketService.removeListener("ice_candidate");
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (ringtoneRef.current) {
        clearInterval(ringtoneRef.current);
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (connectionRef.current && !connectionRef.current.destroyed) {
        connectionRef.current.destroy();
      }
    };
  }, [isOpen]);

  // Initiate call if we are the caller
  useEffect(() => {
    if (isOpen && !isIncomingCall && stream && userToCall) {
      console.log(
        "VideoCall useEffect [initiate call] triggered. Caller initiating call."
      );
      const peer = new Peer({
        initiator: true,
        trickle: true, // Enable ICE trickle for better NAT traversal
        stream,
        config: {
          iceServers: [
            // Google STUN servers
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
            // Free public TURN servers
            {
              urls: "turn:openrelay.metered.ca:80",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turn:openrelay.metered.ca:443",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turn:openrelay.metered.ca:443?transport=tcp",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            // Numb Viagenie (Free)
            {
              urls: "turn:numb.viagenie.ca",
              username: "webrtc@live.com",
              credential: "muazkh",
            },
            // Anyfirewall (Free)
            {
              urls: "turn:turn.anyfirewall.com:443?transport=tcp",
              username: "webrtc",
              credential: "webrtc",
            },
            // Custom TURN server (commented out - causing connection failures)
            // Uncomment after setting up coturn properly
            // {
            //   urls: "turn:gyan.lekhaak.com:3478",
            //   username: "user",
            //   credential:
            //     "HJDSFYUHEW8EV7ERVYDFG7TGWE7F#YGFDYUG&DSHFYUSDGI%YDSFYF@YDGSYGSY",
            // },
          ],
        },
      });

      peer.on("signal", (data) => {
        console.log("Peer: signal generated.", data.type);

        // Send initial offer or ICE candidates
        if (data.type === "offer") {
          // Construct CALLER name from current user data
          let myName = "Unknown";

          if (currentUser?.first_name || currentUser?.last_name) {
            myName = `${currentUser.first_name || ""} ${
              currentUser.last_name || ""
            }`.trim();
          } else if (currentUser?.email) {
            myName = currentUser.email.split("@")[0];
          }

          console.log("Initiating call - sending offer to receiver:", {
            myName,
            to: userToCall.user_id || userToCall.id,
            from: currentUser.id,
          });

          socketService.callUser({
            userToCall: userToCall.user_id || userToCall.id,
            signalData: data,
            from: currentUser.id,
            name: myName,
          });
        } else if (data.candidate) {
          // Send ICE candidate (silently, no excessive logging)
          socketService.sendIceCandidate({
            to: userToCall.user_id || userToCall.id,
            candidate: data,
          });
        }
      });

      peer.on("stream", (currentStream) => {
        console.log("✅ Received remote stream (caller side):", {
          id: currentStream.id,
          active: currentStream.active,
          audioTracks: currentStream.getAudioTracks().map((t) => ({
            id: t.id,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState,
          })),
          videoTracks: currentStream.getVideoTracks().map((t) => ({
            id: t.id,
            enabled: t.enabled,
            readyState: t.readyState,
          })),
        });

        if (userVideo.current) {
          // Set the stream
          userVideo.current.srcObject = currentStream;

          // Ensure all tracks are enabled
          currentStream.getTracks().forEach((track) => {
            track.enabled = true;
          });

          // For video elements, ensure not muted (audio should play)
          if (userVideo.current.tagName === "VIDEO") {
            userVideo.current.muted = false;
            userVideo.current.volume = 1.0;
          }

          // Try to play with retry logic
          const attemptPlay = (retries = 3) => {
            userVideo.current
              .play()
              .then(() => {
                console.log("✅ Remote media playing successfully");
              })
              .catch((err) => {
                console.error(
                  `❌ Error playing remote media (${retries} retries left):`,
                  err.name,
                  err.message
                );

                if (retries > 0) {
                  // Retry after a short delay
                  setTimeout(() => attemptPlay(retries - 1), 500);
                } else {
                  // Last resort: show user a message to click
                  toast.error("Click anywhere to enable audio/video");

                  // Add one-time click listener to start playback
                  const playOnClick = () => {
                    userVideo.current
                      ?.play()
                      .then(() => {
                        console.log(
                          "✅ Playback started after user interaction"
                        );
                        toast.success("Audio/Video enabled!");
                      })
                      .catch((e) => console.error("Still failed:", e));
                    document.removeEventListener("click", playOnClick);
                  };
                  document.addEventListener("click", playOnClick, {
                    once: true,
                  });
                }
              });
          };

          attemptPlay();
        } else {
          console.warn("⚠️ userVideo ref is null");
        }
      });

      peer.on("connect", () => {
        console.log("🎉 Peer connection established (caller)!");
      });

      peer.on("error", (err) => {
        console.error("❌ Peer error (caller):", err);
        toast.error("Connection error: " + err.message);
      });

      // Monitor ICE connection state
      peer._pc.oniceconnectionstatechange = () => {
        console.log(
          "ICE connection state (caller):",
          peer._pc.iceConnectionState
        );
        if (peer._pc.iceConnectionState === "failed") {
          console.error("ICE connection failed - may need TURN server");
          toast.error("Connection failed. Please check your network.");
        }
      };

      socketService.onCallAccepted((signal) => {
        console.log("✅ Socket: call_accepted received. Signal:", signal);
        setCallAccepted(true);
        peer.signal(signal);
      });

      // Listen for ICE candidates from receiver
      const handleIceCandidate = (data) => {
        if (
          data.candidate &&
          connectionRef.current &&
          !connectionRef.current.destroyed
        ) {
          console.log("🧊 Received ICE candidate from receiver");
          try {
            connectionRef.current.signal(data.candidate);
          } catch (err) {
            console.warn("Failed to signal ICE candidate:", err.message);
          }
        }
      };

      socketService.onIceCandidate(handleIceCandidate);

      connectionRef.current = peer;
    }

    return () => {
      // Cleanup ICE candidate listener when call ends
      socketService.removeListener("ice_candidate");
    };
  }, [isOpen, isIncomingCall, stream, userToCall]);

  // Start call timer when call is accepted
  useEffect(() => {
    if (callAccepted && !callTimerRef.current) {
      console.log("Call accepted, starting call timer.");
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
  }, [callAccepted]);

  const answerCall = () => {
    console.log("Answering call...");
    setCallAccepted(true);

    // Stop ringtone
    if (ringtoneRef.current) {
      console.log("Stopping ringtone.");
      clearInterval(ringtoneRef.current);
    }

    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // CRITICAL: Ensure we have the stream before creating peer
    if (!stream) {
      console.error("No stream available when answering call");
      toast.error("Could not access microphone");
      return;
    }

    console.log("Answering call with stream:", {
      stream,
      audioTracks: stream.getAudioTracks(),
      videoTracks: stream.getVideoTracks(),
      callerData,
    });

    const peer = new Peer({
      initiator: false,
      trickle: true, // Enable ICE trickle
      stream: stream,
      config: {
        iceServers: [
          // Google STUN servers
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
          // Free public TURN servers
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          // Numb Viagenie (Free)
          {
            urls: "turn:numb.viagenie.ca",
            username: "webrtc@live.com",
            credential: "muazkh",
          },
          // Anyfirewall (Free)
          {
            urls: "turn:turn.anyfirewall.com:443?transport=tcp",
            username: "webrtc",
            credential: "webrtc",
          },
        ],
      },
    });

    peer.on("signal", (data) => {
      console.log("Peer (answerer): signal generated.", data);
      // Send answer or ICE candidates
      if (data.type === "answer") {
        socketService.answerCall({ signal: data, to: callerData.from });
      } else if (data.candidate) {
        // Send ICE candidate
        socketService.sendIceCandidate({
          to: callerData.from,
          candidate: data,
        });
      }
    });

    peer.on("stream", (currentStream) => {
      console.log("✅ Received remote stream (answerer side):", {
        id: currentStream.id,
        active: currentStream.active,
        audioTracks: currentStream.getAudioTracks().map((t) => ({
          id: t.id,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState,
        })),
        videoTracks: currentStream.getVideoTracks().map((t) => ({
          id: t.id,
          enabled: t.enabled,
          readyState: t.readyState,
        })),
      });

      if (userVideo.current) {
        // Set the stream
        userVideo.current.srcObject = currentStream;

        // Ensure all tracks are enabled
        currentStream.getTracks().forEach((track) => {
          track.enabled = true;
        });

        // For video elements, ensure not muted (audio should play)
        if (userVideo.current.tagName === "VIDEO") {
          userVideo.current.muted = false;
          userVideo.current.volume = 1.0;
        }

        // Try to play with retry logic
        const attemptPlay = (retries = 3) => {
          userVideo.current
            .play()
            .then(() => {
              console.log("✅ Remote media playing successfully");
            })
            .catch((err) => {
              console.error(
                `❌ Error playing remote media (${retries} retries left):`,
                err.name,
                err.message
              );

              if (retries > 0) {
                // Retry after a short delay
                setTimeout(() => attemptPlay(retries - 1), 500);
              } else {
                // Last resort: show user a message to click
                toast.error("Click anywhere to enable audio/video");

                // Add one-time click listener to start playback
                const playOnClick = () => {
                  userVideo.current
                    ?.play()
                    .then(() => {
                      console.log("✅ Playback started after user interaction");
                      toast.success("Audio/Video enabled!");
                    })
                    .catch((e) => console.error("Still failed:", e));
                  document.removeEventListener("click", playOnClick);
                };
                document.addEventListener("click", playOnClick, { once: true });
              }
            });
        };

        attemptPlay();
      } else {
        console.warn("⚠️ userVideo ref is null");
      }
    });

    peer.on("connect", () => {
      console.log("🎉 Peer connection established (answerer)!");
    });

    peer.on("error", (err) => {
      console.error("❌ Peer error (answerer):", err);
      toast.error("Connection error: " + err.message);
    });

    peer.on("close", () => {
      console.log("Peer closed (answerer)");
    });

    // Monitor ICE connection state
    peer._pc.oniceconnectionstatechange = () => {
      console.log(
        "ICE connection state (answerer):",
        peer._pc.iceConnectionState
      );
      if (peer._pc.iceConnectionState === "failed") {
        console.error("ICE connection failed - may need TURN server");
        toast.error("Connection failed. Please check your network.");
      } else if (peer._pc.iceConnectionState === "connected") {
        console.log("✅ ICE connection successful!");
      }
    };

    // Listen for ICE candidates from caller
    const handleIceCandidate = (data) => {
      if (
        data.candidate &&
        connectionRef.current &&
        !connectionRef.current.destroyed
      ) {
        console.log("🧊 Received ICE candidate from caller");
        try {
          connectionRef.current.signal(data.candidate);
        } catch (err) {
          console.warn("Failed to signal ICE candidate:", err.message);
        }
      }
    };

    socketService.onIceCandidate(handleIceCandidate);

    // Signal AFTER all event handlers are set up
    console.log("Signaling with caller's signal data");
    peer.signal(callerData.signal);

    connectionRef.current = peer;
  };
  const leaveCall = (notifyOtherUser = true) => {
    setCallEnded(true);

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Clear timers
    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current);
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    // ALWAYS notify other user when ending call
    if (notifyOtherUser) {
      const otherUserId = isIncomingCall
        ? callerData.from
        : userToCall?.user_id || userToCall?.id;
      if (otherUserId) {
        console.log("Sending end_call to:", otherUserId);
        socketService.endCall({ to: otherUserId });
      }
    }

    onCallEnded();
    onClose();
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full max-w-4xl h-full max-h-[90vh] flex flex-col p-4">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="text-white">
            <h2 className="text-xl font-semibold">
              {isAudioOnly
                ? isIncomingCall
                  ? callAccepted
                    ? `Audio call with ${callerData?.name || "Unknown"}`
                    : `Incoming audio call from ${
                        callerData?.name || "Unknown"
                      }...`
                  : callAccepted
                  ? `Audio call with ${userToCall?.name || "Unknown"}`
                  : `Calling ${userToCall?.name || "Unknown"}...`
                : isIncomingCall
                ? callAccepted
                  ? `Video call with ${callerData?.name || "Unknown"}`
                  : `Incoming call from ${callerData?.name || "Unknown"}...`
                : callAccepted
                ? `Video call with ${userToCall?.name || "Unknown"}`
                : `Calling ${userToCall?.name || "Unknown"}...`}
            </h2>
            {callAccepted && (
              <p className="text-sm text-gray-300 mt-1">
                {formatDuration(callDuration)}
              </p>
            )}
          </div>
          <button
            onClick={() => leaveCall(true)}
            className="p-2 bg-red-600 rounded-full hover:bg-red-700"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 items-center justify-center relative">
          {/* My Video (Small overlay or side-by-side) */}
          <div
            className={`relative ${
              callAccepted
                ? "w-32 h-48 absolute bottom-20 right-4 md:static md:w-1/2 md:h-full"
                : "w-full h-full"
            } bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300`}
          >
            {!isAudioOnly && stream ? (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Mic className="w-16 h-16 text-white mx-auto mb-2" />
                  <p className="text-white text-sm">Audio Only</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
              You {isMuted && "(Muted)"}
            </div>
          </div>

          {/* User Video */}
          {callAccepted && !callEnded && (
            <div className="relative w-full h-full md:w-1/2 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              {!isAudioOnly ? (
                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  className="w-full h-full object-cover"
                  onLoadedMetadata={(e) => {
                    console.log("Remote video metadata loaded");
                    e.target
                      .play()
                      .catch((err) =>
                        console.error("Error playing remote video:", err)
                      );
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <User className="w-24 h-24 text-white mx-auto mb-4" />
                    <p className="text-white text-lg">
                      {isIncomingCall ? callerData.name : userToCall?.name}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">Audio Call</p>
                    {/* Hidden audio element for audio-only calls */}
                    <audio
                      ref={userVideo}
                      autoPlay
                      playsInline
                      onLoadedMetadata={(e) => {
                        console.log("Remote audio metadata loaded");
                        e.target
                          .play()
                          .catch((err) =>
                            console.error("Error playing remote audio:", err)
                          );
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                {isIncomingCall ? callerData.name : userToCall?.name}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex justify-center space-x-6">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full ${
              isMuted ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"
            } text-white transition-colors`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          {!isAudioOnly && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full ${
                isVideoOff ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"
              } text-white transition-colors`}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </button>
          )}

          {isIncomingCall && !callAccepted && (
            <button
              onClick={answerCall}
              className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white animate-pulse"
            >
              <Phone className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={() => leaveCall(true)}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
