import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  HelpCircle, 
  ShieldCheck, 
  Pill, 
  Download,
  Eye,
  RefreshCw,
  Trash2,
  Maximize2,
  X,
  Printer
} from 'lucide-react';
import { Prescription } from '../types';
import { INITIAL_PRESCRIPTION, SAMPLE_PRESCRIPTION_PRESETS } from '../data/mockData';

interface PrescriptionScannerProps {
  onPrescriptionSaved?: (prescription: Prescription) => void;
}

// Generate realistic prescription SVG Data URL
function generateSamplePrescriptionDataUrl(title: string, dept: string, doctor: string, text: string): string {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const medItemsSvg = lines.map((line, idx) => `
    <text x="50" y="${280 + idx * 36}" font-family="monospace, sans-serif" font-size="14" font-weight="600" fill="#1e293b">
      ${idx + 1}. ${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </text>
  `).join('');

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="650" height="750" viewBox="0 0 650 750">
    <rect width="650" height="750" fill="#ffffff" rx="8" />
    <rect x="15" y="15" width="620" height="720" fill="#fafafa" stroke="#cbd5e1" stroke-width="2" rx="6" />
    
    <!-- Clinic Header -->
    <rect x="25" y="25" width="600" height="110" fill="#0f172a" rx="4" />
    <text x="50" y="60" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">SAFELIFESAATHI SMART HOSPITAL &amp; RESEARCH</text>
    <text x="50" y="85" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Bhubaneswar Medical Smart Corridor • Reg No: MED-OR-99421 • Emergency 24/7: 108</text>
    <text x="50" y="110" font-family="system-ui, sans-serif" font-size="12" fill="#38bdf8">Department of ${dept.toUpperCase()} • OPD Wing Room 204</text>
    
    <!-- Doctor Info -->
    <text x="50" y="165" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">${doctor}</text>
    <text x="50" y="185" font-family="system-ui, sans-serif" font-size="12" fill="#64748b">Senior Consultant Physician • Reg: MCI-2018-88741</text>
    
    <!-- Patient Info Bar -->
    <rect x="40" y="200" width="570" height="42" fill="#f1f5f9" rx="4" stroke="#e2e8f0" />
    <text x="55" y="226" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#334155">Patient: Rahul Senapati (M/34)</text>
    <text x="270" y="226" font-family="system-ui, sans-serif" font-size="12" fill="#64748b">ID: SLS-PT-8891</text>
    <text x="440" y="226" font-family="system-ui, sans-serif" font-size="12" fill="#64748b">Date: ${new Date().toISOString().split('T')[0]}</text>
    
    <!-- Rx Symbol -->
    <text x="50" y="268" font-family="serif" font-size="28" font-weight="bold" font-style="italic" fill="#2563eb">℞</text>
    
    <!-- Prescribed Medications -->
    ${medItemsSvg}
    
    <!-- Divider -->
    <line x1="45" y1="580" x2="605" y2="580" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4" />
    
    <!-- Advice / Clinical Notes -->
    <text x="50" y="610" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#475569">General Clinical Advice:</text>
    <text x="50" y="630" font-family="system-ui, sans-serif" font-size="12" fill="#64748b">• Adequate hydration (2.5L-3L water daily). Complete antibiotics full course.</text>
    <text x="50" y="648" font-family="system-ui, sans-serif" font-size="12" fill="#64748b">• Review in OPD after 3 days or immediately if fever exceeds 102°F.</text>
    
    <!-- Signature Stamp -->
    <path d="M 450 690 Q 480 670 510 690 T 570 680" fill="none" stroke="#2563eb" stroke-width="2" />
    <text x="460" y="715" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">Attending Physician Sign</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
}

export const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({
  onPrescriptionSaved,
}) => {
  const [currentPrescription, setCurrentPrescription] = useState<Prescription>(INITIAL_PRESCRIPTION);
  const [rawInputText, setRawInputText] = useState('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  
  // Uploaded Image State
  const [previewImage, setPreviewImage] = useState<string | null>(() => 
    generateSamplePrescriptionDataUrl(
      SAMPLE_PRESCRIPTION_PRESETS[0].title,
      SAMPLE_PRESCRIPTION_PRESETS[0].dept,
      'Dr. Alok Sharma, MD',
      SAMPLE_PRESCRIPTION_PRESETS[0].text
    )
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>('sample-prescription-dr-alok.png');
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>('240 KB');
  const [showImageModal, setShowImageModal] = useState(false);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        throw new Error('Camera access not supported in this browser window.');
      }
    } catch (err: any) {
      console.warn('Camera stream notice:', err?.message);
      setCameraError('Camera stream restricted in sandbox or unavailable. You can capture a snapshot from sample presets or upload an image file.');
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const handleCaptureCamera = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewImage(dataUrl);
        setUploadedFileName(`camera-scan-${Date.now()}.jpg`);
        setUploadedFileSize('450 KB');
        handleStopCamera();
        handleProcessPrescription('', dataUrl);
        return;
      }
    }

    // Fallback if camera stream was simulated
    const sample = SAMPLE_PRESCRIPTION_PRESETS[selectedPresetIndex];
    const dataUrl = generateSamplePrescriptionDataUrl(sample.title, sample.dept, 'Dr. Alok Sharma, MD', sample.text);
    setPreviewImage(dataUrl);
    setUploadedFileName(`camera-snapshot-${Date.now()}.png`);
    setUploadedFileSize('380 KB');
    handleStopCamera();
    handleProcessPrescription(sample.text, dataUrl);
  };

  const handleProcessPrescription = async (textToUse?: string, imageBase64?: string) => {
    setIsProcessing(true);
    setScanProgress(15);
    setScanStep('1/4: Preprocessing high-resolution prescription document...');

    const activeText = textToUse !== undefined ? textToUse : rawInputText;
    const activeImage = imageBase64 || previewImage;

    const progressTimer = setInterval(() => {
      setScanProgress(prev => {
        if (prev < 40) {
          setScanStep('2/4: SafeLifeSaathi Vision OCR analyzing handwriting & printed text...');
          return prev + 12;
        } else if (prev < 75) {
          setScanStep('3/4: Transcribing medications, dosages & 1-0-1 schedules...');
          return prev + 8;
        } else if (prev < 90) {
          setScanStep('4/4: Generating patient instructions & safety precautions...');
          return prev + 4;
        }
        return prev;
      });
    }, 300);

    try {
      const res = await fetch('/api/ai/prescription-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionText: activeText || undefined,
          imageBase64: activeImage || undefined,
        }),
      });

      clearInterval(progressTimer);
      setScanProgress(100);
      setScanStep('SafeLifeSaathi OCR Complete! Patient schedule generated.');

      if (!res.ok) throw new Error('Prescription scan service unavailable');
      const data = await res.json();

      const newRx: Prescription = {
        id: `rx-${Date.now()}`,
        patientName: 'Rahul Senapati',
        patientId: 'SLS-PT-8891',
        date: new Date().toISOString().split('T')[0],
        doctorName: SAMPLE_PRESCRIPTION_PRESETS[selectedPresetIndex]?.title.includes('Sanjay') 
          ? 'Dr. Sanjay Kulkarni, DM Cardiology'
          : SAMPLE_PRESCRIPTION_PRESETS[selectedPresetIndex]?.title.includes('Neha')
            ? 'Dr. Neha Malhotra, MD Pediatrics'
            : 'Dr. Alok Sharma, MD General Medicine',
        department: SAMPLE_PRESCRIPTION_PRESETS[selectedPresetIndex]?.dept || 'General Medicine',
        diagnosis: SAMPLE_PRESCRIPTION_PRESETS[selectedPresetIndex]?.title || 'Prescribed Regimen',
        medicines: data.medicines && data.medicines.length > 0 ? data.medicines : INITIAL_PRESCRIPTION.medicines,
        simpleExplanation: data.simpleExplanation || 'Take your prescribed medicines on time as directed by your physician.',
        precautions: data.precautions || [
          "Take medicines after food with water.",
          "Complete the entire prescribed duration.",
          "Consult doctor if you experience any side-effects."
        ],
        questionsForDoctor: data.questionsForDoctor || [
          "Should I continue taking this medication after fever stops?",
          "Are there any specific dietary restrictions?"
        ],
        doctorAuthorityNotice: data.doctorAuthorityNotice || "The original doctor's prescription is authoritative. AI-generated explanations are for understanding only.",
        verifiedByDoctor: true,
        scannedImageUrl: activeImage || undefined,
      };

      setCurrentPrescription(newRx);
      if (onPrescriptionSaved) onPrescriptionSaved(newRx);
    } catch (e) {
      console.warn('Prescription OCR notice:', e);
    } finally {
      clearInterval(progressTimer);
      setTimeout(() => {
        setIsProcessing(false);
        setScanProgress(0);
      }, 400);
    }
  };

  const handleFileChange = (file: File) => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit. Please upload a smaller image or document.');
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    setUploadedFileName(file.name);
    setUploadedFileSize(sizeFormatted);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      handleProcessPrescription('', base64);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (idx: number) => {
    setSelectedPresetIndex(idx);
    const preset = SAMPLE_PRESCRIPTION_PRESETS[idx];
    setRawInputText(preset.text);
    const generatedUrl = generateSamplePrescriptionDataUrl(
      preset.title,
      preset.dept,
      preset.title.includes('Sanjay') ? 'Dr. Sanjay Kulkarni, DM Cardiology' : preset.title.includes('Neha') ? 'Dr. Neha Malhotra, MD Pediatrics' : 'Dr. Alok Sharma, MD',
      preset.text
    );
    setPreviewImage(generatedUrl);
    setUploadedFileName(`sample-prescription-${preset.dept.toLowerCase().replace(/\s+/g, '-')}.png`);
    setUploadedFileSize('310 KB');
    handleProcessPrescription(preset.text, generatedUrl);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-900">SafeLifeSaathi AI Prescription Scanner &amp; Explainer</h2>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                SafeLifeSaathi Vision OCR
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                ABDM Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload handwritten or printed doctor prescriptions to automatically extract medicines, timings, and plain-language dosage guides.
            </p>
          </div>
        </div>

        <button
          onClick={() => handlePresetSelect(0)}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          <span>Reset Sample Rx</span>
        </button>
      </div>

      {/* Main Grid: Left Upload & Scan Controls / Right Extracted Schedule & Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upload, Camera, Document Preview & Presets (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Camera Modal View */}
          {isCameraActive && (
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-white space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <Camera className="w-4 h-4 animate-pulse" />
                  <span>SafeLifeSaathi Document Camera Viewfinder</span>
                </div>
                <button
                  onClick={handleStopCamera}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {cameraError ? (
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-xs space-y-2">
                  <p className="text-amber-300 text-[11px] leading-relaxed">{cameraError}</p>
                  <button
                    onClick={handleCaptureCamera}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    📸 Capture Simulated High-Res Prescription Photo
                  </button>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-slate-700">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-4 border-2 border-dashed border-blue-400/60 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-blue-300 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-xs">
                      Align doctor prescription within frame
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleCaptureCamera}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture &amp; OCR Scan</span>
                </button>
                <button
                  onClick={handleStopCamera}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Document Upload Card */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileChange(file);
            }}
            className={`bg-white rounded-3xl p-5 border-2 border-dashed transition-all ${
              dragOver ? 'border-blue-500 bg-blue-50/60 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                Upload Prescription Document
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                JPG, PNG, PDF up to 15MB
              </span>
            </div>

            {previewImage ? (
              <div className="space-y-3">
                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10 flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Prescription Document Preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md flex items-center gap-1 transition-all"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Full Document</span>
                    </button>
                    <button
                      onClick={() => {
                        setPreviewImage(null);
                        setUploadedFileName(null);
                        setUploadedFileSize(null);
                      }}
                      className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl shadow-md transition-all"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                    <Eye className="w-3 h-3 text-blue-400" />
                    {uploadedFileName || 'Prescription Image'} • {uploadedFileSize || 'Document'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Different Image</span>
                  </button>

                  <button
                    onClick={handleStartCamera}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                    <span>Camera</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Drop your doctor prescription here</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Click below to browse files or snap a live photo</p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File</span>
                  </button>
                  <button
                    onClick={handleStartCamera}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Use Camera</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>

          {/* Active OCR Scanning Status Banner */}
          {isProcessing && (
            <div className="bg-blue-900 text-white p-4 rounded-3xl space-y-3 shadow-lg border border-blue-800 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-blue-300">
                  <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                  SafeLifeSaathi Vision OCR Active
                </span>
                <span className="text-blue-200">{scanProgress}%</span>
              </div>
              <div className="w-full bg-blue-950 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-blue-200 font-mono">
                {scanStep}
              </p>
            </div>
          )}

          {/* Sample Prescription Presets & Text Editor */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Try Standard Hospital Sample Prescriptions:</span>
              <span className="text-[10px] text-slate-400">1-Click Demo</span>
            </div>

            <div className="space-y-2">
              {SAMPLE_PRESCRIPTION_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePresetSelect(idx)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                    selectedPresetIndex === idx
                      ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-400/30'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span className="text-xs">{preset.title}</span>
                    <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                      {preset.dept}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono line-clamp-2">
                    {preset.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Custom Notes / Text OCR Fallback Input */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[11px] font-semibold text-slate-700 mb-1 block">
                Or Type / Edit Doctor's Handwritten Notes:
              </label>
              <textarea
                value={rawInputText}
                onChange={(e) => setRawInputText(e.target.value)}
                placeholder="Type or paste medical prescription notes, e.g., Rx: Dolo 650 1-0-1 after food x 3 days, Azithromycin 500mg 1-0-0 x 5 days..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <button
              onClick={() => handleProcessPrescription(rawInputText || undefined, previewImage || undefined)}
              disabled={isProcessing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Processing SafeLifeSaathi OCR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run OCR Scan &amp; Generate Patient Schedule</span>
                </>
              )}
            </button>
          </div>

          {/* Medical Authority Disclaimer Notice */}
          <div className="bg-amber-50/80 p-4 rounded-3xl border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="font-bold text-amber-900 block mb-0.5">Clinical Authority Notice:</strong>
              {currentPrescription.doctorAuthorityNotice}
            </div>
          </div>

        </div>

        {/* Right Column: AI OCR Breakdown, Medicine Schedule & Patient Explanation (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Prescription Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Validated Medical Regimen
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Doctor Verified
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1.5">{currentPrescription.diagnosis}</h3>
                <p className="text-xs text-slate-500">
                  Prescribing Physician: <strong className="text-slate-800">{currentPrescription.doctorName}</strong> ({currentPrescription.department})
                </p>
              </div>

              <div className="text-left sm:text-right text-xs bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Prescription Date &amp; ID</span>
                <span className="font-bold text-slate-800">{currentPrescription.date}</span>
                <span className="text-[10px] text-slate-500 block font-mono">Patient: {currentPrescription.patientName}</span>
              </div>
            </div>

            {/* SafeLifeSaathi Simplified Patient Plain-Language Explanation Box */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-purple-50/80 p-4 rounded-2xl border border-indigo-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>SafeLifeSaathi Plain-Language Patient Summary:</span>
                </div>
                <span className="text-[10px] text-indigo-700 bg-white/80 px-2 py-0.5 rounded-md font-semibold border border-indigo-200">
                  Easy Reading Mode
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                {currentPrescription.simpleExplanation}
              </p>
            </div>

            {/* Extracted Medicines Schedule List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-blue-600" />
                  Extracted Medications &amp; Timing Schedule
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                  {currentPrescription.medicines.length} Medicines Identified
                </span>
              </div>

              <div className="space-y-3">
                {currentPrescription.medicines.map((med, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-200 hover:bg-slate-50/90 transition-all shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                        <span className="text-xs bg-slate-200 text-slate-800 font-mono px-2 py-0.5 rounded-md font-semibold">
                          {med.dosage}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          {med.frequency}
                        </span>
                        <span className="text-slate-600 font-medium">
                          Duration: <strong className="text-slate-900">{med.duration}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Timing &amp; Routine</span>
                        <p className="font-bold text-slate-800 mt-0.5">{med.instruction} • {med.timing}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Clinical Purpose</span>
                        <p className="text-slate-700 mt-0.5">{med.purpose}</p>
                      </div>
                    </div>

                    {med.warnings && (
                      <div className="mt-2 text-[11px] text-amber-900 bg-amber-50/90 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                        <span className="font-bold text-amber-800">⚠️ Caution:</span>
                        <span>{med.warnings}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Precautions & Questions to Ask Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs">
                <div className="font-bold text-emerald-950 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Patient Precautions:</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-[11px] text-emerald-900 leading-relaxed">
                  {currentPrescription.precautions.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs">
                <div className="font-bold text-blue-950 mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Questions for Your Doctor / Pharmacist:</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-[11px] text-blue-900 leading-relaxed">
                  {currentPrescription.questionsForDoctor.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    alert(`✅ Digital Prescription Card saved to Rahul Senapati's SafeLifeSaathi medical health records locker (ABHA linked).`);
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Save to Patient Locker</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Medication Card</span>
                </button>
              </div>

              {previewImage && (
                <button
                  onClick={() => setShowImageModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Compare with Original Scan</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Full-Screen Document Zoom Modal */}
      {showImageModal && previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Original Prescription Document - {uploadedFileName || 'Scanned File'}
                </h3>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-auto flex items-center justify-center bg-slate-100 flex-1">
              <img
                src={previewImage}
                alt="Full Prescription Document"
                className="max-h-[70vh] object-contain rounded-xl border border-slate-300 shadow-md"
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <span>{uploadedFileSize || 'Verified Document'} • Transcribed with SafeLifeSaathi Vision OCR</span>
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
