import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  className?: string;
  label?: string;
}

export function FileUpload({
  onFileSelect,
  acceptedFileTypes = ".csv, .xlsx, .pdf, .doc, .docx, .txt",
  maxSizeMB = 10,
  className = "",
  label = "Upload past negotiation data"
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds the ${maxSizeMB}MB limit.`);
      return false;
    }
    
    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const acceptedTypes = acceptedFileTypes.split(',').map(type => type.trim());
    
    if (!acceptedTypes.some(type => 
      type === fileExtension || 
      type === file.type || 
      type === "*" || 
      type === ".*"
    )) {
      setError(`Invalid file type. Accepted types: ${acceptedFileTypes}`);
      return false;
    }
    
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`file-drop-area border-2 border-dashed p-8 rounded-md text-center cursor-pointer transition-all duration-200 ${
        isDragOver ? "border-primary bg-primary/5" : "border-neutral-200"
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        className="hidden"
        accept={acceptedFileTypes}
        onChange={handleFileInput}
        ref={fileInputRef}
      />
      
      {selectedFile ? (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Check size={20} />
          </div>
          <p className="text-neutral-600 font-medium">{selectedFile.name}</p>
          <p className="text-neutral-400 text-sm mt-1">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            Change File
          </Button>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
            <Upload size={24} />
          </div>
          <p className="text-neutral-600 font-medium">Drag & drop {label}</p>
          <p className="text-neutral-400 text-sm">or</p>
          <Button variant="secondary" size="sm" className="mt-3">
            Browse Files
          </Button>
          <p className="text-neutral-400 text-xs mt-3">
            Accepted file types: {acceptedFileTypes}
          </p>
        </>
      )}
      
      {error && (
        <div className="mt-3 flex items-center text-red-500 text-sm">
          <AlertTriangle size={16} className="mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}
