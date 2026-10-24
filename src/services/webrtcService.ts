import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AnimalAvatar } from '../types';

export type CallType = 'voice' | 'video';
export type CallStatus = 'ringing' | 'connected' | 'ended' | 'declined';

export interface WebRTCCallData {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: AnimalAvatar;
  calleeId: string;
  calleeName: string;
  calleeAvatar: AnimalAvatar;
  type: CallType;
  status: CallStatus;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  createdAt: string;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCService {
  private pc: RTCPeerConnection | null = null;
  private unsubscribers: Unsubscribe[] = [];
  public currentCallId: string | null = null;

  /**
   * Initializes local peer connection and adds local media tracks
   */
  private createPeerConnection(
    onRemoteStream: (stream: MediaStream) => void,
    localStream?: MediaStream | null
  ): RTCPeerConnection {
    this.closePeerConnection();

    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.pc = pc;

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    const remoteStream = new MediaStream();
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      onRemoteStream(remoteStream);
    };

    return pc;
  }

  /**
   * Starts an outgoing call: creates offer & writes to Firestore
   */
  async startCall(params: {
    callerId: string;
    callerName: string;
    callerAvatar: AnimalAvatar;
    calleeId: string;
    calleeName: string;
    calleeAvatar: AnimalAvatar;
    type: CallType;
    localStream: MediaStream;
    onRemoteStream: (stream: MediaStream) => void;
    onCallConnected: () => void;
    onCallEnded: () => void;
  }): Promise<string> {
    const pc = this.createPeerConnection(params.onRemoteStream, params.localStream);

    const callDocRef = doc(collection(db, 'calls'));
    const callId = callDocRef.id;
    this.currentCallId = callId;

    const callerCandidatesCol = collection(callDocRef, 'callerCandidates');
    const calleeCandidatesCol = collection(callDocRef, 'calleeCandidates');

    // Send local ICE candidates to Firestore
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(callerCandidatesCol, event.candidate.toJSON()).catch(() => {});
      }
    };

    // Create SDP offer
    const offerDescription = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: params.type === 'video',
    });
    await pc.setLocalDescription(offerDescription);

    const offer: RTCSessionDescriptionInit = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    const callData: WebRTCCallData = {
      id: callId,
      callerId: params.callerId,
      callerName: params.callerName,
      callerAvatar: params.callerAvatar,
      calleeId: params.calleeId,
      calleeName: params.calleeName,
      calleeAvatar: params.calleeAvatar,
      type: params.type,
      status: 'ringing',
      offer,
      createdAt: new Date().toISOString(),
    };

    await setDoc(callDocRef, callData);

    // Listen for answer and call status updates from Callee
    const unsubDoc = onSnapshot(
      callDocRef,
      async (snapshot) => {
        const data = snapshot.data() as WebRTCCallData | undefined;
        if (!data) return;

        if (data.status === 'connected' && data.answer && !pc.currentRemoteDescription) {
          const answerDescription = new RTCSessionDescription(data.answer);
          await pc.setRemoteDescription(answerDescription);
          params.onCallConnected();
        }

        if (data.status === 'ended' || data.status === 'declined') {
          params.onCallEnded();
          this.cleanup();
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `calls/${callId}`);
      }
    );
    this.unsubscribers.push(unsubDoc);

    // Listen for remote ICE candidates added by callee
    const unsubCandidates = onSnapshot(
      calleeCandidatesCol,
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const candidateData = change.doc.data();
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidateData));
            } catch {
              // candidate buffer
            }
          }
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `calls/${callId}/calleeCandidates`);
      }
    );
    this.unsubscribers.push(unsubCandidates);

    return callId;
  }

  /**
   * Answers an incoming call: sets remote offer, creates answer & updates Firestore
   */
  async answerCall(params: {
    callId: string;
    localStream: MediaStream;
    onRemoteStream: (stream: MediaStream) => void;
    onCallConnected: () => void;
    onCallEnded: () => void;
  }): Promise<void> {
    this.currentCallId = params.callId;
    const callDocRef = doc(db, 'calls', params.callId);
    const callSnapshot = await getDoc(callDocRef);
    if (!callSnapshot.exists()) {
      throw new Error('La llamada ya no está disponible.');
    }

    const callData = callSnapshot.data() as WebRTCCallData;
    if (!callData.offer) {
      throw new Error('Oferta SDP no encontrada.');
    }

    const pc = this.createPeerConnection(params.onRemoteStream, params.localStream);

    const callerCandidatesCol = collection(callDocRef, 'callerCandidates');
    const calleeCandidatesCol = collection(callDocRef, 'calleeCandidates');

    // Send callee ICE candidates to Firestore
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(calleeCandidatesCol, event.candidate.toJSON()).catch(() => {});
      }
    };

    // Set remote offer
    await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));

    // Create SDP answer
    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer: RTCSessionDescriptionInit = {
      sdp: answerDescription.sdp,
      type: answerDescription.type,
    };

    await updateDoc(callDocRef, {
      answer,
      status: 'connected',
    });

    params.onCallConnected();

    // Listen for call status changes (e.g. caller hung up)
    const unsubDoc = onSnapshot(
      callDocRef,
      (snapshot) => {
        const data = snapshot.data() as WebRTCCallData | undefined;
        if (!data) return;
        if (data.status === 'ended') {
          params.onCallEnded();
          this.cleanup();
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `calls/${params.callId}`);
      }
    );
    this.unsubscribers.push(unsubDoc);

    // Listen for caller ICE candidates
    const unsubCandidates = onSnapshot(
      callerCandidatesCol,
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const candidateData = change.doc.data();
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidateData));
            } catch {
              // candidate buffer
            }
          }
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `calls/${params.callId}/callerCandidates`);
      }
    );
    this.unsubscribers.push(unsubCandidates);
  }

  /**
   * Declines or ends an ongoing call
   */
  async endCall(callId?: string, status: 'ended' | 'declined' = 'ended'): Promise<void> {
    const id = callId || this.currentCallId;
    if (id) {
      try {
        const callDocRef = doc(db, 'calls', id);
        await updateDoc(callDocRef, { status });
      } catch {
        // ignore if already deleted
      }
    }
    this.cleanup();
  }

  /**
   * Subscribes to incoming ringing calls for the current user
   */
  static listenForIncomingCalls(
    userId: string,
    onIncomingCall: (call: WebRTCCallData) => void
  ): Unsubscribe {
    const callsCol = collection(db, 'calls');
    const q = query(
      callsCol,
      where('calleeId', '==', userId),
      where('status', '==', 'ringing')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const callData = change.doc.data() as WebRTCCallData;
            onIncomingCall(callData);
          }
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'calls');
      }
    );
  }

  /**
   * Updates or replaces local media tracks in the active RTCPeerConnection
   */
  updateLocalStream(newStream: MediaStream): void {
    if (!this.pc) return;
    try {
      const senders = this.pc.getSenders();
      newStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track && s.track.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track).catch(() => {});
        } else {
          this.pc?.addTrack(track, newStream);
        }
      });
    } catch {
      // ignore
    }
  }

  cleanup(): void {
    this.unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch {
        // ignore
      }
    });
    this.unsubscribers = [];
    this.closePeerConnection();
    this.currentCallId = null;
  }

  private closePeerConnection(): void {
    if (this.pc) {
      try {
        this.pc.close();
      } catch {
        // ignore
      }
      this.pc = null;
    }
  }
}

export const webrtcService = new WebRTCService();
